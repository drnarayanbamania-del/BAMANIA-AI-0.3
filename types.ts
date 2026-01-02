
export interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
  seed: number;
  width: number;
  height: number;
}

export type ViewState = 'landing' | 'app';

export type Resolution = '512x512' | '1024x1024' | '1536x1536';
