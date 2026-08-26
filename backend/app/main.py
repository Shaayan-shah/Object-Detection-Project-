import os
import cv2
import time
import shutil
import numpy as np
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel

from app.detector import detector_service
from app.custom_loader import list_available_models, save_custom_model
from app.export_utils import export_detections_csv, export_detections_json

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="ObjectVision API",
    description="Clean, real-time object detection and custom model inference backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads and outputs
app.mount("/static/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
app.mount("/static/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")

# Live stream settings state
class StreamSettings:
    confidence: float = 0.40
    iou: float = 0.45
    allowed_classes: List[str] = []

stream_config = StreamSettings()

# --- Health Check ---
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "current_model": detector_service.model_name,
        "available_classes_count": len(detector_service.classes)
    }

# --- Model Management ---
@app.get("/api/models")
def get_models():
    return {
        "current_model": detector_service.model_name,
        "models": list_available_models(),
        "classes": detector_service.get_classes()
    }

class ModelSelectRequest(BaseModel):
    model_name: str

@app.post("/api/models/select")
def select_model(payload: ModelSelectRequest):
    try:
        # Check if file exists in models directory or is standard
        models_dir = BASE_DIR / "models"
        custom_file = models_dir / payload.model_name
        
        if custom_file.exists():
            detector_service.load_model(str(custom_file))
        else:
            detector_service.load_model(payload.model_name)
            
        return {
            "success": True,
            "current_model": detector_service.model_name,
            "classes": detector_service.get_classes()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to load model: {str(e)}")

@app.post("/api/models/upload")
async def upload_custom_model(file: UploadFile = File(...)):
    if not file.filename.endswith(".pt"):
        raise HTTPException(status_code=400, detail="Only .pt model weight files are supported.")
    
    file_bytes = await file.read()
    saved_path = save_custom_model(file.filename, file_bytes)
    
    # Auto-switch to newly uploaded model
    try:
        detector_service.load_model(saved_path)
    except Exception as e:
        pass

    return {
        "success": True,
        "filename": file.filename,
        "current_model": detector_service.model_name,
        "classes": detector_service.get_classes()
    }

# --- Image Detection ---
@app.post("/api/detect/image")
async def detect_image(
    file: UploadFile = File(...),
    confidence: float = Form(0.40),
    classes: Optional[str] = Form(None)
):
    try:
        file_bytes = await file.read()
        nparr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format.")

        allowed = [c.strip() for c in classes.split(",") if c.strip()] if classes else None

        # Run inference
        annotated_img, detections, counts = detector_service.detect(
            image=img,
            conf_threshold=confidence,
            allowed_classes=allowed
        )

        # Save annotated output
        timestamp = int(time.time() * 1000)
        output_filename = f"detected_{timestamp}_{file.filename}"
        output_path = OUTPUTS_DIR / output_filename
        cv2.imwrite(str(output_path), annotated_img)

        # Save original upload
        upload_filename = f"orig_{timestamp}_{file.filename}"
        upload_path = UPLOADS_DIR / upload_filename
        cv2.imwrite(str(upload_path), img)

        return {
            "success": True,
            "original_url": f"/static/uploads/{upload_filename}",
            "annotated_url": f"/static/outputs/{output_filename}",
            "filename": file.filename,
            "total_objects": len(detections),
            "counts": counts,
            "detections": detections,
            "image_dimensions": {"width": img.shape[1], "height": img.shape[0]}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Video Detection ---
@app.post("/api/detect/video")
async def detect_video(
    file: UploadFile = File(...),
    confidence: float = Form(0.40),
    classes: Optional[str] = Form(None)
):
    try:
        timestamp = int(time.time() * 1000)
        input_filename = f"input_{timestamp}_{file.filename}"
        input_path = UPLOADS_DIR / input_filename

        with open(input_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        cap = cv2.VideoCapture(str(input_path))
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Unable to read video file.")

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        output_filename = f"annotated_{timestamp}.mp4"
        output_path = OUTPUTS_DIR / output_filename

        # Write output video with mp4v codec
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))

        allowed = [c.strip() for c in classes.split(",") if c.strip()] if classes else None
        
        cumulative_counts: dict = {}
        processed_frames = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            annotated_frame, detections, counts = detector_service.detect(
                image=frame,
                conf_threshold=confidence,
                allowed_classes=allowed
            )

            for cname, cval in counts.items():
                cumulative_counts[cname] = cumulative_counts.get(cname, 0) + cval

            out.write(annotated_frame)
            processed_frames += 1

        cap.release()
        out.release()

        return {
            "success": True,
            "video_url": f"/static/outputs/{output_filename}",
            "frames_processed": processed_frames,
            "cumulative_counts": cumulative_counts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Live Camera MJPEG Stream ---
def generate_webcam_stream():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        # Fallback dummy frame generator if no camera attached
        while True:
            blank = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(blank, "Webcam Not Detected / Available", (100, 240), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2)
            ret, buffer = cv2.imencode('.jpg', blank)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.1)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        annotated_frame, _, _ = detector_service.detect(
            image=frame,
            conf_threshold=stream_config.confidence,
            iou_threshold=stream_config.iou,
            allowed_classes=stream_config.allowed_classes if stream_config.allowed_classes else None
        )

        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        if not ret:
            continue

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        time.sleep(0.03)

    cap.release()

@app.get("/api/stream/live")
def live_stream():
    return StreamingResponse(
        generate_webcam_stream(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

class StreamUpdateRequest(BaseModel):
    confidence: float
    allowed_classes: Optional[List[str]] = None

@app.post("/api/stream/settings")
def update_stream_settings(payload: StreamUpdateRequest):
    stream_config.confidence = payload.confidence
    if payload.allowed_classes is not None:
        stream_config.allowed_classes = payload.allowed_classes
    return {"success": True, "confidence": stream_config.confidence}
