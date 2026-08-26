import React from 'react';
import { Camera, Image as ImageIcon, Video, Box, BookOpen, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: 'image' | 'video' | 'webcam' | 'models' | 'guide';
  setActiveTab: (tab: 'image' | 'video' | 'webcam' | 'models' | 'guide') => void;
  currentModel: string;
  classCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentModel,
  classCount
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-base">ObjectVision</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium border border-slate-200">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Computer Vision & Custom Detection Suite</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'image'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-sky-600" />
              <span>Image</span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'video'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Video className="w-4 h-4 text-purple-600" />
              <span>Video</span>
            </button>

            <button
              onClick={() => setActiveTab('webcam')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'webcam'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Live Camera</span>
            </button>

            <button
              onClick={() => setActiveTab('models')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'models'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Models</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'guide'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">Training Guide</span>
            </button>
          </nav>

          {/* Active Model Indicator */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Model:</span>
            <span className="font-mono text-slate-900 font-semibold">{currentModel}</span>
            <span className="text-slate-400">({classCount} classes)</span>
          </div>

        </div>
      </div>
    </header>
  );
};
