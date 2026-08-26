import axios from 'axios';
import { ImageDetectionResult, VideoDetectionResult, ModelInfo } from '../types';

const API_BASE = '/api';

export const api = {
  getHealth: async () => {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  },

  getModels: async (): Promise<{ current_model: string; models: ModelInfo[]; classes: string[] }> => {
    const res = await axios.get(`${API_BASE}/models`);
    return res.data;
  },

  selectModel: async (modelName: string) => {
    const res = await axios.post(`${API_BASE}/models/select`, { model_name: modelName });
    return res.data;
  },

  uploadCustomModel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/models/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  detectImage: async (file: File, confidence: number, classes?: string[]): Promise<ImageDetectionResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('confidence', confidence.toString());
    if (classes && classes.length > 0) {
      formData.append('classes', classes.join(','));
    }
    const res = await axios.post(`${API_BASE}/detect/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  detectVideo: async (file: File, confidence: number, classes?: string[]): Promise<VideoDetectionResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('confidence', confidence.toString());
    if (classes && classes.length > 0) {
      formData.append('classes', classes.join(','));
    }
    const res = await axios.post(`${API_BASE}/detect/video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  updateStreamSettings: async (confidence: number, allowedClasses?: string[]) => {
    const res = await axios.post(`${API_BASE}/stream/settings`, {
      confidence,
      allowed_classes: allowedClasses
    });
    return res.data;
  }
};
