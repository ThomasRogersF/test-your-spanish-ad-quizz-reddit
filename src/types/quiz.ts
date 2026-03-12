
export type QuestionType = 'mcq' | 'image-selection' | 'audio' | 'text' | 'fill-in-blanks';

export interface ConditionRule {
  questionId: string;
  answerId?: string;
  value?: string;
  nextQuestionId: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  title: string;
  subtitle?: string;
  helpText?: string;
  required: boolean;
  options?: QuizOption[];
  imageOptions?: QuizImageOption[];
  audioUrl?: string;
  conditionalLogic?: ConditionRule[];
}

export interface QuizOption {
  id: string;
  text: string;
  value: string;
}

export interface QuizImageOption {
  id: string;
  src: string;
  alt: string;
  value: string;
}

export interface QuizConfig {
  id: string;
  title: string;
  description?: string;
  logoUrl?: string;
  introImageUrl?: string;
  introText?: string;
  estimatedTime?: string;
  primaryColor?: string;
  secondaryColor?: string;
  webhookUrl: string;
  questions: QuizQuestion[];
  resultTemplates: ResultTemplate[];
  incentiveEnabled: boolean;
  incentiveTitle?: string;
  incentiveUrl?: string;
  externalRedirectUrl?: string;
}

export interface ResultTemplate {
  id: string;
  title: string;
  description: string;
  conditions: {
    questionId: string;
    answerId?: string;
    value?: string;
  }[];
}

export interface QuizAnswer {
  questionId: string;
  type: QuestionType;
  value: string | string[] | File | null;
}

export interface QuizParticipant {
  name: string;
  email: string;
  answers: QuizAnswer[];
}

// Simplified webhook payload structure
export interface SimplifiedWebhookPayload {
  name: string;
  email: string;
  score: number;
  percentageScore?: number;
  "quizz-id": string;
  submissionDate: string;
  timeTakenSeconds: number;
  timeTakenFormatted: string;
  answers: SimplifiedAnswer[];
  totalQuestions: number;
  quizTitle: string;
  resultLevel?: string;
}

// Simplified answer structure
export interface SimplifiedAnswer {
  questionId: string;
  questionText: string;
  userAnswer: string | string[] | File | null;
  userAnswerText: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

// Enhanced participant with timing data
export interface EnhancedQuizParticipant extends QuizParticipant {
  quizStartTime?: Date;
  questionTimings?: Record<string, number>;
}

export interface QuizAdminProps {
  config: QuizConfig;
  onConfigUpdate: (config: QuizConfig) => void;
}
