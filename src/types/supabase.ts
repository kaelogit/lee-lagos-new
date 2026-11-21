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
      order_items: {
        Row: {
          created_at: string
          id: string
          is_preorder: boolean | null
          order_id: string
          price_at_purchase: number
          product_id: string
          product_name: string
          quantity: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_preorder?: boolean | null
          order_id: string
          price_at_purchase: number
          product_id: string
          product_name: string
          quantity?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_preorder?: boolean | null
          order_id?: string
          price_at_purchase?: number
          product_id?: string
          product_name?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          order_notes: string | null
          order_status: string | null
          payment_reference: string
          payment_status: string | null
          shipping_address: string
          shipping_city: string
          shipping_state: string
          total_amount: number
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          order_notes?: string | null
          order_status?: string | null
          payment_reference: string
          payment_status?: string | null
          shipping_address: string
          shipping_city: string
          shipping_state: string
          total_amount: number
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          order_notes?: string | null
          order_status?: string | null
          payment_reference?: string
          payment_status?: string | null
          shipping_address?: string
          shipping_city?: string
          shipping_state?: string
          total_amount?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          early_access_price: number | null
          gender: string | null
          id: string
          images: string[] | null
          in_stock: boolean | null
          is_bestseller: boolean | null
          is_drop: boolean | null
          is_new_arrival: boolean | null
          name: string
          on_sale: boolean | null
          price: number
          release_date: string | null
          sale_price: number | null
          slug: string | null
          stock: number | null
          style: string | null
          subcategory: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          early_access_price?: number | null
          gender?: string | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          is_bestseller?: boolean | null
          is_drop?: boolean | null
          is_new_arrival?: boolean | null
          name: string
          on_sale?: boolean | null
          price: number
          release_date?: string | null
          sale_price?: number | null
          slug?: string | null
          stock?: number | null
          style?: string | null
          subcategory?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          early_access_price?: number | null
          gender?: string | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          is_bestseller?: boolean | null
          is_drop?: boolean | null
          is_new_arrival?: boolean | null
          name?: string
          on_sale?: boolean | null
          price?: number
          release_date?: string | null
          sale_price?: number | null
          slug?: string | null
          stock?: number | null
          style?: string | null
          subcategory?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_random_products: {
        Args: { selected_category: string }
        Returns: {
          category: string
          created_at: string
          description: string | null
          early_access_price: number | null
          gender: string | null
          id: string
          images: string[] | null
          in_stock: boolean | null
          is_bestseller: boolean | null
          is_drop: boolean | null
          is_new_arrival: boolean | null
          name: string
          on_sale: boolean | null
          price: number
          release_date: string | null
          sale_price: number | null
          slug: string | null
          stock: number | null
          style: string | null
          subcategory: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: false
          isSetofReturn: true
        }
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
