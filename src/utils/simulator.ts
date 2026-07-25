import { RocketSpecs, MotorConfig, EnvironmentSpecs, SimState, SimResults, ThrustPoint } from "../types";

const G = 9.80665; // m/s^2
const AIR_DENSITY_SEA_LEVEL = 1.225; // kg/m^3

// Helper to interpolate thrust at a given time
function getThrustAtTime(time: number, points: ThrustPoint[]): number {
  if (points.length === 0) return 0;
  if (time <= points[0].time) return points[0].thrust;
  if (time >= points[points.length - 1].time) return 0;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (time >= p1.time && time <= p2.time) {
      const fraction = (time - p1.time) / (p2.time - p1.time);
      return p1.thrust + fraction * (p2.thrust - p1.thrust);
    }
  }
  return 0;
}

// Get air density at altitude (Standard Atmosphere Model approximation)
function getAirDensity(altitude: number): number {
  if (altitude < 0) altitude = 0;
  // standard scale height is about 8400 meters
  return AIR_DENSITY_SEA_LEVEL * Math.exp(-altitude / 8400);
}

// Run the core flight simulation
export function runSimulation(
  rocket: RocketSpecs,
  motor: MotorConfig,
  env: EnvironmentSpecs,
  customWindSpeed?: number,
  customWindDir?: number,
  skipLandingEllipse: boolean = false
): SimResults {
  const timeline: SimState[] = [];
  
  // Convert inputs to SI units safely (handles strings and zero values)
  const bodyDiameterMm = Number(rocket.bodyDiameterMm) || 0;
  const emptyMassG = Number(rocket.emptyMassG) || 0;
  const motorTotalMassG = Number(motor.totalMass) || 0;
  const propellantMassG = Number(motor.propellantMass) || 0;
  const parachuteDiameterCm = Number(rocket.parachuteDiameterCm) || 0;
  const launchAngleDeg = Number(env.launchAngleDeg) || 0;
  const launchAzimuthDeg = Number(env.launchAzimuthDeg) || 0;
  const burnTime = Number(motor.burnTime) || 0;
  const delayTime = Number(motor.delayTime) || 0;
  const dragCoefficient = Number(rocket.dragCoefficient) || 0;
  const parachuteCd = Number(rocket.parachuteCd) || 0;
  const launchGuideLengthM = Number(env.launchGuideLengthM) || 0;

  const bodyDiameterM = bodyDiameterMm / 1000;
  const rocketArea = Math.PI * Math.pow(bodyDiameterM / 2, 2);
  const emptyMassKg = emptyMassG / 1000;
  const motorTotalMassKg = motorTotalMassG / 1000;
  const propellantMassKg = propellantMassG / 1000;
  
  const parachuteDiameterM = parachuteDiameterCm / 100;
  const parachuteArea = Math.PI * Math.pow(parachuteDiameterM / 2, 2);

  const launchAngleRad = (launchAngleDeg * Math.PI) / 180;
  const launchAzimuthRad = (launchAzimuthDeg * Math.PI) / 180;

  // Launch rod direction vector (Unit Vector)
  // x = East, y = North, z = Up
  const rodDir: [number, number, number] = [
    Math.sin(launchAngleRad) * Math.sin(launchAzimuthRad),
    Math.sin(launchAngleRad) * Math.cos(launchAzimuthRad),
    Math.cos(launchAngleRad),
  ];

  // Wind setup
  const finalWindSpeed = customWindSpeed !== undefined ? customWindSpeed : (Number(env.windSpeedMs) || 0);
  const finalWindDir = customWindDir !== undefined ? customWindDir : (Number(env.windDirectionDeg) || 0);
  
  // Wind direction is the direction wind is coming FROM. 
  // Let's compute wind travel direction (180 deg opposite)
  const windTravelRad = ((finalWindDir + 180) % 360) * Math.PI / 180;
  const windVelocity: [number, number, number] = [
    finalWindSpeed * Math.sin(windTravelRad),
    finalWindSpeed * Math.cos(windTravelRad),
    0,
  ];

  // Simulation variables
  let time = 0;
  const dt = 0.01; // 10ms steps for integration
  
  let posX = 0, posY = 0, posZ = 0;
  let velX = 0, velY = 0, velZ = 0;
  
  let hasLeftRod = false;
  let rodDepartureVelocity = 0;
  let rodDepartureTime = 0;
  let apogeeReached = false;
  let apogeeAltitude = 0;
  let apogeeTime = 0;
  let parachuteDeployed = false;
  let parachuteDeploymentTime = 0;
  
  let burnoutTime = 0;
  let burnoutAltitude = 0;
  let maxVel = 0;
  let maxAcc = 0;

  // Let's integrate until the rocket hits the ground (posZ < 0 after launching)
  // Or safety limit of 1000 seconds
  const maxSimSteps = 100000; 
  let steps = 0;

  // Store initial state
  timeline.push({
    time: 0,
    position: [0, 0, 0],
    velocity: [0, 0, 0],
    acceleration: [0, 0, 0],
    mass: emptyMassKg + motorTotalMassKg,
    thrust: 0,
    drag: 0,
    stage: "GUIDE",
  });

  const ejectionTriggerTime = burnTime + delayTime;

  while (steps < maxSimSteps) {
    steps++;
    const prevTime = time;
    time += dt;

    // 1. Calculate mass at current time
    let currentPropellantKg = 0;
    if (burnTime > 0 && time <= burnTime) {
      currentPropellantKg = propellantMassKg * (1 - time / burnTime);
    } else {
      currentPropellantKg = 0;
    }
    const currentMassKg = emptyMassKg + (motorTotalMassKg - propellantMassKg) + currentPropellantKg;

    // 2. Compute forces
    // Thrust
    const currentThrustN = getThrustAtTime(time, motor.thrustPoints);
    
    // Wind relative velocity
    const relVelX = velX - windVelocity[0];
    const relVelY = velY - windVelocity[1];
    const relVelZ = velZ - windVelocity[2];
    const relSpeed = Math.sqrt(relVelX * relVelX + relVelY * relVelY + relVelZ * relVelZ);

    // Rocket orientation (unit vector)
    let orientX = rodDir[0];
    let orientY = rodDir[1];
    let orientZ = rodDir[2];

    const currentGuideDistance = Math.sqrt(posX * posX + posY * posY + posZ * posZ);
    const isStillOnRod = currentGuideDistance < launchGuideLengthM && !hasLeftRod;

    if (!isStillOnRod) {
      if (!hasLeftRod) {
        hasLeftRod = true;
        rodDepartureVelocity = Math.sqrt(velX * velX + velY * velY + velZ * velZ);
        rodDepartureTime = prevTime;
      }
      
      // If we are flying, rocket stabilizes along relative velocity vector (weathercocks into the wind)
      if (relSpeed > 0.1) {
        orientX = relVelX / relSpeed;
        orientY = relVelY / relSpeed;
        orientZ = relVelZ / relSpeed;
      }
    }

    // Gravity Force
    const Fg_z = -currentMassKg * G;

    // Drag Force
    const density = getAirDensity(posZ);
    let currentCd = dragCoefficient;
    let currentArea = rocketArea;

    // Ejection charge delay check & apogee check
    if (posZ > apogeeAltitude) {
      apogeeAltitude = posZ;
      apogeeTime = time;
    } else if (posZ < apogeeAltitude && !apogeeReached) {
      apogeeReached = true;
    }

    // Check parachute deployment.
    // Usually parachute deploys at the ejection delay trigger or at apogee, whichever comes first 
    // or as specified by model rocketry physics. In real rocketry, motor delay fires ejection charge.
    const delayHasFired = time >= ejectionTriggerTime;
    
    // Ejection charge fires at delay, or if the rocket has started falling and we want safety fallback.
    if ((delayHasFired || (apogeeReached && velZ < -2)) && !parachuteDeployed) {
      parachuteDeployed = true;
      parachuteDeploymentTime = time;
    }

    let flightStage: "GUIDE" | "POWERED" | "COAST" | "PARACHUTE" | "LANDED" = "GUIDE";
    
    if (parachuteDeployed) {
      flightStage = "PARACHUTE";
      currentCd = parachuteCd;
      currentArea = parachuteArea;
    } else if (currentThrustN > 0) {
      flightStage = isStillOnRod ? "GUIDE" : "POWERED";
    } else {
      flightStage = "COAST";
    }

    // Drag Force Magnitude
    const dragForceMag = 0.5 * density * relSpeed * relSpeed * currentArea * currentCd;
    
    // Drag Force vector points opposite to relative velocity
    let Fd_x = 0;
    let Fd_y = 0;
    let Fd_z = 0;
    if (relSpeed > 0.001) {
      Fd_x = -dragForceMag * (relVelX / relSpeed);
      Fd_y = -dragForceMag * (relVelY / relSpeed);
      Fd_z = -dragForceMag * (relVelZ / relSpeed);
    }

    // Thrust Force Vector
    let Ft_x = 0;
    let Ft_y = 0;
    let Ft_z = 0;
    
    if (currentThrustN > 0) {
      Ft_x = currentThrustN * orientX;
      Ft_y = currentThrustN * orientY;
      Ft_z = currentThrustN * orientZ;
    }

    // Total Forces
    let Ftotal_x = Ft_x + Fd_x;
    let Ftotal_y = Ft_y + Fd_y;
    let Ftotal_z = Ft_z + Fd_z + Fg_z;

    // If on rod, motion is constrained to the rod vector only!
    if (isStillOnRod) {
      // Net force along rod direction
      const Ftotal_dot_rod = Ftotal_x * rodDir[0] + Ftotal_y * rodDir[1] + Ftotal_z * rodDir[2];
      
      if (Ftotal_dot_rod > 0) {
        // Accelerating upward along rod
        Ftotal_x = Ftotal_dot_rod * rodDir[0];
        Ftotal_y = Ftotal_dot_rod * rodDir[1];
        Ftotal_z = Ftotal_dot_rod * rodDir[2];
      } else {
        // Not enough thrust to move yet
        Ftotal_x = 0;
        Ftotal_y = 0;
        Ftotal_z = 0;
        velX = 0;
        velY = 0;
        velZ = 0;
      }
    }

    // Acceleration (guaranteed safe from division by zero)
    const safeMassKg = Math.max(0.0001, currentMassKg);
    const accX = Ftotal_x / safeMassKg;
    const accY = Ftotal_y / safeMassKg;
    const accZ = Ftotal_z / safeMassKg;

    const accMag = Math.sqrt(accX * accX + accY * accY + accZ * accZ);
    if (accMag > maxAcc) maxAcc = accMag;

    // Velocity update (Euler-Cromer integration)
    velX += accX * dt;
    velY += accY * dt;
    velZ += accZ * dt;

    const velMag = Math.sqrt(velX * velX + velY * velY + velZ * velZ);
    if (velMag > maxVel) maxVel = velMag;

    // Position update
    posX += velX * dt;
    posY += velY * dt;
    posZ += velZ * dt;

    // Check burnout
    if (burnTime > 0 && prevTime <= burnTime && time > burnTime) {
      burnoutTime = prevTime;
      burnoutAltitude = posZ;
    }

    // Check landing
    if (posZ <= 0 && steps > 10) {
      posZ = 0;
      velX = 0;
      velY = 0;
      velZ = 0;
      
      timeline.push({
        time,
        position: [posX, posY, posZ],
        velocity: [0, 0, 0],
        acceleration: [0, 0, 0],
        mass: currentMassKg,
        thrust: 0,
        drag: 0,
        stage: "LANDED"
      });
      break;
    }

    // Record timeline state (throttle to 100Hz to save memory/rendering)
    timeline.push({
      time,
      position: [posX, posY, posZ],
      velocity: [velX, velY, velZ],
      acceleration: [accX, accY, accZ],
      mass: currentMassKg,
      thrust: currentThrustN,
      drag: dragForceMag,
      stage: flightStage,
    });
  }

  // Calculate ground drift distance
  const driftDistance = Math.sqrt(posX * posX + posY * posY);
  let driftDirection = (Math.atan2(posX, posY) * 180) / Math.PI;
  if (driftDirection < 0) driftDirection += 360;

  // Let's calculate the dynamic landing zone prediction circle
  // We simulate 4 outer bounds (wind variation and parachute variation) to build the ellipse
  const landingZone = skipLandingEllipse
    ? { center: [posX, posY] as [number, number], radiusX: 15, radiusY: 15, angle: 0 }
    : calculateLandingEllipse(rocket, motor, env, posX, posY);

  return {
    timeline,
    summary: {
      maxAltitude: apogeeAltitude,
      maxVelocity: maxVel,
      maxAcceleration: maxAcc / G, // in Gs
      burnoutAltitude,
      burnoutTime,
      apogeeTime,
      ejectionTime: parachuteDeploymentTime || ejectionTriggerTime,
      landingTime: time,
      groundHitVelocity: timeline[timeline.length - 2] ? Math.sqrt(
        Math.pow(timeline[timeline.length - 2].velocity[0], 2) +
        Math.pow(timeline[timeline.length - 2].velocity[1], 2) +
        Math.pow(timeline[timeline.length - 2].velocity[2], 2)
      ) : 0,
      driftDistance,
      driftDirection,
      stableOffRod: rodDepartureVelocity >= 15,
      velocityOffRod: rodDepartureVelocity,
      predictedLandingZone: landingZone,
    }
  };
}

