import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ImageAnalysis } from './components/ImageAnalysis';
import { VideoAnalysis } from './components/VideoAnalysis';
import { LiveWebcam } from './components/LiveWebcam';
import { ModelHub } from './components/ModelHub';
import { TrainingGuide } from './components/TrainingGuide';
import { ModelInfo } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'webcam' | 'models' | 'guide'>('image');
  const [currentModel, setCurrentModel] = useState<string>('yolov8n.pt');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchModelData = useCallback(async () => {
    try {
      const data = await api.getModels();
      setCurrentModel(data.current_model);
      setModels(data.models);
      setClasses(data.classes);
    } catch (err) {
      console.error('Error fetching model metadata:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModelData();
  }, [fetchModelData]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentModel={currentModel}
        classCount={classes.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'image' && <ImageAnalysis availableClasses={classes} />}
        {activeTab === 'video' && <VideoAnalysis availableClasses={classes} />}
        {activeTab === 'webcam' && <LiveWebcam availableClasses={classes} />}
        {activeTab === 'models' && (
          <ModelHub
            currentModel={currentModel}
            models={models}
            classes={classes}
            onModelSwitched={fetchModelData}
          />
        )}
        {activeTab === 'guide' && <TrainingGuide />}
      </main>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        ObjectVision Studio • Built with Python, Ultralytics YOLO & React
      </footer>

    </div>
  );
}

export default App;
