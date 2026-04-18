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
      admin_warnings: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          last_message_time: string | null
          participant_one: string
          participant_two: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          participant_one: string
          participant_two: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          participant_one?: string
          participant_two?: string
        }
        Relationships: []
      }
      device_fingerprints: {
        Row: {
          created_at: string
          fingerprint: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          fingerprint: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          fingerprint?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      kyc_verifications: {
        Row: {
          id: string
          id_number: string
          rejection_reason: string | null
          reviewed_at: string | null
          selfie_url: string
          status: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          id?: string
          id_number: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          selfie_url: string
          status?: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          id?: string
          id_number?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          selfie_url?: string
          status?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
          text: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
          text: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_otps: {
        Row: {
          attempts: number
          channel: string
          code: string
          created_at: string
          expires_at: string
          id: string
          last_sent_at: string
          phone: string
          verified: boolean
        }
        Insert: {
          attempts?: number
          channel?: string
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          last_sent_at?: string
          phone: string
          verified?: boolean
        }
        Update: {
          attempts?: number
          channel?: string
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          last_sent_at?: string
          phone?: string
          verified?: boolean
        }
        Relationships: []
      }
      products: {
        Row: {
          boost_tier: number
          category: string
          condition: string
          created_at: string
          currency: string
          description: string | null
          id: string
          images: string[]
          is_archived: boolean
          is_boosted: boolean
          is_sold_out: boolean
          location: string | null
          price: number
          seller_id: string
          shipping: boolean
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          boost_tier?: number
          category?: string
          condition?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          images?: string[]
          is_archived?: boolean
          is_boosted?: boolean
          is_sold_out?: boolean
          location?: string | null
          price?: number
          seller_id: string
          shipping?: boolean
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          boost_tier?: number
          category?: string
          condition?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          images?: string[]
          is_archived?: boolean
          is_boosted?: boolean
          is_sold_out?: boolean
          location?: string | null
          price?: number
          seller_id?: string
          shipping?: boolean
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_icon: string
          avatar_url: string | null
          ban_reason: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          is_banned: boolean
          is_seller: boolean
          location: string | null
          name: string
          phone: string | null
          phone_verified: boolean
          referral_code: string | null
          referral_count: number
          referred_by: string | null
          report_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_icon?: string
          avatar_url?: string | null
          ban_reason?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_banned?: boolean
          is_seller?: boolean
          location?: string | null
          name?: string
          phone?: string | null
          phone_verified?: boolean
          referral_code?: string | null
          referral_count?: number
          referred_by?: string | null
          report_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_icon?: string
          avatar_url?: string | null
          ban_reason?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_banned?: boolean
          is_seller?: boolean
          location?: string | null
          name?: string
          phone?: string | null
          phone_verified?: boolean
          referral_code?: string | null
          referral_count?: number
          referred_by?: string | null
          report_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          reason?: string
          reported_user_id?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      review_likes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_likes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_replies: {
        Row: {
          created_at: string
          id: string
          is_seller: boolean
          review_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_seller?: boolean
          review_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_seller?: boolean
          review_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          likes: number
          product_id: string
          rating: number
          text: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          likes?: number
          product_id: string
          rating: number
          text?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          likes?: number
          product_id?: string
          rating?: number
          text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_subscriptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          starts_at: string
          tier: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          starts_at?: string
          tier?: number
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          starts_at?: string
          tier?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_daily_product_limit: {
        Args: { _user_id: string }
        Returns: boolean
      }
      check_device_duplicate: {
        Args: { _fingerprint: string; _ip: string }
        Returns: {
          existing_user_id: string
          match_type: string
        }[]
      }
      has_active_subscription: {
        Args: { _type: string; _user_id: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
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