// Predicts landing uncertainty ellipse by running faster/simplified simulations
function calculateLandingEllipse(
  rocket: RocketSpecs,
  motor: MotorConfig,
  env: EnvironmentSpecs,
  nominalX: number,
  nominalY: number
): { center: [number, number]; radiusX: number; radiusY: number; angle: number } {
  const windSpeedMs = Number(env.windSpeedMs) || 0;
  const windDirectionDeg = Number(env.windDirectionDeg) || 0;
  const windGustiness = Number(env.windGustiness) || 0;

  // If wind speed is very low, make it a simple circle
  if (windSpeedMs < 0.1) {
    return {
      center: [nominalX, nominalY],
      radiusX: 15,
      radiusY: 15,
      angle: 0,
    };
  }

  // Run two extreme wind simulations
  // 1. Higher wind (+40% speed)
  // 2. Lower wind (-40% speed)
  // We'll also rotate wind angle by +/- 20 degrees to find sideways dispersion
  const gustMultiplier = 1 + 0.5 * windGustiness;
  const lulMultiplier = Math.max(0.1, 1 - 0.5 * windGustiness);

  const simHighWind = runSimulation(rocket, motor, env, windSpeedMs * gustMultiplier, windDirectionDeg + 15, true);
  const simLowWind = runSimulation(rocket, motor, env, windSpeedMs * lulMultiplier, windDirectionDeg - 15, true);

  const highP = simHighWind.timeline[simHighWind.timeline.length - 1].position;
  const lowP = simLowWind.timeline[simLowWind.timeline.length - 1].position;

  // Center is average of nominal, high and low
  const avgX = (nominalX + highP[0] + lowP[0]) / 3;
  const avgY = (nominalY + highP[1] + lowP[1]) / 3;

  // Calculate dispersion
  const dx = highP[0] - lowP[0];
  const dy = highP[1] - lowP[1];
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Radius major axis along the wind drift line
  const radiusX = Math.max(20, distance / 1.5);
  // Radius minor axis across the wind (typically smaller)
  const radiusY = Math.max(15, radiusX * 0.4);

  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angle < 0) angle += 360;

  return {
    center: [avgX, avgY],
    radiusX,
    radiusY,
    angle,
  };
}
