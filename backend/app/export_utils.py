import io
import csv
import json
from typing import List, Dict, Any

def export_detections_csv(detections: List[Dict[str, Any]], filename: str = "image") -> str:
    """Generates a formatted CSV string from detection results."""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # CSV Header
    writer.writerow([
        "Index", "Source_File", "Class_Name", "Class_ID", "Confidence", 
        "Box_X1", "Box_Y1", "Box_X2", "Box_Y2", "Box_Width", "Box_Height"
    ])
    
    for idx, det in enumerate(detections, 1):
        box = det.get("box", {})
        writer.writerow([
            idx,
            filename,
            det.get("class_name"),
            det.get("class_id"),
            det.get("confidence"),
            box.get("x1"),
            box.get("y1"),
            box.get("x2"),
            box.get("y2"),
            box.get("width"),
            box.get("height")
        ])
        
    return output.getvalue()

def export_detections_json(detections: List[Dict[str, Any]], counts: Dict[str, int], metadata: Dict[str, Any]) -> str:
    """Generates a structured JSON string with metadata and detection objects."""
    data = {
        "metadata": metadata,
        "summary": {
            "total_objects": len(detections),
            "counts_by_class": counts
        },
        "detections": detections
    }
    return json.dumps(data, indent=2)
