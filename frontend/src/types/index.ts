export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

export interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  box: BoundingBox;
  normalized_box: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface ImageDetectionResult {
  success: boolean;
  original_url: string;
  annotated_url: string;
  filename: string;
  total_objects: number;
  counts: Record<string, number>;
  detections: Detection[];
  image_dimensions: { width: number; height: number };
}

export interface VideoDetectionResult {
  success: boolean;
  video_url: string;
  frames_processed: number;
  cumulative_counts: Record<string, number>;
}

export interface ModelInfo {
  name: string;
  label: string;
  type: 'standard' | 'custom';
  path?: string;
}
