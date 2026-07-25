import React, { useState } from "react";
import { SimResults } from "../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Activity, Gauge, Flame, Navigation } from "lucide-react";

interface FlightChartsProps {
  results: SimResults;
}

export default function FlightCharts({ results }: FlightChartsProps) {
  const [activeChartTab, setActiveChartTab] = useState<"alt_vel" | "acc" | "thrust">("alt_vel");

  const timeline = results.timeline;
  const summary = results.summary;

  // Prepare chart data. Downsample data points for performance (max 150 points)
  const chartData = React.useMemo(() => {
    if (timeline.length === 0) return [];
    
    const step = Math.max(1, Math.floor(timeline.length / 150));
    const data = [];
    
    for (let i = 0; i < timeline.length; i += step) {
      const state = timeline[i];
      // Compute velocity magnitude
      const velMag = Math.sqrt(
        state.velocity[0] ** 2 + state.velocity[1] ** 2 + state.velocity[2] ** 2
      );
      // Compute acceleration magnitude in Gs
      const accMag = Math.sqrt(
        state.acceleration[0] ** 2 +
          state.acceleration[1] ** 2 +
          state.acceleration[2] ** 2
      );
      const accGs = accMag / 9.80665;

      data.push({
        time: parseFloat(state.time.toFixed(2)),
        altitude: Math.round(state.position[2]),
        velocity: parseFloat(velMag.toFixed(1)),
        acceleration: parseFloat(accGs.toFixed(2)),
        thrust: parseFloat(state.thrust.toFixed(1)),
        stage: state.stage,
      });
    }

    // Always include the very last state
    const last = timeline[timeline.length - 1];
    const lastVel = Math.sqrt(last.velocity[0] ** 2 + last.velocity[1] ** 2 + last.velocity[2] ** 2);
    const lastAcc = Math.sqrt(last.acceleration[0] ** 2 + last.acceleration[1] ** 2 + last.acceleration[2] ** 2) / 9.80665;
    data.push({
      time: parseFloat(last.time.toFixed(2)),
      altitude: Math.round(last.position[2]),
      velocity: parseFloat(lastVel.toFixed(1)),
      acceleration: parseFloat(lastAcc.toFixed(2)),
      thrust: parseFloat(last.thrust.toFixed(1)),
      stage: last.stage,
    });

    return data;
  }, [timeline]);

  // Dynamic colors matching our UI design
  const colors = {
    altitude: "#ec4899", // pink
    velocity: "#3b82f6", // blue
    acceleration: "#f59e0b", // amber
    thrust: "#ef4444", // red
  };

  return (
    <div id="flight-charts-container" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Chart Header Tabs */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-2 justify-between items-center">
        <div>
          <h3 className="font-bold text-sm text-slate-800">Advanced Flight Telemetry Analytics</h3>
          <p className="text-[11px] text-slate-500">Numerical integration plots & kinematic analysis</p>
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            id="btn-chart-tab-alt"
            onClick={() => setActiveChartTab("alt_vel")}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
              activeChartTab === "alt_vel"
                ? "bg-pink-50 text-pink-600 border-pink-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Alt & Velocity</span>
          </button>
          <button
            type="button"
            id="btn-chart-tab-acc"
            onClick={() => setActiveChartTab("acc")}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
              activeChartTab === "acc"
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Acceleration (G-load)</span>
          </button>
          <button
            type="button"
            id="btn-chart-tab-thrust"
            onClick={() => setActiveChartTab("thrust")}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
              activeChartTab === "thrust"
                ? "bg-rose-50 text-rose-600 border-rose-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Thrust Profile</span>
          </button>
        </div>
      </div>

      {/* Active Chart Window */}
      <div className="p-5 flex-1 min-h-[300px]" id="flight-charts-viewport">
        {activeChartTab === "alt_vel" && (
          <div className="h-full flex flex-col justify-between" id="chart-alt-vel-pane">
            <div className="flex-1 min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.altitude} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={colors.altitude} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorVel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.velocity} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={colors.velocity} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickMargin={5} label={{ value: "Time (s)", position: "insideBottom", offset: -5, fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis yAxisId="left" stroke={colors.altitude} fontSize={10} tickMargin={5} />
                  <YAxis yAxisId="right" orientation="right" stroke={colors.velocity} fontSize={10} tickMargin={5} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "11px" }}
                    labelFormatter={(label) => `Time: ${label}s`}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="altitude"
                    name="Altitude (meters)"
                    stroke={colors.altitude}
                    fillOpacity={1}
                    fill="url(#colorAlt)"
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="velocity"
                    name="Velocity (m/s)"
                    stroke={colors.velocity}
                    fillOpacity={1}
                    fill="url(#colorVel)"
                    strokeWidth={2}
                  />
                  {/* Mark burnout and apogee lines */}
                  {summary.burnoutTime > 0 && (
                    <ReferenceLine yAxisId="left" x={summary.burnoutTime} stroke="#ef4444" strokeDasharray="3 3">
                      {/* Note: we can use simple reference line */}
                    </ReferenceLine>
                  )}
                  <ReferenceLine yAxisId="left" x={summary.apogeeTime} stroke="#fbbf24" strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Quick stats panel */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Apogee Altitude</span>
                <span className="text-sm font-black text-pink-600">{summary.maxAltitude.toFixed(1)} m</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Max Velocity</span>
                <span className="text-sm font-black text-blue-600">{summary.maxVelocity.toFixed(1)} m/s</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Time to Apogee</span>
                <span className="text-sm font-black text-amber-500">{summary.apogeeTime.toFixed(1)} s</span>
              </div>
            </div>
          </div>
        )}

        {activeChartTab === "acc" && (
          <div className="h-full flex flex-col justify-between" id="chart-acc-pane">
            <div className="flex-1 min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.acceleration} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={colors.acceleration} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickMargin={5} label={{ value: "Time (s)", position: "insideBottom", offset: -5, fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis stroke={colors.acceleration} fontSize={10} tickMargin={5} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "11px" }}
                    labelFormatter={(label) => `Time: ${label}s`}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  <Area
                    type="monotone"
                    dataKey="acceleration"
                    name="Acceleration Load (G-force)"
                    stroke={colors.acceleration}
                    fillOpacity={1}
                    fill="url(#colorAcc)"
                    strokeWidth={2}
                  />
                  <ReferenceLine y={0} stroke="#94a3b8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Max Acceleration</span>
                <span className="text-sm font-black text-amber-600">+{summary.maxAcceleration.toFixed(2)} Gs</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Stability Off-Rod</span>
                <span className={`text-sm font-black ${summary.stableOffRod ? "text-emerald-600" : "text-rose-500"}`}>
                  {summary.stableOffRod ? "STABLE" : "MARGINAL"}{" "}
                  <span className="text-[10px] font-normal">({summary.velocityOffRod.toFixed(1)} m/s)</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {activeChartTab === "thrust" && (
          <div className="h-full flex flex-col justify-between" id="chart-thrust-pane">
            <div className="flex-1 min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorThrust" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.thrust} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={colors.thrust} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickMargin={5} label={{ value: "Time (s)", position: "insideBottom", offset: -5, fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis stroke={colors.thrust} fontSize={10} tickMargin={5} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "11px" }}
                    labelFormatter={(label) => `Time: ${label}s`}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  <Area
                    type="monotone"
                    dataKey="thrust"
                    name="Motor Thrust (Newtons)"
                    stroke={colors.thrust}
                    fillOpacity={1}
                    fill="url(#colorThrust)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Burnout Time</span>
                <span className="text-sm font-black text-rose-600">{summary.burnoutTime.toFixed(2)} s</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Burnout Altitude</span>
                <span className="text-sm font-black text-slate-800">{summary.burnoutAltitude.toFixed(1)} m</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
