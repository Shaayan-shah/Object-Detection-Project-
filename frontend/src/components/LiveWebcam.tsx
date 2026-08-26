import React, { useState, useEffect } from 'react';
import { Camera, Sliders, Play, Pause, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface LiveWebcamProps {
  availableClasses: string[];
}

export const LiveWebcam: React.FC<LiveWebcamProps> = ({ availableClasses }) => {
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [confidence, setConfidence] = useState<number>(0.40);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [streamError, setStreamError] = useState<boolean>(false);

  const handleUpdateStream = async (newConf: number, newClasses?: string[]) => {
    try {
      await api.updateStreamSettings(newConf, newClasses);
    } catch (err) {
      console.error('Error updating stream settings:', err);
    }
  };

  const handleConfidenceChange = (val: number) => {
    setConfidence(val);
    handleUpdateStream(val, selectedClasses.length > 0 ? selectedClasses : undefined);
  };

  const handleToggleClass = (cls: string) => {
    let updated: string[];
    if (selectedClasses.includes(cls)) {
      updated = selectedClasses.filter(c => c !== cls);
    } else {
      updated = [...selectedClasses, cls];
    }
    setSelectedClasses(updated);
    handleUpdateStream(confidence, updated.length > 0 ? updated : undefined);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Live Camera Stream Detection</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inference pipeline connected to your local camera feed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-sm ${
              isStreaming 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isStreaming ? 'Pause Camera' : 'Start Camera'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stream Screen */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-h-[460px] flex items-center justify-center relative overflow-hidden">
            {isStreaming && !streamError ? (
              <img
                src="/api/stream/live"
                alt="Live Camera Feed"
                onError={() => setStreamError(true)}
                className="w-full h-full max-h-[520px] object-contain rounded-lg bg-black"
              />
            ) : (
              <div className="text-center p-12 space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">
                  {streamError ? 'Camera Feed Error' : 'Stream Paused'}
                </p>
                <p className="text-xs text-slate-400">
                  {streamError ? 'Ensure a webcam is attached and accessible by your browser/OS.' : 'Click "Start Camera" above to resume.'}
                </p>
                {streamError && (
                  <button
                    onClick={() => setStreamError(false)}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs"
                  >
                    Retry Connection
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Adjustments */}
        <div className="space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 text-xs">
            <h3 className="font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span>Real-Time Controls</span>
            </h3>

            {/* Confidence Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Confidence Threshold</span>
                <span className="font-mono font-semibold text-slate-900">{Math.round(confidence * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.90"
                step="0.05"
                value={confidence}
                onChange={(e) => handleConfidenceChange(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Class Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Filter Classes</span>
                {selectedClasses.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedClasses([]);
                      handleUpdateStream(confidence, []);
                    }}
                    className="text-[11px] text-emerald-600 hover:underline"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-lg p-2 bg-slate-50">
                {availableClasses.map((cls) => {
                  const checked = selectedClasses.includes(cls);
                  return (
                    <label
                      key={cls}
                      className="flex items-center gap-2 text-slate-700 hover:bg-slate-100/80 px-2 py-1 rounded cursor-pointer select-none text-[11px]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleClass(cls)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="capitalize">{cls}</span>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
