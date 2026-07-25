export interface ThrustPoint {
  time: number;
  thrust: number; // in Newtons
}

export interface MotorConfig {
  id: string;
  name: string; // e.g., "C6-5"
  manufacturer: string; // e.g., "Estes"
  totalMass: number | string; // in grams
  propellantMass: number | string; // in grams
  burnTime: number | string; // in seconds
  thrustPoints: ThrustPoint[];
  delayTime: number | string; // delay in seconds before ejection charge
}

export interface RocketSpecs {
  name: string;
  bodyDiameterMm: number | string; // mm
  lengthCm: number | string; // cm
  emptyMassG: number | string; // grams (excluding motor)
  dragCoefficient: number | string; // Cd
  noseConeShape: "conical" | "ogive" | "parabolic";
  finCount: number | string;
  finSpanCm: number | string;
  finRootChordCm: number | string;
  parachuteDiameterCm: number | string;
  parachuteCd: number | string;
}

export interface EnvironmentSpecs {
  launchGuideLengthM: number | string;
  launchAngleDeg: number | string; // angle from vertical (0 means straight up)
  launchAzimuthDeg: number | string; // direction of tilt (0 = North, 90 = East, 180 = South, 270 = West)
  windSpeedMs: number | string; // m/s
  windDirectionDeg: number | string; // direction wind is coming FROM (0 = North, etc.)
  windGustiness: number | string; // 0 to 1 scale for prediction ellipse size
}

export interface SimState {
  time: number; // s
  position: [number, number, number]; // [x, y, z] in meters (x = East, y = North, z = Altitude)
  velocity: [number, number, number]; // [vx, vy, vz] in m/s
  acceleration: [number, number, number]; // [ax, ay, az] in m/s^2
  mass: number; // current mass in kg
  thrust: number; // current thrust in N
  drag: number; // current drag force magnitude in N
  stage: "GUIDE" | "POWERED" | "COAST" | "PARACHUTE" | "LANDED";
}

export interface SimResults {
  timeline: SimState[];
  summary: {
    maxAltitude: number; // m
    maxVelocity: number; // m/s
    maxAcceleration: number; // m/s^2
    burnoutAltitude: number; // m
    burnoutTime: number; // s
    apogeeTime: number; // s
    ejectionTime: number; // s
    landingTime: number; // s
    groundHitVelocity: number; // m/s
    driftDistance: number; // m
    driftDirection: number; // degrees
    stableOffRod: boolean; // is velocity > 15 m/s at guide departure?
    velocityOffRod: number; // m/s
    predictedLandingZone: {
      center: [number, number]; // [x, y] in meters relative to launch pad
      radiusX: number; // uncertainty radius major axis (meters)
      radiusY: number; // uncertainty radius minor axis (meters)
      angle: number; // rotation angle of landing ellipse
    };
  };
}

export interface FlightLog {
  id: string;
  timestamp: string; // date string
  rocketSpecs: RocketSpecs;
  motorConfig: MotorConfig;
  envSpecs: EnvironmentSpecs;
  results: SimResults;
}
