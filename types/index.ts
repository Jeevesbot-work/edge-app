export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  age: number | null;
  goal: string | null;
  training_state: string | null;
  injuries: string | null;
  days_per_week: number;
  commitment_answer: string | null;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgrammeState {
  id: string;
  user_id: string;
  current_day: number;
  current_week: number;
  start_date: string;
  active: boolean;
}

export interface CheckIn {
  id: string;
  user_id: string;
  date: string;
  sleep_quality: number;
  morning_energy: number;
  stress_level: number;
  soreness: number;
  motivation: number;
  notes: string | null;
  edge_response: string | null;
  created_at: string;
}

export interface TrainingSession {
  id: string;
  user_id: string;
  session_type: "push" | "squat" | "pull";
  session_number: number;
  completed_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
}

export interface ExerciseLog {
  id: string;
  session_id: string;
  user_id: string;
  exercise_name: string;
  sets_completed: number;
  reps: number | null;
  weight_kg: number | null;
  struggled: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface LessonCompletion {
  id: string;
  user_id: string;
  day_number: number;
  cycle: number;
  reflection: string | null;
  micro_action_done: boolean;
  end_of_day_score: number | null;
  completed_at: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  date: string;
  bedtime: string | null;
  wake_time: string | null;
  quality: number | null;
  duration_hours: number | null;
  created_at: string;
}

export interface AdminNote {
  id: string;
  user_id: string;
  note: string;
  created_by: string;
  created_at: string;
}

export interface LessonData {
  day: number;
  phase: string;
  phaseCode: string;
  title: string;
  content: string;
  voiceJournalPrompt: string;
  reflectionQuestions: string[];
  microAction: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  notes?: string;
}

export interface SessionData {
  type: "push" | "squat" | "pull";
  name: string;
  warmup: string[];
  exercises: Exercise[];
  finisher: string;
  coachNote: string;
}
