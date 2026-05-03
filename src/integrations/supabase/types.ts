export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string | null
          evento: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          evento: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          evento?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      cronograma: {
        Row: {
          conteudo: string | null
          cor: string | null
          created_at: string | null
          dia_semana: number
          duracao: number | null
          horario: string
          id: string
          materia: string
          tipo_estudo: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conteudo?: string | null
          cor?: string | null
          created_at?: string | null
          dia_semana: number
          duracao?: number | null
          horario: string
          id?: string
          materia: string
          tipo_estudo?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conteudo?: string | null
          cor?: string | null
          created_at?: string | null
          dia_semana?: number
          duracao?: number | null
          horario?: string
          id?: string
          materia?: string
          tipo_estudo?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      flashcard_decks: {
        Row: {
          created_at: string | null
          id: string
          materia: string | null
          nome: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          materia?: string | null
          nome: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          materia?: string | null
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          created_at: string | null
          deck_id: string
          facilidade: number | null
          frente: string
          id: string
          intervalo: number | null
          proxima_revisao: string | null
          repeticoes: number | null
          tags: string[] | null
          user_id: string
          verso: string
        }
        Insert: {
          created_at?: string | null
          deck_id: string
          facilidade?: number | null
          frente: string
          id?: string
          intervalo?: number | null
          proxima_revisao?: string | null
          repeticoes?: number | null
          tags?: string[] | null
          user_id: string
          verso: string
        }
        Update: {
          created_at?: string | null
          deck_id?: string
          facilidade?: number | null
          frente?: string
          id?: string
          intervalo?: number | null
          proxima_revisao?: string | null
          repeticoes?: number | null
          tags?: string[] | null
          user_id?: string
          verso?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      focus_sessions: {
        Row: {
          completado: boolean | null
          created_at: string | null
          duracao: number
          id: string
          materia: string
          procrastinacao_trigger: string | null
          user_id: string
        }
        Insert: {
          completado?: boolean | null
          created_at?: string | null
          duracao?: number
          id?: string
          materia: string
          procrastinacao_trigger?: string | null
          user_id: string
        }
        Update: {
          completado?: boolean | null
          created_at?: string | null
          duracao?: number
          id?: string
          materia?: string
          procrastinacao_trigger?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cognitive_profile: string | null
          created_at: string | null
          email: string | null
          id: string
          level: number | null
          nome: string | null
          streak_dias: number | null
          study_preference: Json | null
          ultimo_estudo: string | null
          xp_total: number | null
        }
        Insert: {
          cognitive_profile?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          level?: number | null
          nome?: string | null
          streak_dias?: number | null
          study_preference?: Json | null
          ultimo_estudo?: string | null
          xp_total?: number | null
        }
        Update: {
          cognitive_profile?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          level?: number | null
          nome?: string | null
          streak_dias?: number | null
          study_preference?: Json | null
          ultimo_estudo?: string | null
          xp_total?: number | null
        }
        Relationships: []
      }
      repertorio_enem: {
        Row: {
          autor: string | null
          created_at: string | null
          id: string
          materia: string
          tema: string
          texto: string
        }
        Insert: {
          autor?: string | null
          created_at?: string | null
          id?: string
          materia: string
          tema: string
          texto: string
        }
        Update: {
          autor?: string | null
          created_at?: string | null
          id?: string
          materia?: string
          tema?: string
          texto?: string
        }
        Relationships: []
      }
      repertorio_favoritos: {
        Row: {
          created_at: string | null
          id: string
          repertorio_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          repertorio_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          repertorio_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repertorio_favoritos_repertorio_id_fkey"
            columns: ["repertorio_id"]
            isOneToOne: false
            referencedRelation: "repertorio_enem"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          adaptativo_score: number | null
          created_at: string | null
          dificuldade_media: number | null
          id: string
          materias: Json
          semana: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          adaptativo_score?: number | null
          created_at?: string | null
          dificuldade_media?: number | null
          id?: string
          materias?: Json
          semana?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          adaptativo_score?: number | null
          created_at?: string | null
          dificuldade_media?: number | null
          id?: string
          materias?: Json
          semana?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          area: string
          created_at: string | null
          data: string | null
          duracao_min: number
          id: string
          materia: string
          modo: string
          user_id: string
        }
        Insert: {
          area: string
          created_at?: string | null
          data?: string | null
          duracao_min: number
          id?: string
          materia: string
          modo: string
          user_id: string
        }
        Update: {
          area?: string
          created_at?: string | null
          data?: string | null
          duracao_min?: number
          id?: string
          materia?: string
          modo?: string
          user_id?: string
        }
        Relationships: []
      }
      user_answers: {
        Row: {
          assunto: string
          correto: boolean | null
          created_at: string | null
          id: string
          materia: string
          tempo_resposta: number | null
          user_id: string
        }
        Insert: {
          assunto?: string
          correto?: boolean | null
          created_at?: string | null
          id?: string
          materia: string
          tempo_resposta?: number | null
          user_id: string
        }
        Update: {
          assunto?: string
          correto?: boolean | null
          created_at?: string | null
          id?: string
          materia?: string
          tempo_resposta?: number | null
          user_id?: string
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          created_at: string | null
          enviado_email: boolean | null
          id: string
          pdf_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enviado_email?: boolean | null
          id?: string
          pdf_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          enviado_email?: boolean | null
          id?: string
          pdf_url?: string | null
          user_id?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
