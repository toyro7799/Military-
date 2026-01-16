export interface MilitaryRecord {
  militaryNumber: string;
  rank: string;
  name: string;
  date: string;
  location: string;
  nationalId: string;
  notes: string;
}

export enum ProcessingStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error'
}