import React, { useState } from "react";
import { FlightLog } from "../types";
import { Trash2, Plus, Download, Upload, List, Sparkles, Scale, Info, Check } from "lucide-react";

interface FlightHistoryProps {
  logs: FlightLog[];
  onDeleteLog: (id: string) => void;
  onClearLogs: () => void;
  onSelectLog: (log: FlightLog) => void;
  selectedLogId: string | null;
  onImportLogs: (logs: FlightLog[]) => void;
}

export default function FlightHistory({
  logs,
  onDeleteLog,
  onClearLogs,
  onSelectLog,
  selectedLogId,
  onImportLogs,
}: FlightHistoryProps) {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);

  // Toggle log for comparison
  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 3) {
          alert("You can compare up to 3 flights at once.");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // Export logs to local JSON file
  const handleExport = () => {
    if (logs.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(logs, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", "amateur_rocketry_flight_logs.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import logs from local JSON file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            // Basic validation
            const valid = parsed.every((item) => item.id && item.rocketSpecs && item.results);
            if (valid) {
              onImportLogs(parsed);
            } else {
              alert("Invalid flight log file format.");
            }
          } else {
            alert("File must be a JSON array of flight logs.");
          }
        } catch (err) {
          alert("Error parsing JSON file.");
        }
      };
    }
  };

  const comparedLogs = logs.filter((l) => compareIds.includes(l.id));

  return (
    <div id="flight-history-container" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-2 justify-between items-center">
        <div>
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <List className="w-4 h-4 text-rose-500" />
            <span>Flight Tracking Logbook</span>
          </h3>
          <p className="text-[11px] text-slate-500">Record, compare, and manage your rocketry flights</p>
        </div>

        <div className="flex gap-2">
          {logs.length > 0 && (
            <>
              <button
                type="button"
                id="btn-export-logs"
                onClick={handleExport}
                className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1 transition shadow-sm"
                title="Export Logs as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                type="button"
                id="btn-clear-all-logs"
                onClick={() => {
                  if (confirm("Are you sure you want to erase all logged flight history?")) {
                    onClearLogs();
                    setCompareIds([]);
                    setIsCompareMode(false);
                  }
                }}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                title="Wipe Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            </>
          )}

          <label className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
            <input
              type="file"
              id="file-import-logs"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main logs display */}
      <div className="p-5 flex-1 overflow-y-auto max-h-[400px] space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-8 px-4 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50" id="empty-history-alert">
            <Sparkles className="w-8 h-8 text-rose-300 mx-auto mb-2 animate-pulse" />
            <p className="text-xs font-semibold text-slate-600">No Flights Simulated Yet</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Configure rocket specs and run a launch simulation to record and analyze your first flight log.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Compare Tools Header */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-blue-500" />
                <span>Flight Comparison Analyzer</span>
              </span>
              <button
                type="button"
                id="btn-toggle-compare-mode"
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  isCompareMode
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {isCompareMode ? "Exit Compare" : "Compare Specs"}
              </button>
            </div>

            {/* List of items */}
            {!isCompareMode ? (
              <div className="space-y-2.5" id="flight-logs-list">
                {logs.map((log) => {
                  const isSelected = selectedLogId === log.id;
                  const date = new Date(log.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      key={log.id}
                      id={`log-item-${log.id}`}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                        isSelected
                          ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-400"
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        id={`btn-select-log-${log.id}`}
                        onClick={() => onSelectLog(log)}
                        className="flex-1 text-left space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-800">{log.rocketSpecs.name}</span>
                          <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded">
                            {log.motorConfig.manufacturer} {log.motorConfig.name}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 font-mono">
                          <span>Apogee: <strong className="text-slate-600">{log.results.summary.maxAltitude.toFixed(0)}m</strong></span>
                          <span>Max Speed: <strong className="text-slate-600">{log.results.summary.maxVelocity.toFixed(0)}m/s</strong></span>
                          <span>Drift: <strong className="text-slate-600">{log.results.summary.driftDistance.toFixed(0)}m</strong></span>
                          <span>{date}</span>
                        </div>
                      </button>

                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        <button
                          type="button"
                          id={`btn-compare-checkbox-${log.id}`}
                          onClick={() => toggleCompare(log.id)}
                          className={`p-1 rounded text-xs transition flex items-center gap-1 ${
                            compareIds.includes(log.id)
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                          title="Add to flight comparison"
                        >
                          <Check className={`w-3.5 h-3.5 ${compareIds.includes(log.id) ? "opacity-100" : "opacity-20"}`} />
                          <span className="text-[10px] font-semibold">Compare</span>
                        </button>
                        <button
                          type="button"
                          id={`btn-delete-log-${log.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLog(log.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Delete Flight Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Compare side-by-side view */
              <div className="space-y-4" id="compare-flight-logs-window">
                <p className="text-[11px] text-slate-500 leading-relaxed italic flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Select checkbox on logs to populate comparison. Currently comparing ({comparedLogs.length}/3).</span>
                </p>

                {comparedLogs.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-100 rounded-lg text-xs text-slate-400">
                    No flights checked for comparison yet. Toggle some above!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 overflow-x-auto">
                    {comparedLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-xs text-slate-800 block truncate">{log.rocketSpecs.name}</span>
                            <button
                              type="button"
                              id={`btn-remove-compare-${log.id}`}
                              onClick={() => toggleCompare(log.id)}
                              className="text-[10px] text-rose-500 hover:underline font-bold"
                            >
                              Remove
                            </button>
                          </div>
                          <span className="inline-block px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-bold rounded mb-2">
                            {log.motorConfig.name} Motor
                          </span>

                          <div className="space-y-1.5 text-[11px] font-mono border-t border-slate-200/60 pt-2 text-slate-600">
                            <div className="flex justify-between">
                              <span>Max Altitude:</span>
                              <strong className="text-slate-800">{log.results.summary.maxAltitude.toFixed(1)}m</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Max Speed:</span>
                              <strong className="text-slate-800">{log.results.summary.maxVelocity.toFixed(1)}m/s</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Max G-Force:</span>
                              <strong className="text-slate-800">{log.results.summary.maxAcceleration.toFixed(1)} Gs</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Burnout Alt:</span>
                              <strong className="text-slate-800">{log.results.summary.burnoutAltitude.toFixed(1)}m</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Off-Rod Vel:</span>
                              <strong className={log.results.summary.stableOffRod ? "text-emerald-600" : "text-rose-500"}>
                                {log.results.summary.velocityOffRod.toFixed(1)}m/s
                              </strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Wind Drift:</span>
                              <strong className="text-slate-800">{log.results.summary.driftDistance.toFixed(1)}m</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Rocket Mass:</span>
                              <span>{log.rocketSpecs.emptyMassG}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Drag Cd:</span>
                              <span>{log.rocketSpecs.dragCoefficient}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
