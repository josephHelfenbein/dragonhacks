export type PostureStatus = 'good' | 'bad' | 'unknown';

export type PostureDetectionResult = {
  posture: 'good' | 'bad';
  confidence: number;
  timestamp: string;
};

export type PhoneDetectionResult = {
  phoneDetected: boolean;
  confidence: number;
  timestamp: string;
};

export type StudySessionStats = {
  duration: number; // in milliseconds
  postureIssues: number;
  phoneDistractions: number;
  focusPercentage: number;
  waterIntake: number;
};
