import os
import cv2
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from ultralytics import YOLO

# Clean, accessible color palette for detection boxes (distinct human-friendly hues)
PALETTE = [
    (59, 130, 246),   # Blue
    (16, 185, 129),   # Emerald
    (245, 158, 11),   # Amber
    (239, 68, 68),    # Red
    (139, 92, 246),   # Purple
    (236, 72, 153),   # Pink
    (14, 165, 233),   # Sky
    (20, 184, 166),   # Teal
    (249, 115, 22),   # Orange
    (99, 102, 241),   # Indigo
]

class ObjectDetectionService:
    def __init__(self, model_name: str = "yolov8n.pt"):
        self.model_name = model_name
        self.model_path = model_name
        self.model = None
        self.classes: Dict[int, str] = {}
        self.load_model(model_name)

    def load_model(self, model_path_or_name: str):
        """Loads or switches the active YOLO model."""
        self.model_name = Path(model_path_or_name).name
        self.model_path = model_path_or_name
        self.model = YOLO(model_path_or_name)
        self.classes = self.model.names if hasattr(self.model, "names") else {}
        print(f"[Detector] Loaded model: {self.model_name} with {len(self.classes)} classes.")

    def get_classes(self) -> List[str]:
        """Returns the list of classes supported by the loaded model."""
        return list(self.classes.values())

    def detect(
        self,
        image: np.ndarray,
        conf_threshold: float = 0.40,
        iou_threshold: float = 0.45,
        allowed_classes: Optional[List[str]] = None
    ) -> Tuple[np.ndarray, List[Dict[str, Any]], Dict[str, int]]:
        """
        Runs object detection on a BGR image array.
        Returns:
            - annotated_image (np.ndarray)
            - detections_list (List[Dict])
            - counts_summary (Dict[str, int])
        """
        if self.model is None:
            raise RuntimeError("Model is not initialized.")

        results = self.model(
            image,
            conf=conf_threshold,
            iou=iou_threshold,
            verbose=False
        )

        detections = []
        counts: Dict[str, int] = {}
        annotated_image = image.copy()
        h, w = image.shape[:2]

        if not results or len(results) == 0:
            return annotated_image, detections, counts

        boxes = results[0].boxes
        if boxes is None or len(boxes) == 0:
            return annotated_image, detections, counts

        for box in boxes:
            cls_id = int(box.cls[0].item())
            cls_name = self.classes.get(cls_id, f"class_{cls_id}")

            # Filter classes if user selected specific ones
            if allowed_classes and len(allowed_classes) > 0 and cls_name not in allowed_classes:
                continue

            conf = float(box.conf[0].item())
            xyxy = box.xyxy[0].cpu().numpy()
            x1, y1, x2, y2 = int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])

            # Update count summary
            counts[cls_name] = counts.get(cls_name, 0) + 1

            # Store detection data
            det_info = {
                "class_id": cls_id,
                "class_name": cls_name,
                "confidence": round(conf, 3),
                "box": {
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2,
                    "width": x2 - x1,
                    "height": y2 - y1
                },
                "normalized_box": {
                    "x1": round(x1 / w, 4),
                    "y1": round(y1 / h, 4),
                    "x2": round(x2 / w, 4),
                    "y2": round(y2 / h, 4)
                }
            }
            detections.append(det_info)

            # Draw clean professional bounding box
            color = PALETTE[cls_id % len(PALETTE)]
            self._draw_box(annotated_image, (x1, y1, x2, y2), cls_name, conf, color)

        return annotated_image, detections, counts

    def _draw_box(
        self,
        img: np.ndarray,
        coords: Tuple[int, int, int, int],
        label: str,
        conf: float,
        color: Tuple[int, int, int]
    ):
        """Draws a clean, modern bounding box with label tag."""
        x1, y1, x2, y2 = coords
        h, w = img.shape[:2]

        # Draw outer rectangle
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2, cv2.LINE_AA)

        # Label text
        text = f"{label} {int(conf * 100)}%"
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.5
        thickness = 1
        (tw, th), baseline = cv2.getTextSize(text, font, font_scale, thickness)

        # Label background pill
        tag_y1 = max(0, y1 - th - 8)
        tag_y2 = y1
        tag_x2 = min(w, x1 + tw + 10)

        # Draw label background
        cv2.rectangle(img, (x1, tag_y1), (tag_x2, tag_y2), color, -1)
        # Draw readable label text
        cv2.putText(
            img,
            text,
            (x1 + 5, y1 - 5),
            font,
            font_scale,
            (255, 255, 255),
            thickness,
            cv2.LINE_AA
        )

# Global service instance
detector_service = ObjectDetectionService("yolov8n.pt")
