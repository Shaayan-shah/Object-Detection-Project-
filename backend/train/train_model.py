"""
Custom YOLO Model Training Script
=================================
Use this script to train a custom YOLOv8 model on your own dataset.

Usage:
    python train_model.py --data ./dataset/data.yaml --epochs 50 --imgsz 640 --name my_custom_model
"""

import argparse
import shutil
from pathlib import Path
from ultralytics import YOLO

def train(data_yaml: str, epochs: int = 50, imgsz: int = 640, base_model: str = "yolov8n.pt", name: str = "custom_model"):
    print("=" * 60)
    print(f"Starting Training for: {name}")
    print(f"Dataset config: {data_yaml}")
    print(f"Epochs: {epochs} | Image Size: {imgsz} | Base Model: {base_model}")
    print("=" * 60)

    # Initialize base model
    model = YOLO(base_model)

    # Train the model
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        name=name,
        plots=True,
        save=True
    )

    # Locate best trained weights
    runs_dir = Path("runs/detect") / name / "weights" / "best.pt"
    models_dir = Path(__file__).resolve().parent.parent / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    if runs_dir.exists():
        dest_path = models_dir / f"{name}.pt"
        shutil.copy(runs_dir, dest_path)
        print("\n" + "=" * 60)
        print(f" Training Complete!")
        print(f" Best model weights saved to: {dest_path}")
        print(" You can now select this model directly in the web dashboard.")
        print("=" * 60)
    else:
        print("\n Training finished. Check runs/detect for results.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train a custom YOLOv8 model.")
    parser.add_argument("--data", type=str, default="data_template.yaml", help="Path to data.yaml file")
    parser.add_argument("--epochs", type=int, default=30, help="Number of training epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Input image resolution")
    parser.add_argument("--base", type=str, default="yolov8n.pt", help="Base model weights (yolov8n.pt, yolov8s.pt)")
    parser.add_argument("--name", type=str, default="custom_detector", help="Project/run name")

    args = parser.parse_args()
    train(
        data_yaml=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        base_model=args.base,
        name=args.name
    )
