# ObjectVision — Real-Time Object Detection & Custom Model Suite

A clean, practical, and production-ready object detection platform built with Python, FastAPI, YOLO, and React.

## Features
- **Live Camera Detection**: Stream live camera feed with low latency and real-time bounding box annotations.
- **Image & Video File Processing**: Upload any photo or video (MP4, AVI, MOV) for instant object detection and annotation.
- **Custom Model Support**: Seamlessly load and switch between standard YOLO models and custom-trained `.pt` weights.
- **Object Counting & Analysis**: Live breakdown of detected objects, confidence scores, and exportable detection logs (CSV / JSON).
- **Custom Training Pipeline**: Ready-to-run Python training script to train YOLO on custom datasets (Roboflow, CVAT, Kaggle).
- **Clean Humanized Interface**: Modern, distraction-free UI designed for real workflow productivity.

## Project Structure
```
object-detector-pro/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI server & routes
│   │   ├── detector.py          # YOLO inference, tracking & drawing logic
│   │   ├── custom_loader.py     # Custom model weights manager
│   │   └── export_utils.py      # CSV/JSON export and image saving
│   ├── train/
│   │   ├── train_model.py       # Custom dataset training script
│   │   └── data_sample.yaml     # Dataset config template
│   ├── uploads/                 # Uploaded media
│   ├── outputs/                 # Annotated results
│   ├── models/                  # Stored model weights (.pt)
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LiveCamera.tsx   # Live camera feed with controls
│   │   │   ├── FileUpload.tsx   # Image/Video upload and results viewer
│   │   │   ├── DetectionTable.tsx # Object counts & coordinate log
│   │   │   ├── ModelManager.tsx # Custom weights selector & upload
│   │   │   └── TrainingGuide.tsx# How to train custom datasets
│   │   ├── App.tsx
│   │   └── ...
└── start.bat
```
