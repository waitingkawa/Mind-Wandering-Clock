export type BreathPhaseType = 'Inhale' | 'Hold (In)' | 'Exhale' | 'Hold (Out)';

export interface BreathPhase {
  type: BreathPhaseType;
  duration: number; // in seconds
  instruction: string;
}

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  phases: BreathPhase[];
}

export interface ZenQuote {
  text: string;
  author: string;
}

export interface SoundState {
  id: string;
  name: string;
  icon: string;
  volume: number;
  isActive: boolean;
}
