
export type TimerState = 'idle' | 'studying' | 'resting';

export interface TimerInterval {
  type: 'study' | 'rest';
  duration: number;
  startTime: number;
  endTime: number;
}