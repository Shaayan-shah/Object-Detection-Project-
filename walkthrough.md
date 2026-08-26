# ObjectVision — Custom Object Detection & Training Platform

A clean, practical, and human-crafted object detection application and custom training pipeline built with **Python, FastAPI, Ultralytics YOLO, and React + Tailwind CSS**.

---

## 🛠️ Key Capabilities

### 1. Photo Object Detection (`ImageAnalysis.tsx`)
- Drag-and-drop or select any image (PNG, JPG, WebP).
- Real-time confidence threshold slider.
- Class filter checklist (select only the specific objects you want to detect).
- Switch between **Annotated View** (with crisp, readable bounding box labels) and **Original Photo**.
- **Object Count Summary** (e.g. *2 Persons, 1 Car, 1 Bicycle*).
- **Coordinate Table** listing Class Name, Confidence %, and bounding box coordinates (`x1, y1, width, height`).
- Export options: Download **Annotated JPG**, **CSV Spreadsheet**, or **JSON Data**.

### 2. Video File Processing (`VideoAnalysis.tsx`)
- Upload recorded videos (MP4, AVI, MOV).
- Frame-by-frame neural network inference with progress indicator.
- Built-in video player to review annotated video.
- Cumulative detection count statistics across the entire video duration.
- One-click download of the annotated MP4 video.

### 3. Real-Time Live Camera Feed (`LiveWebcam.tsx`)
- Low-latency live webcam inference using MJPEG streaming.
- Dynamic adjustments: tweak confidence thresholds or filter classes in real-time.
- Pause and resume camera controls.

### 4. Neural Network & Custom Model Hub (`ModelHub.tsx`)
- Switch instantly between pre-trained standard models:
  - **YOLOv8 Nano** (fastest, lightweight)
  - **YOLOv8 Small** (balanced accuracy and speed)
  - **YOLOv8 Medium** (higher precision)
- **Upload Custom Weights (`.pt`)**: Upload any custom-trained model file directly through the UI to start detecting custom domain objects immediately.
- Browse all supported classes for the currently active model.

### 5. Custom Training Pipeline (`backend/train/train_model.py`)
- Practical, well-commented Python training script.
- Ready to fine-tune on custom datasets (e.g. Roboflow, CVAT, Kaggle).
- Automatically exports the best trained weights (`best.pt`) straight into the `models/` directory for instant use in the web app.

---

## 📁 Project Structure

```
d:/AntiGravity Projects/object-detector-pro/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI REST & streaming endpoints
│   │   ├── detector.py          # YOLO inference, class filtering & box drawing
│   │   ├── custom_loader.py     # Custom model weights manager
│   │   └── export_utils.py      # CSV & JSON export formatters
│   ├── train/
│   │   ├── train_model.py       # Custom dataset training script
│   │   └── data_template.yaml   # Dataset YAML template
│   ├── models/                  # Stored model weights (.pt)
│   ├── uploads/                 # Uploaded media storage
│   ├── outputs/                 # Annotated images & videos
│   ├── requirements.txt         # Python dependencies
│   └── run.py                   # Backend entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx       # Clean header with active model indicator
│   │   │   ├── ImageAnalysis.tsx# Photo detection & table inspector
│   │   │   ├── VideoAnalysis.tsx# Video batch processor & player
│   │   │   ├── LiveWebcam.tsx   # Live webcam stream with sliders
│   │   │   ├── ModelHub.tsx     # Custom weights manager
│   │   │   └── TrainingGuide.tsx# Custom training workflow guide
│   │   ├── services/api.ts      # Axios API client
│   │   ├── types/index.ts       # TypeScript interfaces
│   │   ├── App.tsx              # Root view & tab navigation
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── start.bat                    # One-click Windows startup script
```

---

## 🚀 How to Run

### Method 1: One-Click Windows Launcher
Double-click `start.bat` in `d:\AntiGravity Projects\object-detector-pro\start.bat`.

### Method 2: Manual Terminal Commands
1. **Start the Backend:**
   ```bash
   cd "d:\AntiGravity Projects\object-detector-pro\backend"
   python run.py
   ```
   *Runs at `http://localhost:8000` (API Docs: `http://localhost:8000/docs`)*

2. **Start the Frontend:**
   ```bash
   cd "d:\AntiGravity Projects\object-detector-pro\frontend"
   npm run dev
   ```
   *Opens the web app at `http://localhost:5173`*
