
export interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
  seed: number;
  width: number;
  height: number;
  isUpscaled?: boolean;
  generationTime?: number; // Time in seconds
  isFavorite?: boolean;
}

export interface SavedPrompt {
  id: string;
  prompt: string;
  seed: string;
  resolution: Resolution;
  timestamp: number;
}

export type ViewState = 'landing' | 'app';

export type Resolution = '512x512' | '1024x1024' | '1536x1536' | '2048x2048';
