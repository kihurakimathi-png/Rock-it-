import React, { useRef, useState, useEffect } from "react";
import { SimResults, SimState } from "../types";
import { Play, Pause, RotateCcw, Compass, ZoomIn, ZoomOut, Maximize2, ShieldAlert } from "lucide-react";

interface Visualizer3DProps {
  results: SimResults;
}

export default function Visualizer3D({ results }: Visualizer3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Playback States
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2); // 2x default for exciting simulation

  // Camera States
  const [yaw, setYaw] = useState<number>(-0.6); // Yaw angle in radians (horizontal rotation)
  const [pitch, setPitch] = useState<number>(0.5); // Pitch angle in radians (vertical tilt)
  const [zoom, setZoom] = useState<number>(1.0); // Zoom multiplier
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  // Dragging camera states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const timeline = results.timeline;
  const maxTime = timeline.length > 0 ? timeline[timeline.length - 1].time : 0;
  const summary = results.summary;

  // Auto-reset when new results arrive
  useEffect(() => {
    setPlaybackTime(0);
    setIsPlaying(true);
  }, [results]);

  // Animation Frame Loop
  useEffect(() => {
    let animationId: number;

    const tick = () => {
      if (isPlaying) {
        setPlaybackTime((prev) => {
          let next = prev + (0.016 * playbackSpeed); // approximate 60fps
          if (next >= maxTime) {
            next = maxTime;
            setIsPlaying(false);
          }
          return next;
        });
      }

      if (autoRotate) {
        setYaw((prev) => (prev + 0.005) % (Math.PI * 2));
      }

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, playbackSpeed, maxTime, autoRotate]);

  // Find simulated state at given time
  const getCurrentState = (t: number): SimState => {
    if (timeline.length === 0) {
      return {
        time: 0,
        position: [0, 0, 0],
        velocity: [0, 0, 0],
        acceleration: [0, 0, 0],
        mass: 0,
        thrust: 0,
        drag: 0,
        stage: "LANDED",
      };
    }
    // Simple linear interpolation
    for (let i = 0; i < timeline.length - 1; i++) {
      if (t >= timeline[i].time && t <= timeline[i + 1].time) {
        const ratio = (t - timeline[i].time) / (timeline[i + 1].time - timeline[i].time);
        const p1 = timeline[i];
        const p2 = timeline[i + 1];
        return {
          time: t,
          position: [
            p1.position[0] + ratio * (p2.position[0] - p1.position[0]),
            p1.position[1] + ratio * (p2.position[1] - p1.position[1]),
            p1.position[2] + ratio * (p2.position[2] - p1.position[2]),
          ],
          velocity: [
            p1.velocity[0] + ratio * (p2.velocity[0] - p1.velocity[0]),
            p1.velocity[1] + ratio * (p2.velocity[1] - p1.velocity[1]),
            p1.velocity[2] + ratio * (p2.velocity[2] - p1.velocity[2]),
          ],
          acceleration: [
            p1.acceleration[0] + ratio * (p2.acceleration[0] - p1.acceleration[0]),
            p1.acceleration[1] + ratio * (p2.acceleration[1] - p1.acceleration[1]),
            p1.acceleration[2] + ratio * (p2.acceleration[2] - p1.acceleration[2]),
          ],
          mass: p1.mass + ratio * (p2.mass - p1.mass),
          thrust: p1.thrust + ratio * (p2.thrust - p1.thrust),
          drag: p1.drag + ratio * (p2.drag - p1.drag),
          stage: p1.stage,
        };
      }
    }
    return timeline[timeline.length - 1];
  };

  const currentState = getCurrentState(playbackTime);

  // Project 3D coordinate [x, y, z] to 2D Canvas coordinate [u, v]
  // x = East (right), y = North (depth), z = Altitude (up)
  const project = (
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    autoScaleFactor: number
  ): [number, number, number] => {
    const scale = (Math.min(width, height) / 300) * zoom * autoScaleFactor;
    const centerX = width / 2;
    const centerY = height * 0.75; // Lower ground level for nicer altitude look

    // 1. Rotate around Z-axis (Yaw)
    const rotX = x * Math.cos(yaw) - y * Math.sin(yaw);
    const rotY = x * Math.sin(yaw) + y * Math.cos(yaw);
    const rotZ = z;

    // 2. Rotate around horizontal axis (Pitch)
    // Z is altitude (up). Pitch angles tip the ground plane
    const projX = rotX;
    const projY = rotY * Math.cos(pitch) - rotZ * Math.sin(pitch);
    const depth = rotY * Math.sin(pitch) + rotZ * Math.cos(pitch); // depth coordinate for perspective/sorting

    // 3. Project to flat screen
    const u = centerX + projX * scale;
    const v = centerY - projY * scale;

    return [u, v, depth];
  };

  // Mouse camera interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    // Rotate camera
    setYaw((prev) => prev + dx * 0.007);
    setPitch((prev) => Math.min(Math.PI / 2 - 0.05, Math.max(0.1, prev - dy * 0.007)));
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    // Dynamic auto-scale calculations to fit the entire trajectory nicely
    // Find boundaries of simulation
    let maxAbsX = 10;
    let maxAbsY = 10;
    let maxZ = 50;
    timeline.forEach((state) => {
      maxAbsX = Math.max(maxAbsX, Math.abs(state.position[0]));
      maxAbsY = Math.max(maxAbsY, Math.abs(state.position[1]));
      maxZ = Math.max(maxZ, state.position[2]);
    });

    const maxHorizontalSpread = Math.max(maxAbsX, maxAbsY, summary.predictedLandingZone.radiusX + Math.abs(summary.predictedLandingZone.center[0]));
    // Scale factor to map physical meters to visual space
    const autoScaleFactor = Math.min(
      150 / Math.max(10, maxHorizontalSpread), // limit width expansion
      180 / Math.max(30, maxZ) // limit altitude height expansion
    );

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // DRAW BACKGROUND SKY GRADIENT
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, "#0b0f19"); // Deep space navy
    skyGrad.addColorStop(0.6, "#1e293b"); // Slate blue
    skyGrad.addColorStop(0.8, "#334155"); // Cool gray
    skyGrad.addColorStop(1, "#f1f5f9"); // Pale ground atmospheric haze
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // DRAW COMPASS / LEGEND INSIDE CANVAS
    ctx.font = "11px ui-monospace, monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Trajectory Orbit (3D View)", 15, 25);
    ctx.fillText(`Scale: 1px ≈ ${(1 / autoScaleFactor).toFixed(1)}m`, 15, 42);
    ctx.fillText("Drag to Orbit Camera", 15, 59);

    // DRAW 3D GROUND GRID & AXES
    const drawGroundGrid = () => {
      ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
      ctx.lineWidth = 1;

      // Determine grid interval based on trajectory size
      const maxRange = Math.max(maxHorizontalSpread, maxZ);
      let step = 10;
      if (maxRange > 500) step = 100;
      else if (maxRange > 150) step = 50;
      else if (maxRange > 50) step = 20;

      // Draw grid lines on Z=0 ground plane
      const gridCount = 6;
      for (let i = -gridCount; i <= gridCount; i++) {
        // Lines of constant X (running North-South)
        const pStart1 = project(i * step, -gridCount * step, 0, width, height, autoScaleFactor);
        const pEnd1 = project(i * step, gridCount * step, 0, width, height, autoScaleFactor);

        ctx.beginPath();
        ctx.moveTo(pStart1[0], pStart1[1]);
        ctx.lineTo(pEnd1[0], pEnd1[1]);
        ctx.stroke();

        // Lines of constant Y (running East-West)
        const pStart2 = project(-gridCount * step, i * step, 0, width, height, autoScaleFactor);
        const pEnd2 = project(gridCount * step, i * step, 0, width, height, autoScaleFactor);

        ctx.beginPath();
        ctx.moveTo(pStart2[0], pStart2[1]);
        ctx.lineTo(pEnd2[0], pEnd2[1]);
        ctx.stroke();
      }

      // Draw compass cardinal indicators
      const textRadius = (gridCount + 0.6) * step;
      const northProj = project(0, textRadius, 0, width, height, autoScaleFactor);
      const southProj = project(0, -textRadius, 0, width, height, autoScaleFactor);
      const eastProj = project(textRadius, 0, 0, width, height, autoScaleFactor);
      const westProj = project(-textRadius, 0, 0, width, height, autoScaleFactor);

      ctx.fillStyle = "rgba(244, 63, 94, 0.9)"; // Red North
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillText("N", northProj[0] - 4, northProj[1] + 4);

      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.fillText("S", southProj[0] - 4, southProj[1] + 4);
      ctx.fillText("E", eastProj[0] - 4, eastProj[1] + 4);
      ctx.fillText("W", westProj[0] - 4, westProj[1] + 4);

      // Draw central Launch Pad
      const launchPad = project(0, 0, 0, width, height, autoScaleFactor);
      ctx.beginPath();
      ctx.arc(launchPad[0], launchPad[1], 5, 0, Math.PI * 2);
      ctx.fillStyle = "#334155";
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    drawGroundGrid();

    // DRAW PREDICTED LANDING ZONE ELLIPSE ON THE GROUND (Z=0)
    const drawLandingEllipse = () => {
      const lz = summary.predictedLandingZone;
      const segments = 48;
      ctx.beginPath();

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        
        // Ellipse coordinates in local frame
        const localX = lz.radiusX * Math.cos(theta);
        const localY = lz.radiusY * Math.sin(theta);

        // Rotate ellipse by its heading angle
        const rotRad = (lz.angle * Math.PI) / 180;
        const worldX = lz.center[0] + (localX * Math.cos(rotRad) - localY * Math.sin(rotRad));
        const worldY = lz.center[1] + (localX * Math.sin(rotRad) + localY * Math.cos(rotRad));

        const proj = project(worldX, worldY, 0, width, height, autoScaleFactor);
        
        if (i === 0) {
          ctx.moveTo(proj[0], proj[1]);
        } else {
          ctx.lineTo(proj[0], proj[1]);
        }
      }

      // Stroke and translucent fill
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(244, 63, 94, 0.6)"; // Rose border
      ctx.stroke();
      ctx.fillStyle = "rgba(244, 63, 94, 0.08)"; // Rose fill
      ctx.fill();

      // Draw Predicted Landing Point Cross
      const landingPt = project(timeline[timeline.length - 1].position[0], timeline[timeline.length - 1].position[1], 0, width, height, autoScaleFactor);
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(landingPt[0] - 6, landingPt[1] - 6);
      ctx.lineTo(landingPt[0] + 6, landingPt[1] + 6);
      ctx.moveTo(landingPt[0] + 6, landingPt[1] - 6);
      ctx.lineTo(landingPt[0] - 6, landingPt[1] + 6);
      ctx.stroke();

      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 9px Inter, sans-serif";
      ctx.fillText("PREDICTED LZ", landingPt[0] + 8, landingPt[1] - 4);
    };

    drawLandingEllipse();

    // DRAW ENTIRE FLIGHT TRAJECTORY PATH
    const drawTrajectory = () => {
      if (timeline.length < 2) return;

      ctx.lineWidth = 2.5;
      
      // We render segment by segment so we can change colors based on flight stage
      for (let i = 0; i < timeline.length - 1; i++) {
        const state1 = timeline[i];
        const state2 = timeline[i + 1];

        // Choose color based on state
        if (state1.stage === "GUIDE" || state1.stage === "POWERED") {
          ctx.strokeStyle = "#f97316"; // Bright orange for thrust
        } else if (state1.stage === "COAST") {
          ctx.strokeStyle = "#3b82f6"; // Blue for coasting
        } else if (state1.stage === "PARACHUTE") {
          ctx.strokeStyle = "#10b981"; // Emerald for parachute descent
        } else {
          ctx.strokeStyle = "#64748b"; // Gray for landing
        }

        const p1 = project(state1.position[0], state1.position[1], state1.position[2], width, height, autoScaleFactor);
        const p2 = project(state2.position[0], state2.position[1], state2.position[2], width, height, autoScaleFactor);

        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      }

      // Draw Key Flight Events annotations
      // 1. Apogee
      const apogeeState = timeline.find((s, idx) => {
        const next = timeline[idx + 1];
        return next && s.position[2] >= summary.maxAltitude - 0.5;
      }) || timeline[Math.floor(timeline.length / 2)];

      const apogeeProj = project(apogeeState.position[0], apogeeState.position[1], apogeeState.position[2], width, height, autoScaleFactor);
      
      ctx.fillStyle = "#fbbf24"; // Amber apogee node
      ctx.beginPath();
      ctx.arc(apogeeProj[0], apogeeProj[1], 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 10px Inter, sans-serif";
      ctx.fillText(`APOGEE: ${summary.maxAltitude.toFixed(1)}m`, apogeeProj[0] + 8, apogeeProj[1] - 3);

      // 2. Burnout
      const burnoutState = timeline.find((s) => s.time >= summary.burnoutTime) || timeline[0];
      if (burnoutState && summary.burnoutTime > 0) {
        const burnoutProj = project(burnoutState.position[0], burnoutState.position[1], burnoutState.position[2], width, height, autoScaleFactor);
        ctx.fillStyle = "#ef4444"; // Red cutout node
        ctx.beginPath();
        ctx.arc(burnoutProj[0], burnoutProj[1], 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fecaca";
        ctx.font = "9px Inter, sans-serif";
        ctx.fillText(`Cutoff: ${summary.burnoutAltitude.toFixed(1)}m`, burnoutProj[0] + 7, burnoutProj[1] + 9);
      }
    };

    drawTrajectory();

    // DRAW CURRENT ANIMATED ROCKET MODEL
    const drawRocketModel = () => {
      const pos = currentState.position;
      const stage = currentState.stage;
      const proj = project(pos[0], pos[1], pos[2], width, height, autoScaleFactor);

      // Rocket visual size multiplier
      const rSize = 12;

      // Draw fire plume if thrust is active
      if (currentState.thrust > 0) {
        ctx.beginPath();
        ctx.moveTo(proj[0] - 3, proj[1] + 4);
        ctx.lineTo(proj[0], proj[1] + 16 + Math.random() * 8); // flickering flame
        ctx.lineTo(proj[0] + 3, proj[1] + 4);
        ctx.closePath();
        
        const flameGrad = ctx.createLinearGradient(proj[0], proj[1], proj[0], proj[1] + 16);
        flameGrad.addColorStop(0, "#fef08a"); // Yellow hot core
        flameGrad.addColorStop(0.4, "#f97316"); // Orange
        flameGrad.addColorStop(1, "rgba(239, 68, 68, 0)"); // Red fade
        ctx.fillStyle = flameGrad;
        ctx.fill();
      }

      // Draw parachute canopy if deployed
      if (stage === "PARACHUTE") {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 0.8;
        // Parachute strings
        ctx.beginPath();
        ctx.moveTo(proj[0], proj[1] - 4);
        ctx.lineTo(proj[0] - 10, proj[1] - 22);
        ctx.moveTo(proj[0], proj[1] - 4);
        ctx.lineTo(proj[0] + 10, proj[1] - 22);
        ctx.stroke();

        // Canopy dome
        ctx.fillStyle = "rgba(16, 185, 129, 0.85)"; // Emerald green chute
        ctx.beginPath();
        ctx.arc(proj[0], proj[1] - 22, 10, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.stroke();
      }

      // Draw Rocket Nose, body, and fins
      ctx.fillStyle = "#f1f5f9"; // White rocket body
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1.2;

      // Body tube
      ctx.beginPath();
      ctx.rect(proj[0] - 2, proj[1] - 8, 4, 12);
      ctx.fill();
      ctx.stroke();

      // Nose cone
      ctx.fillStyle = "#e11d48"; // Rose nose cone
      ctx.beginPath();
      ctx.moveTo(proj[0] - 2, proj[1] - 8);
      ctx.quadraticCurveTo(proj[0], proj[1] - 16, proj[0], proj[1] - 18);
      ctx.quadraticCurveTo(proj[0], proj[1] - 16, proj[0] + 2, proj[1] - 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fins
      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.moveTo(proj[0] - 2, proj[1] + 1);
      ctx.lineTo(proj[0] - 6, proj[1] + 4);
      ctx.lineTo(proj[0] - 2, proj[1] + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(proj[0] + 2, proj[1] + 1);
      ctx.lineTo(proj[0] + 6, proj[1] + 4);
      ctx.lineTo(proj[0] + 2, proj[1] + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    drawRocketModel();

  }, [results, playbackTime, yaw, pitch, zoom, autoRotate, currentState]);

  return (
    <div id="visualizer-container" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Visualizer header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-rose-500 animate-spin-slow" />
          <div>
            <h3 className="font-bold text-sm text-slate-800">3D Interactive Launch Sandbox</h3>
            <p className="text-[11px] text-slate-500">Real-time 6-DoF trajectory projection & landing predictions</p>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            id="btn-rotate-camera"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
              autoRotate
                ? "bg-rose-50 text-rose-600 border-rose-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
            title="Auto-rotate camera"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} />
            <span>Auto-Orbit</span>
          </button>
        </div>
      </div>

      {/* Main interactive Canvas */}
      <div className="relative flex-1 bg-slate-900 min-h-[300px]">
        <canvas
          ref={canvasRef}
          id="canvas-3d-simulation"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="w-full h-full block cursor-grab active:cursor-grabbing"
        />

        {/* Real-time telemetry overlay */}
        <div className="absolute top-4 right-4 bg-slate-950/85 backdrop-blur-md rounded-xl p-3 border border-slate-800/80 text-[11px] text-slate-300 font-mono space-y-1.5 w-44 pointer-events-none">
          <div className="text-rose-400 font-bold border-b border-slate-800/80 pb-1 mb-1.5">TELEMETRY</div>
          <div className="flex justify-between">
            <span>STAGE:</span>
            <span className={`font-bold uppercase ${
              currentState.stage === "POWERED" ? "text-orange-400" :
              currentState.stage === "GUIDE" ? "text-yellow-400" :
              currentState.stage === "COAST" ? "text-blue-400" :
              currentState.stage === "PARACHUTE" ? "text-emerald-400" : "text-slate-400"
            }`}>{currentState.stage}</span>
          </div>
          <div className="flex justify-between">
            <span>TIME:</span>
            <span>{playbackTime.toFixed(2)}s</span>
          </div>
          <div className="flex justify-between">
            <span>ALTITUDE:</span>
            <span className="text-white font-semibold">{currentState.position[2].toFixed(1)}m</span>
          </div>
          <div className="flex justify-between">
            <span>VELOCITY:</span>
            <span>{Math.sqrt(
              currentState.velocity[0]**2 + 
              currentState.velocity[1]**2 + 
              currentState.velocity[2]**2
            ).toFixed(1)}m/s</span>
          </div>
          <div className="flex justify-between">
            <span>THRUST:</span>
            <span>{currentState.thrust.toFixed(1)}N</span>
          </div>
          <div className="flex justify-between">
            <span>DRAG:</span>
            <span>{currentState.drag.toFixed(1)}N</span>
          </div>
        </div>

        {/* Navigation Helpers */}
        <div className="absolute bottom-4 left-4 flex gap-1 bg-slate-950/80 backdrop-blur-sm rounded-lg p-1 border border-slate-800/60">
          <button
            type="button"
            id="btn-zoom-in"
            onClick={() => setZoom((z) => Math.min(3, z + 0.15))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            id="btn-zoom-out"
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            id="btn-reset-view"
            onClick={() => {
              setYaw(-0.6);
              setPitch(0.5);
              setZoom(1.0);
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition text-xs font-semibold"
            title="Reset Camera View"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Simulation Playback controls */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row gap-3 items-center">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-playback-toggle"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white flex items-center justify-center transition"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
          </button>
          <button
            type="button"
            id="btn-playback-reset"
            onClick={() => {
              setPlaybackTime(0);
              setIsPlaying(true);
            }}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 flex items-center justify-center transition"
            title="Restart flight animation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline progress slider */}
        <div className="flex-1 w-full flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono">0.0s</span>
          <input
            type="range"
            id="slider-playback-time"
            min="0"
            max={maxTime}
            step="0.05"
            value={playbackTime}
            onChange={(e) => {
              setPlaybackTime(parseFloat(e.target.value));
              setIsPlaying(false); // pause on manually scrubbing
            }}
            className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <span className="text-xs font-semibold text-slate-700 font-mono w-12 text-right">
            {playbackTime.toFixed(1)}s
          </span>
        </div>

        {/* Speed selectors */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Speed:</span>
          {["0.5", "1", "2", "5"].map((spd) => {
            const numSpd = parseFloat(spd);
            return (
              <button
                key={spd}
                type="button"
                id={`btn-speed-${spd}`}
                onClick={() => setPlaybackSpeed(numSpd)}
                className={`px-2 py-1 text-xs font-semibold rounded-md border transition ${
                  playbackSpeed === numSpd
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {spd}x
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
