export type GreetingTemplateId = 
  | 'galaxy-love'
  | 'sparkle-love'
  | 'birthday'
  | 'wish'
  | 'thank-you'
  | 'memory';

export interface ExperienceData {
  slug: string;
  template: GreetingTemplateId;
  title: string;
  recipientName: string;
  senderName?: string;
  message: string;
  theme?: 'romantic' | 'celestial' | 'warm' | 'celebration';
  musicUrl?: string;
  createdAt?: string;
}

export interface CandleConfig {
  waxColor: string;
  waxHeight: number;
  waxRadius: number;
  baseColor: string;
}

export const DEFAULT_CANDLE_CONFIG: CandleConfig = {
  waxColor: '#fdf2e9',
  waxHeight: 2.2,
  waxRadius: 0.55,
  baseColor: '#2d242f',
};

export interface FlameConfig {
  innerColor: string;
  outerColor: string;
  maxScale: number;
  flickerSpeed: number;
  lightIntensity: number;
}

export const DEFAULT_FLAME_CONFIG: FlameConfig = {
  innerColor: '#fffbeb',
  outerColor: '#f97316',
  maxScale: 1.0,
  flickerSpeed: 8.0,
  lightIntensity: 4.5,
};

export interface Text3DConfig {
  nameColor: string;
  nameGlowColor: string;
  messageColor: string;
  nameFontSize: number;
  messageFontSize: number;
  floatSpeed: number;
}

export const DEFAULT_TEXT3D_CONFIG: Text3DConfig = {
  nameColor: '#ffffff',
  nameGlowColor: '#fda4af',
  messageColor: '#fce7f3',
  nameFontSize: 0.36,
  messageFontSize: 0.15,
  floatSpeed: 1.5,
};


