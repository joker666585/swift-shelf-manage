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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      owners: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          created_at: string
          entry_time: string
          id: string
          notes: string | null
          owner: string | null
          shelf: string | null
          status: Database["public"]["Enums"]["package_status"]
          tags: string[] | null
          tracking_number: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          entry_time?: string
          id?: string
          notes?: string | null
          owner?: string | null
          shelf?: string | null
          status?: Database["public"]["Enums"]["package_status"]
          tags?: string[] | null
          tracking_number: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          entry_time?: string
          id?: string
          notes?: string | null
          owner?: string | null
          shelf?: string | null
          status?: Database["public"]["Enums"]["package_status"]
          tags?: string[] | null
          tracking_number?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      price_channels: {
        Row: {
          additional_weight: number | null
          billing_method: string | null
          channel: string
          country: string
          created_at: string
          first_weight: number | null
          id: string
          notes: string | null
          tier_pricing: Json | null
          time_frame: string | null
          unit: string | null
          updated_at: string
          weight_range: string | null
        }
        Insert: {
          additional_weight?: number | null
          billing_method?: string | null
          channel: string
          country: string
          created_at?: string
          first_weight?: number | null
          id?: string
          notes?: string | null
          tier_pricing?: Json | null
          time_frame?: string | null
          unit?: string | null
          updated_at?: string
          weight_range?: string | null
        }
        Update: {
          additional_weight?: number | null
          billing_method?: string | null
          channel?: string
          country?: string
          created_at?: string
          first_weight?: number | null
          id?: string
          notes?: string | null
          tier_pricing?: Json | null
          time_frame?: string | null
          unit?: string | null
          updated_at?: string
          weight_range?: string | null
        }
        Relationships: []
      }
      shelves: {
        Row: {
          capacity: number
          created_at: string
          current_count: number
          id: string
          location: string
          name: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          current_count?: number
          id?: string
          location: string
          name: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          current_count?: number
          id?: string
          location?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipment_packages: {
        Row: {
          created_at: string
          id: string
          package_id: string
          shipment_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          package_id: string
          shipment_id: string
        }
        Update: {
          created_at?: string
          id?: string
          package_id?: string
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_packages_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          created_at: string
          id: string
          recipient_address: string
          recipient_country: string | null
          recipient_email: string | null
          recipient_name: string
          recipient_phone: string | null
          recipient_zip_code: string | null
          shipment_date: string
          status: Database["public"]["Enums"]["shipment_status"]
          tracking_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_address: string
          recipient_country?: string | null
          recipient_email?: string | null
          recipient_name: string
          recipient_phone?: string | null
          recipient_zip_code?: string | null
          shipment_date?: string
          status?: Database["public"]["Enums"]["shipment_status"]
          tracking_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_address?: string
          recipient_country?: string | null
          recipient_email?: string | null
          recipient_name?: string
          recipient_phone?: string | null
          recipient_zip_code?: string | null
          shipment_date?: string
          status?: Database["public"]["Enums"]["shipment_status"]
          tracking_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
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
      package_status:
        | "in_stock"
        | "out_for_delivery"
        | "pending"
        | "delivered"
        | "signed"
        | "deleted"
      shipment_status: "pending" | "shipped" | "delivered"
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
    Enums: {
      package_status: [
        "in_stock",
        "out_for_delivery",
        "pending",
        "delivered",
        "signed",
        "deleted",
      ],
      shipment_status: ["pending", "shipped", "delivered"],
    },
  },
} as const
