export interface MusicTrack {
  id: string;
  title: string;
  audioUrl: string;
  sourceUrl: string | null;
  isEnabled: boolean;
  sortOrder: number;
  revision: number;
}

export const MUSIC_UPDATED_EVENT = "craftvision:music-updated";
export const MUSIC_MAX_BYTES = 15 * 1024 * 1024;
