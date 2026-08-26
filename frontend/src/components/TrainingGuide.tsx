import React from 'react';
import { BookOpen, Terminal, FolderTree, CheckCircle, ArrowRight } from 'lucide-react';

export const TrainingGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-600" />
          <span>Custom YOLO Training Guide</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Follow this 4-step workflow to train your own custom object detector on custom datasets (e.g. PPE gear, traffic, products).
        </p>
      </div>

      {/* Step 1: Data Gathering & Labeling */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">1</span>
          <h3>Gather & Label Dataset Images</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Collect 50–500 images of the objects you want to detect. Use a free annotation tool like <strong>Roboflow Universe</strong> or <strong>CVAT.ai</strong> to draw bounding boxes around your objects and export in <strong>YOLOv8 PyTorch format</strong>.
        </p>
      </div>

      {/* Step 2: Dataset Directory Structure */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">2</span>
          <h3>Organize Your Dataset Directory</h3>
        </div>
        <p className="text-xs text-slate-600">
          Place your extracted dataset inside the project under <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">backend/dataset/</code> with the following standard structure:
        </p>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
          <pre>{`dataset/
├── data.yaml            # Dataset configuration
├── images/
│   ├── train/          # Training images (.jpg/.png)
│   └── val/            # Validation images
└── labels/
    ├── train/          # YOLO annotation txt files
    └── val/`}</pre>
        </div>
      </div>

      {/* Step 3: Run the Training Script */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">3</span>
          <h3>Execute the Python Training Script</h3>
        </div>
        <p className="text-xs text-slate-600">
          Open a terminal in the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">backend/train/</code> directory and run:
        </p>

        <div className="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono text-xs overflow-x-auto flex items-center justify-between">
          <code>python train_model.py --data ../dataset/data.yaml --epochs 40 --name ppe_detector</code>
        </div>
        
        <p className="text-[11px] text-slate-400">
          Training will automatically use your GPU (CUDA) if available, otherwise it falls back to multi-core CPU.
        </p>
      </div>

      {/* Step 4: Automatic Import */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">4</span>
          <h3>Deploy & Run Live in ObjectVision</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The training script automatically copies the best trained weights (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">best.pt</code>) into <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">backend/models/</code>.
          Navigate to the <strong>Models</strong> tab and click <strong>Switch to Model</strong> to immediately start detecting custom objects in photos, videos, and live webcam!
        </p>
      </div>

    </div>
  );
};
