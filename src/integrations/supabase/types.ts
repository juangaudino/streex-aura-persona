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
      markets: {
        Row: {
          city: string
          country: string
          country_code: string | null
          created_at: string
          id: string
          is_home: boolean
          lat: number
          lng: number
          note_en: string | null
          note_es: string | null
          sort_order: number
          updated_at: string
          year_from: number | null
          year_to: number | null
        }
        Insert: {
          city: string
          country: string
          country_code?: string | null
          created_at?: string
          id?: string
          is_home?: boolean
          lat: number
          lng: number
          note_en?: string | null
          note_es?: string | null
          sort_order?: number
          updated_at?: string
          year_from?: number | null
          year_to?: number | null
        }
        Update: {
          city?: string
          country?: string
          country_code?: string | null
          created_at?: string
          id?: string
          is_home?: boolean
          lat?: number
          lng?: number
          note_en?: string | null
          note_es?: string | null
          sort_order?: number
          updated_at?: string
          year_from?: number | null
          year_to?: number | null
        }
        Relationships: []
      }
      profile_settings: {
        Row: {
          about_body_en: string[]
          about_body_es: string[]
          about_eyebrow_en: string
          about_eyebrow_es: string
          about_stats: Json
          about_title_en: string
          about_title_es: string
          contact_eyebrow_en: string
          contact_eyebrow_es: string
          contact_sub_en: string
          contact_sub_es: string
          contact_title_en: string
          contact_title_es: string
          cv_url: string
          email: string
          experience_eyebrow_en: string
          experience_eyebrow_es: string
          experience_lane_study_en: string
          experience_lane_study_es: string
          experience_lane_work_en: string
          experience_lane_work_es: string
          experience_tag_study_en: string
          experience_tag_study_es: string
          experience_tag_work_en: string
          experience_tag_work_es: string
          experience_title_en: string
          experience_title_es: string
          hero_cta_alt_en: string
          hero_cta_alt_es: string
          hero_cta_en: string
          hero_cta_es: string
          hero_eyebrow_en: string
          hero_eyebrow_es: string
          hero_location_en: string
          hero_location_es: string
          hero_role_en: string
          hero_role_es: string
          hero_title_en: string[]
          hero_title_es: string[]
          id: string
          journey_body_en: string | null
          journey_body_es: string | null
          journey_eyebrow_en: string | null
          journey_eyebrow_es: string | null
          journey_title_en: string | null
          journey_title_es: string | null
          linkedin: string
          location: string
          name: string
          phone: string
          photo_dark_url: string
          photo_light_url: string
          projects_eyebrow_en: string
          projects_eyebrow_es: string
          projects_title_en: string
          projects_title_es: string
          singleton: boolean
          skills_eyebrow_en: string
          skills_eyebrow_es: string
          skills_title_en: string
          skills_title_es: string
          updated_at: string
        }
        Insert: {
          about_body_en?: string[]
          about_body_es?: string[]
          about_eyebrow_en?: string
          about_eyebrow_es?: string
          about_stats?: Json
          about_title_en?: string
          about_title_es?: string
          contact_eyebrow_en?: string
          contact_eyebrow_es?: string
          contact_sub_en?: string
          contact_sub_es?: string
          contact_title_en?: string
          contact_title_es?: string
          cv_url?: string
          email?: string
          experience_eyebrow_en?: string
          experience_eyebrow_es?: string
          experience_lane_study_en?: string
          experience_lane_study_es?: string
          experience_lane_work_en?: string
          experience_lane_work_es?: string
          experience_tag_study_en?: string
          experience_tag_study_es?: string
          experience_tag_work_en?: string
          experience_tag_work_es?: string
          experience_title_en?: string
          experience_title_es?: string
          hero_cta_alt_en?: string
          hero_cta_alt_es?: string
          hero_cta_en?: string
          hero_cta_es?: string
          hero_eyebrow_en?: string
          hero_eyebrow_es?: string
          hero_location_en?: string
          hero_location_es?: string
          hero_role_en?: string
          hero_role_es?: string
          hero_title_en?: string[]
          hero_title_es?: string[]
          id?: string
          journey_body_en?: string | null
          journey_body_es?: string | null
          journey_eyebrow_en?: string | null
          journey_eyebrow_es?: string | null
          journey_title_en?: string | null
          journey_title_es?: string | null
          linkedin?: string
          location?: string
          name?: string
          phone?: string
          photo_dark_url?: string
          photo_light_url?: string
          projects_eyebrow_en?: string
          projects_eyebrow_es?: string
          projects_title_en?: string
          projects_title_es?: string
          singleton?: boolean
          skills_eyebrow_en?: string
          skills_eyebrow_es?: string
          skills_title_en?: string
          skills_title_es?: string
          updated_at?: string
        }
        Update: {
          about_body_en?: string[]
          about_body_es?: string[]
          about_eyebrow_en?: string
          about_eyebrow_es?: string
          about_stats?: Json
          about_title_en?: string
          about_title_es?: string
          contact_eyebrow_en?: string
          contact_eyebrow_es?: string
          contact_sub_en?: string
          contact_sub_es?: string
          contact_title_en?: string
          contact_title_es?: string
          cv_url?: string
          email?: string
          experience_eyebrow_en?: string
          experience_eyebrow_es?: string
          experience_lane_study_en?: string
          experience_lane_study_es?: string
          experience_lane_work_en?: string
          experience_lane_work_es?: string
          experience_tag_study_en?: string
          experience_tag_study_es?: string
          experience_tag_work_en?: string
          experience_tag_work_es?: string
          experience_title_en?: string
          experience_title_es?: string
          hero_cta_alt_en?: string
          hero_cta_alt_es?: string
          hero_cta_en?: string
          hero_cta_es?: string
          hero_eyebrow_en?: string
          hero_eyebrow_es?: string
          hero_location_en?: string
          hero_location_es?: string
          hero_role_en?: string
          hero_role_es?: string
          hero_title_en?: string[]
          hero_title_es?: string[]
          id?: string
          journey_body_en?: string | null
          journey_body_es?: string | null
          journey_eyebrow_en?: string | null
          journey_eyebrow_es?: string | null
          journey_title_en?: string | null
          journey_title_es?: string | null
          linkedin?: string
          location?: string
          name?: string
          phone?: string
          photo_dark_url?: string
          photo_light_url?: string
          projects_eyebrow_en?: string
          projects_eyebrow_es?: string
          projects_title_en?: string
          projects_title_es?: string
          singleton?: boolean
          skills_eyebrow_en?: string
          skills_eyebrow_es?: string
          skills_title_en?: string
          skills_title_es?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          approach_en: string
          approach_es: string
          challenge_en: string
          challenge_es: string
          client: string
          created_at: string
          desc_en: string
          desc_es: string
          gallery: Json
          id: string
          image_url: string
          link: string
          metrics: Json
          name_en: string
          name_es: string
          outcome_en: string
          outcome_es: string
          sort_order: number
          stack: string
          updated_at: string
          verticals: string[]
          year: string
        }
        Insert: {
          approach_en?: string
          approach_es?: string
          challenge_en?: string
          challenge_es?: string
          client?: string
          created_at?: string
          desc_en?: string
          desc_es?: string
          gallery?: Json
          id?: string
          image_url?: string
          link?: string
          metrics?: Json
          name_en?: string
          name_es?: string
          outcome_en?: string
          outcome_es?: string
          sort_order?: number
          stack?: string
          updated_at?: string
          verticals?: string[]
          year?: string
        }
        Update: {
          approach_en?: string
          approach_es?: string
          challenge_en?: string
          challenge_es?: string
          client?: string
          created_at?: string
          desc_en?: string
          desc_es?: string
          gallery?: Json
          id?: string
          image_url?: string
          link?: string
          metrics?: Json
          name_en?: string
          name_es?: string
          outcome_en?: string
          outcome_es?: string
          sort_order?: number
          stack?: string
          updated_at?: string
          verticals?: string[]
          year?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          category_label_en: string
          category_label_es: string
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          category?: string
          category_label_en?: string
          category_label_es?: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          category?: string
          category_label_en?: string
          category_label_es?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      timeline_items: {
        Row: {
          attachments: Json
          bullets_en: string[]
          bullets_es: string[]
          created_at: string
          end_date: string | null
          id: string
          kind: Database["public"]["Enums"]["timeline_kind"]
          location: string
          org: string
          period_label_en: string
          period_label_es: string
          sort_order: number
          start_date: string | null
          summary_en: string
          summary_es: string
          title_en: string
          title_es: string
          updated_at: string
        }
        Insert: {
          attachments?: Json
          bullets_en?: string[]
          bullets_es?: string[]
          created_at?: string
          end_date?: string | null
          id?: string
          kind: Database["public"]["Enums"]["timeline_kind"]
          location?: string
          org?: string
          period_label_en?: string
          period_label_es?: string
          sort_order?: number
          start_date?: string | null
          summary_en?: string
          summary_es?: string
          title_en?: string
          title_es?: string
          updated_at?: string
        }
        Update: {
          attachments?: Json
          bullets_en?: string[]
          bullets_es?: string[]
          created_at?: string
          end_date?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["timeline_kind"]
          location?: string
          org?: string
          period_label_en?: string
          period_label_es?: string
          sort_order?: number
          start_date?: string | null
          summary_en?: string
          summary_es?: string
          title_en?: string
          title_es?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      timeline_kind: "work" | "study"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
      timeline_kind: ["work", "study"],
    },
  },
} as const
