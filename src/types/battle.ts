
export interface BattleRoom {
  id: string;
  room_code: string;
  battle_type: '1v1' | '2v2' | '4p';
  max_players: number;
  current_players: number;
  status: 'waiting' | 'in_progress' | 'completed';
  subject_id: string | null;
  chapter_id: string | null;
  questions: any[] | null;
  current_question: number;
  time_per_question: number;
  total_questions: number;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface Participant {
  id: string;
  battle_room_id: string;
  user_id: string;
  username: string;
  team: number | null;
  score: number;
  answers: any[];
  is_ready: boolean;
  joined_at: string;
}

export interface BattleResult {
  id: string;
  battle_room_id: string;
  user_id: string;
  final_score: number;
  rank: number;
  total_correct: number;
  total_questions: number;
  accuracy_percentage: number | null;
  time_bonus: number;
  created_at: string;
}

// Database types from Supabase
export interface DatabaseBattleRoom {
  id: string;
  room_code: string;
  battle_type: string;
  max_players: number;
  current_players: number;
  status: string;
  subject_id: string | null;
  chapter_id: string | null;
  questions: any;
  current_question: number;
  time_per_question: number;
  total_questions: number;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface DatabaseParticipant {
  id: string;
  battle_room_id: string;
  user_id: string;
  username: string;
  team: number | null;
  score: number;
  answers: any;
  is_ready: boolean;
  joined_at: string;
}
