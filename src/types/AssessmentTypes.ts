import { Question } from "./QuestionTypes";

export interface AssessmentSettings {
  randomizeQuestions: boolean;
  showResult: boolean;
  allowRetake: boolean;
  maxAttempts: number;
  timeLimitEnforced: boolean;
  requireWebcam: boolean;
  preventTabSwitching: true;
  requireIdentityVerification: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  status: string;
  dueDate: string;
  createdBy: string;
  createdDate: string;
  attempts: number;
  passingScore: number;
  questionCount: number;
}
export interface AssessmentDetails extends Assessment{
  questions: Question[];
  settings: AssessmentSettings;
}

export interface AssessmentData {
  title: string;
  subject: string;
  description: string;
  duration: number;
  dueDate: string;
  status: string;
  passingScore: number;
}

export interface SubjectCount {
  subject: string;
  count: number;
}

export interface AsssessmentsStatistics {
  totalAssessments: number;
  activeAssessments: number;
  draftAssessments: number;
  expiredAssessments: number;
  totalAttempts: number;
  passRate: number;
  averageScore: number;
  bySubject: SubjectCount[];
}
