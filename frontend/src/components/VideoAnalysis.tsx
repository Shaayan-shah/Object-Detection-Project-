import React, { useState, useRef } from 'react';
import { Upload, Video, Play, Loader2, CheckCircle2, Download, Sliders } from 'lucide-react';
import { VideoDetectionResult } from '../types';
import { api } from '../services/api';

interface VideoAnalysisProps {
  availableClasses: string[];
}

export const VideoAnalysis: React.FC<VideoAnalysisProps> = ({ availableClasses }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confidence, setConfidence] = useState<number>(0.35);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VideoDetectionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
  };

  const handleProcessVideo = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const res = await api.detectVideo(
        selectedFile,
        confidence,
        selectedClasses.length > 0 ? selectedClasses : undefined
      );
      setResult(res);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error processing video file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Video Batch Object Detection</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a recorded video clip to annotate bounding boxes across every frame.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Select Video File</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept="video/mp4,video/avi,video/mov,video/mkv"
              className="hidden"
            />

            {selectedFile && (
              <button
                onClick={handleProcessVideo}
                disabled={loading}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{loading ? 'Processing Frames...' : 'Annotate Video'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Video Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-h-[420px] flex flex-col justify-center items-center">
            {loading ? (
              <div className="text-center p-12 space-y-3 font-sans">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-800">Analyzing Video Frames...</p>
                <p className="text-xs text-slate-400">
                  Applying YOLO neural network frame by frame. This may take a few moments depending on video length.
                </p>
              </div>
            ) : result ? (
              <div className="w-full space-y-4">
                <video
                  src={result.video_url}
                  controls
                  autoPlay
                  className="w-full max-h-[500px] rounded-lg bg-black object-contain shadow-sm"
                />
                
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-slate-600 font-mono">
                    Frames Processed: <strong>{result.frames_processed}</strong>
                  </span>
                  <a
                    href={result.video_url}
                    download="annotated_video.mp4"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-medium hover:bg-purple-100 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Annotated MP4</span>
                  </a>
                </div>
              </div>
            ) : selectedFile ? (
              <div className="text-center p-10 space-y-2">
                <Video className="w-10 h-10 text-purple-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">Ready to Process: {selectedFile.name}</p>
                <p className="text-xs text-slate-400">Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                <button
                  onClick={handleProcessVideo}
                  className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700"
                >
                  Start Processing Now
                </button>
              </div>
            ) : (
              <div className="text-center p-10 space-y-2">
                <Video className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-700">No video selected</p>
                <p className="text-xs text-slate-400">Choose a video file to run automated bounding box tracking</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Video Parameters & Cumulative Stats */}
        <div className="space-y-4">
          
          {/* Cumulative Stats */}
          {result && result.cumulative_counts && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Total Detections Across Video
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result.cumulative_counts).map(([name, count]) => (
                  <div key={name} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[11px] text-slate-500 capitalize block">{name}</span>
                    <span className="text-lg font-bold text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parameters */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 text-xs">
            <h3 className="font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span>Video Settings</span>
            </h3>

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
                className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
