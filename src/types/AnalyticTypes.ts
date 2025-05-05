export interface dailyActiveUser {
  date: string;
  count: number;
}

export interface activityByHour {
  hour: number;
  count: number;
}

export interface activityByType {
  type: string;
  count: number;
}

export interface UserActivity {
  dailyActiveUsers: dailyActiveUser[];
  activityByHour: activityByHour[];
  activityByType: activityByType[];
  totalActiveUsers: number;
  newUsersLastWeek: number;
}

/* --------------------------------------------- */
export interface assessmentCompletionRate {
  id: string;
  title: string;
  started: number;
  completed: number;
  completionRate: number;
}

export interface scoreDistribution {
  range: string;
  count: number;
}

export interface mostChallenging {
  assessmentId: string;
  title: string;
  avgScore: number;
}

export interface mostSuccessful {
  assessmentId: string;
  title: string;
  avgScore: number;
}

export interface AssessmentPerformance {
  assessmentCompletionRates: assessmentCompletionRate[];
  scoreDistribution: scoreDistribution[];
  averageTimeSpent: number;
  mostChallenging: mostChallenging[];
  mostSuccessful: mostSuccessful[];
}

/* -------------------------------- */

export type SuspiciousActivityType = 
  | "TAB_SWITCHING"
  | "FACE_NOT_DETECTED"
  | "MULTIPLE_FACES" 
  | "LOOKING_AWAY"
  | "SUSPICIOUS_OBJECT"
  | "VOICE_DETECTED";

export interface SuspiciousActivity {
  attemptId: string;
  assessmentId: string;
  type: SuspiciousActivityType;
  details: string;
  timestamp: string;
  userAgent: string;
  imageData?: string; // Thêm trường imageData tùy chọn
}

export interface LogSuspiciousActivity {
  id: string;
  userId: string;
  assessmentId: string;
  attemptId: string;
  type: SuspiciousActivityType;
  details: string;
  timestamp: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  reviewed: boolean; 
  createdAt: string;
  imageData?: string; // Thêm trường imageData tùy chọn
}
