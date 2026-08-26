import React, { useState, useRef } from 'react';
import { Layers, Upload, Check, Loader2, HardDrive, Tag } from 'lucide-react';
import { ModelInfo } from '../types';
import { api } from '../services/api';

interface ModelHubProps {
  currentModel: string;
  models: ModelInfo[];
  classes: string[];
  onModelSwitched: () => void;
}

export const ModelHub: React.FC<ModelHubProps> = ({
  currentModel,
  models,
  classes,
  onModelSwitched
}) => {
  const [loadingModel, setLoadingModel] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectModel = async (modelName: string) => {
    setLoadingModel(modelName);
    try {
      await api.selectModel(modelName);
      onModelSwitched();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to switch model.');
    } finally {
      setLoadingModel(null);
    }
  };

  const handleCustomUpload = async (file: File) => {
    setUploading(true);
    try {
      await api.uploadCustomModel(file);
      onModelSwitched();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to upload custom model.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Neural Network Model Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch between pre-trained standard YOLO weights or load your custom trained models (.pt).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Upload Custom Weights (.pt)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleCustomUpload(e.target.files[0])}
            accept=".pt"
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Models List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Installed Models ({models.length})
            </h3>

            <div className="space-y-2">
              {models.map((m) => {
                const isActive = m.name === currentModel;
                return (
                  <div
                    key={m.name}
                    className={`p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                      isActive 
                        ? 'bg-sky-50/60 border-sky-300 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{m.label}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            m.type === 'custom' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {m.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{m.name}</p>
                      </div>
                    </div>

                    <div>
                      {isActive ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-xs border border-emerald-200">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active Model</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectModel(m.name)}
                          disabled={loadingModel === m.name}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors"
                        >
                          {loadingModel === m.name ? 'Loading...' : 'Switch to Model'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Classes Supported */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-600" />
                <span>Detected Classes ({classes.length})</span>
              </h3>
            </div>

            <div className="max-h-[480px] overflow-y-auto flex flex-wrap gap-1.5 pr-1">
              {classes.map((cls, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 capitalize"
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
