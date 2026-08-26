import os
from pathlib import Path
from typing import List, Dict, Any
from app.detector import detector_service

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_MODELS = [
    {"name": "yolov8n.pt", "label": "YOLOv8 Nano (Fastest, Lightweight)", "type": "standard"},
    {"name": "yolov8s.pt", "label": "YOLOv8 Small (Balanced Speed/Accuracy)", "type": "standard"},
    {"name": "yolov8m.pt", "label": "YOLOv8 Medium (High Accuracy)", "type": "standard"},
]

def list_available_models() -> List[Dict[str, Any]]:
    """Returns all available standard models and uploaded custom models."""
    models = list(DEFAULT_MODELS)
    
    # Scan custom models in models/
    for file in MODELS_DIR.glob("*.pt"):
        if not any(m["name"] == file.name for m in models):
            size_mb = round(file.stat().st_size / (1024 * 1024), 2)
            models.append({
                "name": file.name,
                "label": f"Custom: {file.stem} ({size_mb} MB)",
                "type": "custom",
                "path": str(file)
            })
            
    return models

def save_custom_model(file_name: str, file_bytes: bytes) -> str:
    """Saves an uploaded .pt model to the models folder."""
    target_path = MODELS_DIR / file_name
    with open(target_path, "wb") as f:
        f.write(file_bytes)
    return str(target_path)
