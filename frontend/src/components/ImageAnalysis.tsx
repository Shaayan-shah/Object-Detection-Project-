import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  Sliders, 
  CheckCircle2, 
  Eye, 
  Loader2, 
  Layers, 
  FileSpreadsheet, 
  Image as ImageIcon 
} from 'lucide-react';
import { ImageDetectionResult } from '../types';
import { api } from '../services/api';

interface ImageAnalysisProps {
  availableClasses: string[];
}

export const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ availableClasses }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0.35);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ImageDetectionResult | null>(null);
  const [viewMode, setViewMode] = useState<'annotated' | 'original'>('annotated');
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRunDetection = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const res = await api.detectImage(
        selectedFile,
        confidence,
        selectedClasses.length > 0 ? selectedClasses : undefined
      );
      setResult(res);
      setViewMode('annotated');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error running object detection.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClass = (cls: string) => {
    if (selectedClasses.includes(cls)) {
      setSelectedClasses(selectedClasses.filter(c => c !== cls));
    } else {
      setSelectedClasses([...selectedClasses, cls]);
    }
  };

  const downloadCSV = () => {
    if (!result) return;
    const headers = "Index,Class,Confidence,X1,Y1,Width,Height\n";
    const rows = result.detections.map((d, i) => 
      `${i+1},${d.class_name},${d.confidence},${d.box.x1},${d.box.y1},${d.box.width},${d.box.height}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detections_${result.filename}.csv`;
    a.click();
  };

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detections_${result.filename}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Photo Object Detection</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload an image to detect, classify, count, and extract precise bounding boxes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Select Photo</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />

            {selectedFile && (
              <button
                onClick={handleRunDetection}
                disabled={loading}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                <span>{loading ? 'Detecting Objects...' : 'Run Detection'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Image Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-h-[480px] flex flex-col justify-between">
            
            {/* View Mode Controls */}
            {result && (
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 text-xs">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('annotated')}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${
                      viewMode === 'annotated' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Annotated ({result.total_objects} objects)
                  </button>
                  <button
                    onClick={() => setViewMode('original')}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${
                      viewMode === 'original' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Original Photo
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadCSV}
                    title="Export CSV"
                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={downloadJSON}
                    title="Export JSON"
                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>JSON</span>
                  </button>
                  <a
                    href={result.annotated_url}
                    download={`annotated_${result.filename}`}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 text-xs font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Image</span>
                  </a>
                </div>
              </div>
            )}

            {/* Canvas / Image Display */}
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex-1 flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg overflow-hidden relative min-h-[380px]"
            >
              {result ? (
                <img
                  src={viewMode === 'annotated' ? result.annotated_url : result.original_url}
                  alt="Detection View"
                  className="max-h-[550px] w-auto max-w-full object-contain rounded"
                />
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Uploaded preview"
                  className="max-h-[550px] w-auto max-w-full object-contain rounded"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Drag and drop an image here</p>
                    <p className="text-xs text-slate-400 mt-0.5">Supports PNG, JPG, JPEG, WebP</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-sky-600 font-medium hover:underline pt-2 inline-block"
                  >
                    Browse from computer
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Dimensions info */}
            {result && (
              <div className="pt-3 flex items-center justify-between text-xs text-slate-400">
                <span>File: <strong className="text-slate-700 font-mono">{result.filename}</strong></span>
                <span>Dimensions: <strong className="text-slate-700 font-mono">{result.image_dimensions.width} × {result.image_dimensions.height} px</strong></span>
              </div>
            )}

          </div>

          {/* Detections Breakdown Table */}
          {result && result.detections.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Detected Objects List ({result.detections.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Class</th>
                      <th className="px-3 py-2">Confidence</th>
                      <th className="px-3 py-2">Bounding Box (X1, Y1, X2, Y2)</th>
                      <th className="px-3 py-2">Dimensions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {result.detections.map((det, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2 font-semibold text-slate-900 font-sans">{det.class_name}</td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 text-[11px]">
                            {(det.confidence * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-600 text-[11px]">
                          [{det.box.x1}, {det.box.y1}, {det.box.x2}, {det.box.y2}]
                        </td>
                        <td className="px-3 py-2 text-slate-500 text-[11px]">
                          {det.box.width} × {det.box.height} px
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Settings & Class Filters */}
        <div className="space-y-4">
          
          {/* Summary Card */}
          {result && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Object Count Summary
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result.counts).map(([name, count]) => (
                  <div key={name} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[11px] text-slate-500 capitalize block">{name}</span>
                    <span className="text-lg font-bold text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inference Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 text-xs">
            <h3 className="font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span>Inference Parameters</span>
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
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Ignore detections below this probability.</p>
            </div>

            {/* Class Filters */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Filter Specific Classes</span>
                {selectedClasses.length > 0 && (
                  <button
                    onClick={() => setSelectedClasses([])}
                    className="text-[11px] text-sky-600 hover:underline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-lg p-2 bg-slate-50">
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
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
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
