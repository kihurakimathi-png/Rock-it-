import React, { useState } from "react";
import { RocketSpecs, MotorConfig, EnvironmentSpecs } from "../types";
import { STANDARD_MOTORS } from "../data/motors";
import { Rocket, Wind, Zap, Sliders, Settings, Award } from "lucide-react";

interface SpecsFormProps {
  rocketSpecs: RocketSpecs;
  setRocketSpecs: React.Dispatch<React.SetStateAction<RocketSpecs>>;
  motorConfig: MotorConfig;
  setMotorConfig: React.Dispatch<React.SetStateAction<MotorConfig>>;
  envSpecs: EnvironmentSpecs;
  setEnvSpecs: React.Dispatch<React.SetStateAction<EnvironmentSpecs>>;
  onSimulate: () => void;
}

export default function SpecsForm({
  rocketSpecs,
  setRocketSpecs,
  motorConfig,
  setMotorConfig,
  envSpecs,
  setEnvSpecs,
  onSimulate,
}: SpecsFormProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "motor" | "launch">("specs");

  // Presets helper
  const applyPreset = (presetName: string) => {
    if (presetName === "alpha-iii") {
      setRocketSpecs({
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
      // Set to standard A8-3 motor
      const standardA8 = STANDARD_MOTORS.find((m) => m.id === "estes-a8-3");
      if (standardA8) setMotorConfig(standardA8);
    } else if (presetName === "big-bertha") {
      setRocketSpecs({
        name: "Big Bertha (Large / Slow)",
        bodyDiameterMm: 42,
        lengthCm: 61.0,
        emptyMassG: 62.0,
        dragCoefficient: 0.65,
        noseConeShape: "parabolic",
        finCount: 4,
        finSpanCm: 4.8,
        finRootChordCm: 7.2,
        parachuteDiameterCm: 45,
        parachuteCd: 1.5,
      });
      // Set to B6-4 motor
      const standardB6 = STANDARD_MOTORS.find((m) => m.id === "estes-b6-4");
      if (standardB6) setMotorConfig(standardB6);
    } else if (presetName === "high-power-l1") {
      setRocketSpecs({
        name: "Pro Level 1 (High Power)",
        bodyDiameterMm: 75,
        lengthCm: 120.0,
        emptyMassG: 950.0,
        dragCoefficient: 0.45,
        noseConeShape: "ogive",
        finCount: 4,
        finSpanCm: 8.5,
        finRootChordCm: 15.0,
        parachuteDiameterCm: 90,
        parachuteCd: 1.6,
      });
      // Set to G80-10 motor
      const standardG = STANDARD_MOTORS.find((m) => m.id === "aerotech-g80-10");
      if (standardG) setMotorConfig(standardG);
    }
  };

  const handleRocketChange = (field: keyof RocketSpecs, value: string | number) => {
    setRocketSpecs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEnvChange = (field: keyof EnvironmentSpecs, value: number | string) => {
    setEnvSpecs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Estimate Drag coefficient based on geometry
  const estimateDrag = () => {
    // A simplified model for rocket Cd
    let baseCd = 0.45;
    if (rocketSpecs.noseConeShape === "conical") baseCd += 0.08;
    if (rocketSpecs.noseConeShape === "parabolic") baseCd -= 0.03;
    
    // Add drag for fins
    const finCount = Number(rocketSpecs.finCount) || 0;
    const finSpanCm = Number(rocketSpecs.finSpanCm) || 0;
    const bodyDiameterMm = Number(rocketSpecs.bodyDiameterMm) || 1; // avoid division by zero
    const finDrag = (finCount * finSpanCm * 0.02) / (bodyDiameterMm / 10 || 1);
    const calculatedCd = parseFloat(Math.min(0.9, Math.max(0.3, baseCd + finDrag)).toFixed(2));
    
    handleRocketChange("dragCoefficient", calculatedCd);
  };

  // Motor Customizations helper
  const handleMotorSelect = (motorId: string) => {
    const selected = STANDARD_MOTORS.find((m) => m.id === motorId);
    if (selected) {
      setMotorConfig(selected);
    }
  };

  const handleCustomMotorChange = (field: keyof MotorConfig, value: number | string) => {
    setMotorConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div id="specs-form-container" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Presets Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Award className="w-4 h-4 text-rose-500" />
          <span>LOAD FLIGHT PRESETS:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            id="preset-alpha-iii"
            onClick={() => applyPreset("alpha-iii")}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-slate-700"
          >
            Estes Alpha III (A8-3)
          </button>
          <button
            type="button"
            id="preset-big-bertha"
            onClick={() => applyPreset("big-bertha")}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-slate-700"
          >
            Big Bertha (B6-4)
          </button>
          <button
            type="button"
            id="preset-high-power-l1"
            onClick={() => applyPreset("high-power-l1")}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-slate-700"
          >
            Level 1 High-Power (G80)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-white">
        <button
          type="button"
          id="tab-specs"
          onClick={() => setActiveTab("specs")}
          className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 flex items-center justify-center gap-2 transition ${
            activeTab === "specs"
              ? "border-rose-500 text-rose-600 bg-rose-50/20"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>Rocket Design</span>
        </button>
        <button
          type="button"
          id="tab-motor"
          onClick={() => setActiveTab("motor")}
          className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 flex items-center justify-center gap-2 transition ${
            activeTab === "motor"
              ? "border-rose-500 text-rose-600 bg-rose-50/20"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Motor Propulsive Specs</span>
        </button>
        <button
          type="button"
          id="tab-launch"
          onClick={() => setActiveTab("launch")}
          className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 flex items-center justify-center gap-2 transition ${
            activeTab === "launch"
              ? "border-rose-500 text-rose-600 bg-rose-50/20"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>Launch & Environment</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[460px]">
        {activeTab === "specs" && (
          <div className="space-y-4" id="section-rocket-design">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Rocket Label / Build Name
              </label>
              <input
                type="text"
                id="input-rocket-name"
                value={rocketSpecs.name}
                onChange={(e) => handleRocketChange("name", e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                placeholder="My Custom Build"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Airframe Outer Diameter (mm)
                </label>
                <input
                  type="number"
                  id="input-rocket-diameter"
                  value={rocketSpecs.bodyDiameterMm}
                  onChange={(e) => handleRocketChange("bodyDiameterMm", e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Airframe Length (cm)
                </label>
                <input
                  type="number"
                  id="input-rocket-length"
                  value={rocketSpecs.lengthCm}
                  onChange={(e) => handleRocketChange("lengthCm", e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none"
                  step="0.1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Dry Mass (g) <span className="text-slate-400 font-normal">(no motor)</span>
                </label>
                <input
                  type="number"
                  id="input-rocket-mass"
                  value={rocketSpecs.emptyMassG}
                  onChange={(e) => handleRocketChange("emptyMassG", e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none"
                  step="1"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Drag Coeff. (C_d)
                  </label>
                  <button
                    type="button"
                    id="btn-estimate-drag"
                    onClick={estimateDrag}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-medium hover:underline flex items-center gap-0.5"
                  >
                    <Sliders className="w-2.5 h-2.5" /> Estimate
                  </button>
                </div>
                <input
                  type="number"
                  id="input-rocket-cd"
                  value={rocketSpecs.dragCoefficient}
                  onChange={(e) => handleRocketChange("dragCoefficient", e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none"
                  step="0.01"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Aerodynamics Details</span>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Nose Cone Shape</label>
                  <select
                    id="select-rocket-nose-cone"
                    value={rocketSpecs.noseConeShape}
                    onChange={(e) => handleRocketChange("noseConeShape", e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded-md text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="ogive">Ogive (Low-drag)</option>
                    <option value="conical">Conical</option>
                    <option value="parabolic">Parabolic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Fin Count</label>
                  <input
                    type="number"
                    id="input-rocket-fin-count"
                    value={rocketSpecs.finCount}
                    onChange={(e) => handleRocketChange("finCount", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Fin Span (cm)</label>
                  <input
                    type="number"
                    id="input-rocket-fin-span"
                    value={rocketSpecs.finSpanCm}
                    onChange={(e) => handleRocketChange("finSpanCm", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Fin Root Chord (cm)</label>
                  <input
                    type="number"
                    id="input-rocket-fin-chord"
                    value={rocketSpecs.finRootChordCm}
                    onChange={(e) => handleRocketChange("finRootChordCm", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-rose-50/30 rounded-xl border border-rose-100/50">
              <span className="block text-[11px] font-bold text-rose-600 uppercase mb-2">Recovery System (Parachute)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Diameter (cm)</label>
                  <input
                    type="number"
                    id="input-parachute-diameter"
                    value={rocketSpecs.parachuteDiameterCm}
                    onChange={(e) => handleRocketChange("parachuteDiameterCm", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Parachute C_d</label>
                  <input
                    type="number"
                    id="input-parachute-cd"
                    value={rocketSpecs.parachuteCd}
                    onChange={(e) => handleRocketChange("parachuteCd", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none"
                    step="0.05"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "motor" && (
          <div className="space-y-4" id="section-motor-specs">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Select Model Rocket Motor (Standard)
              </label>
              <select
                id="select-motor-model"
                value={motorConfig.id}
                onChange={(e) => handleMotorSelect(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
              >
                {STANDARD_MOTORS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.manufacturer} {m.name} (Total: {m.totalMass}g, Propellant: {m.propellantMass}g)
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-1.5 border-b border-slate-200/60 pb-1.5 mb-2">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-500 uppercase">Selected Motor Engine Details</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Motor Total Mass (g)</label>
                  <input
                    type="number"
                    id="input-motor-total-mass"
                    value={motorConfig.totalMass}
                    onChange={(e) => handleCustomMotorChange("totalMass", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-md text-xs text-slate-800 focus:outline-none"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Propellant Mass (g)</label>
                  <input
                    type="number"
                    id="input-motor-propellant"
                    value={motorConfig.propellantMass}
                    onChange={(e) => handleCustomMotorChange("propellantMass", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-md text-xs text-slate-800 focus:outline-none"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Propellant Burn Time (s)</label>
                  <input
                    type="number"
                    id="input-motor-burn-time"
                    value={motorConfig.burnTime}
                    onChange={(e) => handleCustomMotorChange("burnTime", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-md text-xs text-slate-800 focus:outline-none"
                    step="0.05"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Ejection Delay Time (s)</label>
                  <input
                    type="number"
                    id="input-motor-delay"
                    value={motorConfig.delayTime}
                    onChange={(e) => handleCustomMotorChange("delayTime", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-md text-xs text-slate-800 focus:outline-none"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-500 flex flex-col gap-1 mt-2 font-mono">
                <div>Motor Class Estimate: <span className="font-semibold text-rose-500 uppercase">{motorConfig.name[0] || "Custom"}</span></div>
                <div>Manufacturer: {motorConfig.manufacturer}</div>
                <div>Points count on Thrust Curve: {motorConfig.thrustPoints.length}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "launch" && (
          <div className="space-y-4" id="section-launch-env">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Launch Rod Length (m)
                </label>
                <input
                  type="number"
                  id="input-env-rod-length"
                  value={envSpecs.launchGuideLengthM}
                  onChange={(e) => handleEnvChange("launchGuideLengthM", e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Tilt Angle (deg from vert)
                </label>
                <input
                  type="number"
                  id="input-env-tilt-angle"
                  value={envSpecs.launchAngleDeg}
                  onChange={(e) => handleEnvChange("launchAngleDeg", e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none"
                  step="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Tilt Direction (Azimuth °)
                </label>
                <input
                  type="number"
                  id="input-env-azimuth"
                  value={envSpecs.launchAzimuthDeg}
                  onChange={(e) => handleEnvChange("launchAzimuthDeg", e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none"
                  placeholder="0° = North, 90° = East"
                  step="5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Wind Speed (m/s)
                </label>
                <input
                  type="number"
                  id="input-env-wind-speed"
                  value={envSpecs.windSpeedMs}
                  onChange={(e) => handleEnvChange("windSpeedMs", e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none"
                  step="0.1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Wind From Direction (°)
                </label>
                <input
                  type="number"
                  id="input-env-wind-dir"
                  value={envSpecs.windDirectionDeg}
                  onChange={(e) => handleEnvChange("windDirectionDeg", e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none"
                  placeholder="0° = Wind from N"
                  step="5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Wind Gustiness (0 - 1)
                </label>
                <input
                  type="number"
                  id="input-env-gust"
                  value={envSpecs.windGustiness}
                  onChange={(e) => handleEnvChange("windGustiness", e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none"
                  step="0.1"
                />
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-xs text-amber-800 leading-relaxed">
              <strong>OpenRocket Safety Reminder:</strong> Ensure rod clearance speeds exceed 15 m/s before launching in winds above 5 m/s. Safe recovery requires delay charges matching the coast time perfectly.
            </div>
          </div>
        )}
      </div>

      {/* Execute simulation button */}
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <button
          type="button"
          id="btn-run-simulation"
          onClick={onSimulate}
          className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm rounded-xl transition shadow-sm hover:shadow flex items-center justify-center gap-2"
        >
          <Rocket className="w-4 h-4 animate-bounce" />
          <span>RUN FLIGHT SIMULATION</span>
        </button>
      </div>
    </div>
  );
}
