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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name_ar: string
          name_en: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name_ar: string
          name_en: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name_ar?: string
          name_en?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          direction: string
          id: string
          notes: string | null
          product_id: string
          qty: number
          reason: string
          source_id: string | null
          source_type: string | null
          stock_lot_id: string | null
          unit_cost: number | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          direction: string
          id?: string
          notes?: string | null
          product_id: string
          qty: number
          reason: string
          source_id?: string | null
          source_type?: string | null
          stock_lot_id?: string | null
          unit_cost?: number | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          direction?: string
          id?: string
          notes?: string | null
          product_id?: string
          qty?: number
          reason?: string
          source_id?: string | null
          source_type?: string | null
          stock_lot_id?: string | null
          unit_cost?: number | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_stock_lot_id_fkey"
            columns: ["stock_lot_id"]
            isOneToOne: false
            referencedRelation: "stock_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          id: string
          invoice_number: string
          issued_at: string
          paid_at: string | null
          sales_order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_number?: string
          issued_at?: string
          paid_at?: string | null
          sales_order_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          invoice_number?: string
          issued_at?: string
          paid_at?: string | null
          sales_order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: true
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          description: string | null
          entry_date: string
          id: string
          source_id: string | null
          source_type: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          entry_date?: string
          id?: string
          source_id?: string | null
          source_type?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          entry_date?: string
          id?: string
          source_id?: string | null
          source_type?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_combo_components: {
        Row: {
          combo_product_id: string
          component_product_id: string
          component_variant_id: string | null
          created_at: string
          id: string
          qty: number
        }
        Insert: {
          combo_product_id: string
          component_product_id: string
          component_variant_id?: string | null
          created_at?: string
          id?: string
          qty: number
        }
        Update: {
          combo_product_id?: string
          component_product_id?: string
          component_variant_id?: string | null
          created_at?: string
          id?: string
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_combo_components_combo_product_id_fkey"
            columns: ["combo_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_combo_components_component_product_id_fkey"
            columns: ["component_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_combo_components_component_variant_id_fkey"
            columns: ["component_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color_hex: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name_ar: string
          name_en: string
          price: number | null
          product_id: string
          sku: string | null
          sort_order: number
        }
        Insert: {
          color_hex?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_ar: string
          name_en: string
          price?: number | null
          product_id: string
          sku?: string | null
          sort_order?: number
        }
        Update: {
          color_hex?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_ar?: string
          name_en?: string
          price?: number | null
          product_id?: string
          sku?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          combo_force_available: boolean
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean
          low_stock_threshold: number
          name_ar: string
          name_en: string
          price: number
          pricing_unit: string
          short_description_ar: string | null
          short_description_en: string | null
          slug: string
          type: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          combo_force_available?: boolean
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          low_stock_threshold?: number
          name_ar: string
          name_en: string
          price?: number
          pricing_unit?: string
          short_description_ar?: string | null
          short_description_en?: string | null
          slug: string
          type?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          combo_force_available?: boolean
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          low_stock_threshold?: number
          name_ar?: string
          name_en?: string
          price?: number
          pricing_unit?: string
          short_description_ar?: string | null
          short_description_en?: string | null
          slug?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          purchase_order_id: string
          qty_ordered: number
          qty_received: number
          unit_cost: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          purchase_order_id: string
          qty_ordered: number
          qty_received?: number
          unit_cost: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          purchase_order_id?: string
          qty_ordered?: number
          qty_received?: number
          unit_cost?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          ordered_at: string | null
          po_number: string
          received_at: string | null
          status: string
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          ordered_at?: string | null
          po_number?: string
          received_at?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          ordered_at?: string | null
          po_number?: string
          received_at?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          admin_notes: string | null
          attachment_url: string | null
          category: string | null
          contact: string
          created_at: string
          customer_id: string
          delivery_address: string | null
          description: string
          fulfillment_method: string | null
          id: string
          name: string
          qty_or_budget: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          attachment_url?: string | null
          category?: string | null
          contact: string
          created_at?: string
          customer_id: string
          delivery_address?: string | null
          description: string
          fulfillment_method?: string | null
          id?: string
          name: string
          qty_or_budget?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          attachment_url?: string | null
          category?: string | null
          contact?: string
          created_at?: string
          customer_id?: string
          delivery_address?: string | null
          description?: string
          fulfillment_method?: string | null
          id?: string
          name?: string
          qty_or_budget?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_order_items: {
        Row: {
          cogs_total: number | null
          created_at: string
          id: string
          line_total: number
          name_snapshot_ar: string
          name_snapshot_en: string
          product_id: string
          qty: number
          sales_order_id: string
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          cogs_total?: number | null
          created_at?: string
          id?: string
          line_total: number
          name_snapshot_ar: string
          name_snapshot_en: string
          product_id: string
          qty: number
          sales_order_id: string
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          cogs_total?: number | null
          created_at?: string
          id?: string
          line_total?: number
          name_snapshot_ar?: string
          name_snapshot_en?: string
          product_id?: string
          qty?: number
          sales_order_id?: string
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_orders: {
        Row: {
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string
          customer_id: string
          delivery_address: string | null
          delivery_fee: number
          done_at: string | null
          fulfillment_method: string
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          payment_screenshot_url: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_id: string
          delivery_address?: string | null
          delivery_fee?: number
          done_at?: string | null
          fulfillment_method: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method: string
          payment_screenshot_url?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_id?: string
          delivery_address?: string | null
          delivery_fee?: number
          done_at?: string | null
          fulfillment_method?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          payment_screenshot_url?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      stock_lots: {
        Row: {
          created_at: string
          id: string
          product_id: string
          purchase_order_item_id: string | null
          qty_received: number
          qty_remaining: number
          received_date: string
          unit_cost: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          purchase_order_item_id?: string | null
          qty_received: number
          qty_remaining: number
          received_date?: string
          unit_cost: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          purchase_order_item_id?: string | null
          qty_received?: number
          qty_remaining?: number
          received_date?: string
          unit_cost?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_lots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_lots_purchase_order_item_id_fkey"
            columns: ["purchase_order_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_lots_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_stock: {
        Args: {
          p_direction: string
          p_notes: string
          p_product_id: string
          p_qty: number
          p_reason: string
          p_variant_id: string
        }
        Returns: undefined
      }
      app_role: { Args: never; Returns: string }
      cancel_own_sales_order: {
        Args: { p_sales_order_id: string }
        Returns: undefined
      }
      cancel_sales_order: {
        Args: { p_sales_order_id: string }
        Returns: undefined
      }
      confirm_sales_order: {
        Args: { p_sales_order_id: string }
        Returns: undefined
      }
      create_sales_order: {
        Args: {
          p_delivery_address: string
          p_fulfillment_method: string
          p_items: Json
          p_payment_method: string
          p_payment_screenshot_path: string
        }
        Returns: string
      }
      deduct_fifo: {
        Args: {
          p_product_id: string
          p_qty: number
          p_source_item_id: string
          p_variant_id: string
        }
        Returns: number
      }
      get_availability_snapshot: {
        Args: never
        Returns: {
          available: number
          product_id: string
          variant_id: string
        }[]
      }
      get_available_qty: {
        Args: { p_product_id: string; p_variant_id: string }
        Returns: number
      }
      mark_sales_order_done: {
        Args: { p_sales_order_id: string }
        Returns: undefined
      }
      receive_purchase_order: {
        Args: { p_purchase_order_id: string }
        Returns: undefined
      }
      set_user_role: {
        Args: { p_new_role: string; p_target_user_id: string }
        Returns: undefined
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
