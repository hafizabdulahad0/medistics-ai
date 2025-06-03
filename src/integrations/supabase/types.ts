export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_chat_sessions: {
        Row: {
          created_at: string
          id: string
          messages: Json | null
          session_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json | null
          session_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json | null
          session_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_generated_tests: {
        Row: {
          accuracy: number | null
          difficulty: string
          generated_at: string
          id: string
          questions: Json
          score: number | null
          test_taken: boolean | null
          topic: string
          total_questions: number
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          difficulty: string
          generated_at?: string
          id?: string
          questions: Json
          score?: number | null
          test_taken?: boolean | null
          topic: string
          total_questions: number
          user_id: string
        }
        Update: {
          accuracy?: number | null
          difficulty?: string
          generated_at?: string
          id?: string
          questions?: Json
          score?: number | null
          test_taken?: boolean | null
          topic?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      battle_participants: {
        Row: {
          answers: Json | null
          battle_room_id: string | null
          id: string
          is_ready: boolean | null
          joined_at: string
          score: number | null
          team: number | null
          user_id: string
          username: string
        }
        Insert: {
          answers?: Json | null
          battle_room_id?: string | null
          id?: string
          is_ready?: boolean | null
          joined_at?: string
          score?: number | null
          team?: number | null
          user_id: string
          username: string
        }
        Update: {
          answers?: Json | null
          battle_room_id?: string | null
          id?: string
          is_ready?: boolean | null
          joined_at?: string
          score?: number | null
          team?: number | null
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_participants_battle_room_id_fkey"
            columns: ["battle_room_id"]
            isOneToOne: false
            referencedRelation: "battle_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_results: {
        Row: {
          accuracy_percentage: number | null
          battle_room_id: string | null
          created_at: string
          final_score: number
          id: string
          rank: number
          time_bonus: number | null
          total_correct: number
          total_questions: number
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          battle_room_id?: string | null
          created_at?: string
          final_score: number
          id?: string
          rank: number
          time_bonus?: number | null
          total_correct: number
          total_questions: number
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          battle_room_id?: string | null
          created_at?: string
          final_score?: number
          id?: string
          rank?: number
          time_bonus?: number | null
          total_correct?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_results_battle_room_id_fkey"
            columns: ["battle_room_id"]
            isOneToOne: false
            referencedRelation: "battle_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_rooms: {
        Row: {
          battle_type: string
          chapter_id: string | null
          created_at: string
          current_players: number | null
          current_question: number | null
          ended_at: string | null
          id: string
          max_players: number
          questions: Json | null
          room_code: string
          started_at: string | null
          status: string
          subject_id: string | null
          time_per_question: number | null
          total_questions: number | null
        }
        Insert: {
          battle_type: string
          chapter_id?: string | null
          created_at?: string
          current_players?: number | null
          current_question?: number | null
          ended_at?: string | null
          id?: string
          max_players: number
          questions?: Json | null
          room_code: string
          started_at?: string | null
          status?: string
          subject_id?: string | null
          time_per_question?: number | null
          total_questions?: number | null
        }
        Update: {
          battle_type?: string
          chapter_id?: string | null
          created_at?: string
          current_players?: number | null
          current_question?: number | null
          ended_at?: string | null
          id?: string
          max_players?: number
          questions?: Json | null
          room_code?: string
          started_at?: string | null
          status?: string
          subject_id?: string | null
          time_per_question?: number | null
          total_questions?: number | null
        }
        Relationships: []
      }
      chapters: {
        Row: {
          chapter_number: number
          created_at: string
          description: string | null
          id: string
          name: string
          subject_id: string | null
        }
        Insert: {
          chapter_number: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          subject_id?: string | null
        }
        Update: {
          chapter_number?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_entries: {
        Row: {
          battles_won: number | null
          best_streak: number | null
          current_streak: number | null
          id: string
          rank_points: number | null
          tier: string | null
          total_battles: number | null
          total_score: number | null
          updated_at: string
          user_id: string
          username: string
          win_rate: number | null
        }
        Insert: {
          battles_won?: number | null
          best_streak?: number | null
          current_streak?: number | null
          id?: string
          rank_points?: number | null
          tier?: string | null
          total_battles?: number | null
          total_score?: number | null
          updated_at?: string
          user_id: string
          username: string
          win_rate?: number | null
        }
        Update: {
          battles_won?: number | null
          best_streak?: number | null
          current_streak?: number | null
          id?: string
          rank_points?: number | null
          tier?: string | null
          total_battles?: number | null
          total_score?: number | null
          updated_at?: string
          user_id?: string
          username?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      mcqs: {
        Row: {
          category: string | null
          chapter_id: string | null
          correct_answer: string
          created_at: string | null
          difficulty: string | null
          explanation: string | null
          id: string
          options: Json
          question: string
          subject: string | null
        }
        Insert: {
          category?: string | null
          chapter_id?: string | null
          correct_answer: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          options: Json
          question: string
          subject?: string | null
        }
        Update: {
          category?: string | null
          chapter_id?: string | null
          correct_answer?: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          options?: Json
          question?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mcqs_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          medical_school: string | null
          updated_at: string | null
          username: string | null
          year_of_study: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          medical_school?: string | null
          updated_at?: string | null
          username?: string | null
          year_of_study?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          medical_school?: string | null
          updated_at?: string | null
          username?: string | null
          year_of_study?: number | null
        }
        Relationships: []
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_answers: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          mcq_id: string | null
          selected_answer: string
          time_taken: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          mcq_id?: string | null
          selected_answer: string
          time_taken?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          mcq_id?: string | null
          selected_answer?: string
          time_taken?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_mcq_id_fkey"
            columns: ["mcq_id"]
            isOneToOne: false
            referencedRelation: "mcqs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          accuracy_percentage: number | null
          chapter_id: string | null
          correct_answers: number | null
          created_at: string
          id: string
          last_attempted: string | null
          streak_days: number | null
          total_questions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          chapter_id?: string | null
          correct_answers?: number | null
          created_at?: string
          id?: string
          last_attempted?: string | null
          streak_days?: number | null
          total_questions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          chapter_id?: string | null
          correct_answers?: number | null
          created_at?: string
          id?: string
          last_attempted?: string | null
          streak_days?: number | null
          total_questions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_scores: {
        Row: {
          created_at: string | null
          id: string
          quiz_type: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          quiz_type: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          quiz_type?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
