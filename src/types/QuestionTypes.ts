export interface Option {
  optionId: string;
  text: string;
}

export interface Question {
  id: string;
  type: string;
  text: string;
  options: Option[];
  correctAnswer: string;
  points: number;
}

export interface QuestionData {
  type: string;
  text: string;
  options: Option[];
  correctAnswer: string;
  points: number;
}
