import React, { useState, useEffect } from "react";
import { RocketSpecs, MotorConfig, EnvironmentSpecs, FlightLog, SimResults } from "./types";
import { STANDARD_MOTORS } from "./data/motors";
import { runSimulation } from "./utils/simulator";
import SpecsForm from "./components/SpecsForm";
import Visualizer3D from "./components/Visualizer3D";
import FlightCharts from "./components/FlightCharts";
import FlightHistory from "./components/FlightHistory";
import { Rocket, Sparkles, Scale, Info, Layers, Wind, ShieldAlert, Zap, Compass, Check, HelpCircle } from "lucide-react";

export default function App() {
  // 1. Core Rocket Specification States
  const [rocketSpecs, setRocketSpecs] = useState<RocketSpecs>({
    name: "Estes Alpha III (Classic)",
    bodyDiameterMm: 25,
    lengthCm: 31.1,
    emptyMassG: 34.0,
    dragCoefficient: 0.55,
    noseConeShape: "ogive",
    finCount: 3,
    finSpanCm: 2.8,
    finRootChordCm: 4.5,
    parachuteDiameterCm: 30,
    parachuteCd: 1.5,
  });

  // 2. Selected Motor State
  const [motorConfig, setMotorConfig] = useState<MotorConfig>(
    STANDARD_MOTORS.find((m) => m.id === "estes-c6-5") || STANDARD_MOTORS[0]
  );

  // 3. Environmental Conditions States
  const [envSpecs, setEnvSpecs] = useState<EnvironmentSpecs>({
    launchGuideLengthM: 1.0,
    launchAngleDeg: 5,
    launchAzimuthDeg: 90, // Tilt 5 degrees East
    windSpeedMs: 3.0, // gentle breeze
    windDirectionDeg: 180, // Wind coming from the South (blowing North)
    windGustiness: 0.3,
  });

  // 4. List of saved flight logs (loaded from local storage)
  const [logs, setLogs] = useState<FlightLog[]>([]);
  // 5. Currently active simulation results
  const [activeResults, setActiveResults] = useState<SimResults | null>(null);
  // 6. Selected log ID from history for inspecting previous flights
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Load saved logs from localStorage on mount and run initial simulation
  useEffect(() => {
    try {
      const saved = localStorage.getItem("amateur_rocketry_logs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLogs(parsed);
          // Set active view to the most recent log
          setActiveResults(parsed[0].results);
          setSelectedLogId(parsed[0].id);
          // Load specs of that log
          setRocketSpecs(parsed[0].rocketSpecs);
          setMotorConfig(parsed[0].motorConfig);
          setEnvSpecs(parsed[0].envSpecs);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load saved logs from storage", e);
    }

    // Fallback: Run initial simulation for immediate content display
    handleRunSimulation(true);
  }, []);

  // Sync logs back to localStorage whenever logs list changes
  const saveLogsToStorage = (updatedLogs: FlightLog[]) => {
    try {
      localStorage.setItem("amateur_rocketry_logs", JSON.stringify(updatedLogs));
    } catch (e) {
      console.error("Failed to save logs to storage", e);
    }
  };

  // Run new simulation based on current specs
  const handleRunSimulation = (isInitial = false) => {
    const results = runSimulation(rocketSpecs, motorConfig, envSpecs);
    setActiveResults(results);

    // Save as a new flight log unless we are just loading initial fallback
    if (!isInitial) {
      const newLog: FlightLog = {
        id: "log_" + Date.now(),
        timestamp: new Date().toISOString(),
        rocketSpecs: { ...rocketSpecs },
        motorConfig: { ...motorConfig },
        envSpecs: { ...envSpecs },
        results,
      };

      setLogs((prev) => {
        const updated = [newLog, ...prev];
        saveLogsToStorage(updated);
        return updated;
      });
      setSelectedLogId(newLog.id);
    }
  };

  // Delete specific log from history
  const handleDeleteLog = (id: string) => {
    setLogs((prev) => {
      const updated = prev.filter((log) => log.id !== id);
      saveLogsToStorage(updated);
      
      // If deleted log was currently active, switch to first remaining log or null
      if (selectedLogId === id) {
        if (updated.length > 0) {
          setActiveResults(updated[0].results);
          setSelectedLogId(updated[0].id);
          setRocketSpecs(updated[0].rocketSpecs);
          setMotorConfig(updated[0].motorConfig);
          setEnvSpecs(updated[0].envSpecs);
        } else {
          // Keep active results on screen but clear selected ID
          setSelectedLogId(null);
        }
      }
      return updated;
    });
  };

  // Delete all logged flight history
  const handleClearLogs = () => {
    setLogs([]);
    saveLogsToStorage([]);
    setSelectedLogId(null);
  };

  // Select a previous flight log to inspect
  const handleSelectLog = (log: FlightLog) => {
    setSelectedLogId(log.id);
    setActiveResults(log.results);
    setRocketSpecs(log.rocketSpecs);
    setMotorConfig(log.motorConfig);
    setEnvSpecs(log.envSpecs);
  };

  // Import flight logs
  const handleImportLogs = (imported: FlightLog[]) => {
    setLogs((prev) => {
      const combined = [...imported, ...prev];
      // filter out duplicate IDs just in case
      const unique = combined.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
      saveLogsToStorage(unique);
      
      // Select first imported log
      if (unique.length > 0) {
        setSelectedLogId(unique[0].id);
        setActiveResults(unique[0].results);
        setRocketSpecs(unique[0].rocketSpecs);
        setMotorConfig(unique[0].motorConfig);
        setEnvSpecs(unique[0].envSpecs);
      }
      return unique;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="applet-viewport">
      {/* Dynamic Header */}
      <header className="bg-slate-900 text-white py-5 px-6 shadow-md border-b border-rose-500/30 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600 rounded-xl shadow-lg border border-rose-400">
              <Rocket className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg tracking-tight uppercase">OpenRocket Lite</h1>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-mono border border-rose-500/30 rounded font-bold">
                  AMATEUR SIMULATOR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Aerodynamics estimation, solid propellant thrust curves & 6-DoF landing predictions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono bg-slate-950/50 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-500">SYSTEM STATE:</span>
            <span className="text-emerald-400 font-bold">● FLIGHT READY</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{logs.length} LOGGED FLIGHTS</span>
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        {/* UPPER DASHBOARD: CURRENT ACTIVE METRICS CARDS */}
        {activeResults && (
          <section id="metrics-dashboard" className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow transition">
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Max Altitude (Apogee)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-rose-600 font-mono">
                  {activeResults.summary.maxAltitude.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-slate-500">meters</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                At t = {activeResults.summary.apogeeTime.toFixed(1)}s after liftoff
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow transition">
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Peak Speed</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-blue-600 font-mono">
                  {activeResults.summary.maxVelocity.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-slate-500">m/s</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                ~{(activeResults.summary.maxVelocity * 3.6).toFixed(0)} km/h (Mach {(activeResults.summary.maxVelocity / 343).toFixed(2)})
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow transition">
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rod Departure Speed</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-black font-mono ${activeResults.summary.stableOffRod ? "text-emerald-600" : "text-amber-500"}`}>
                  {activeResults.summary.velocityOffRod.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-slate-500">m/s</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className={`w-2 h-2 rounded-full ${activeResults.summary.stableOffRod ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  {activeResults.summary.stableOffRod ? "Aerodynamically Stable" : "Marginal Stability"}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow transition">
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Predicted Drift Range</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-amber-600 font-mono">
                  {activeResults.summary.driftDistance.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-slate-500">meters</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Heading {activeResults.summary.driftDirection.toFixed(0)}° ({activeResults.summary.driftDistance > 100 ? "Long range recovery" : "Near-pad recovery"})
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-2 lg:col-span-1 hover:shadow transition">
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Flight Time</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-800 font-mono">
                  {activeResults.summary.landingTime.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-slate-500">seconds</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Parachute deployed at apogee + drift descent
              </p>
            </div>
          </section>
        )}

        {/* PRIMARY WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left specification form sidebar */}
          <div className="lg:col-span-5 h-full flex flex-col gap-6" id="applet-sidebar">
            <SpecsForm
              rocketSpecs={rocketSpecs}
              setRocketSpecs={setRocketSpecs}
              motorConfig={motorConfig}
              setMotorConfig={setMotorConfig}
              envSpecs={envSpecs}
              setEnvSpecs={setEnvSpecs}
              onSimulate={() => handleRunSimulation(false)}
            />

            {/* Compact state viewer to explain formulas */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-sm text-xs leading-relaxed text-slate-600" id="aerodynamics-guide-helper">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Info className="w-4 h-4 text-rose-500" />
                <span>Rocketry Physics Engine Guide</span>
              </h4>
              <p>
                Our 6-DoF numerical integration engine simulates trajectories by computing thrust, drag, and gravity forces at 100Hz:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] font-mono text-slate-500">
                <li>
                  <strong>Drag Formula:</strong> Fd = 0.5 * ρ * v² * Cd * A
                </li>
                <li>
                  <strong>Stabilization:</strong> Free flight weathercocking aligns rocket orientation to relative airspeed vector.
                </li>
                <li>
                  <strong>Parachute Descent:</strong> Uses canopy Cd ({rocketSpecs.parachuteCd}) and diameter ({rocketSpecs.parachuteDiameterCm}cm) for terminal velocity.
                </li>
              </ul>
            </div>
          </div>

          {/* Right main visualizations viewports */}
          <div className="lg:col-span-7 flex flex-col gap-6" id="applet-visualizations">
            {activeResults ? (
              <>
                {/* 3D Visualizer window */}
                <div className="h-[460px]">
                  <Visualizer3D results={activeResults} />
                </div>

                {/* Telemetry Charts */}
                <div className="h-[410px]">
                  <FlightCharts results={activeResults} />
                </div>
              </>
            ) : (
              <div className="h-[460px] bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-400">
                <span className="text-xs">Simulating first flight launch path...</span>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: LOGBOOK & FLIGHT LOGS TRACKER */}
        <section id="logbook-section">
          <FlightHistory
            logs={logs}
            onDeleteLog={handleDeleteLog}
            onClearLogs={handleClearLogs}
            onSelectLog={handleSelectLog}
            selectedLogId={selectedLogId}
            onImportLogs={handleImportLogs}
          />
        </section>
      </main>

      {/* Elegant Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-mono">
          <div>
            <span>© 2026 Amateur Rocketry Simulator (OpenRocket Lite).</span>
          </div>
          <div className="flex gap-4">
            <a href="https://openrocket.info" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition">
              OpenRocket Project
            </a>
            <span>•</span>
            <a href="https://www.nar.org" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition">
              National Association of Rocketry
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
