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
      blog_posts: {
        Row: {
          author: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          read_time: number | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          read_time?: number | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          read_time?: number | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      blog_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_reply: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          replied_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          replied_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          replied_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          order_id: string
          product_id: string
          product_title: string
          quantity: number
          size: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          order_id: string
          product_id: string
          product_title: string
          quantity?: number
          size?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string
          product_title?: string
          quantity?: number
          size?: string | null
          total_price?: number
          unit_price?: number
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
          admin_note: string | null
          billing_address: Json | null
          created_at: string | null
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          order_number: string
          paid_at: string | null
          payment_gateway: string | null
          payment_gateway_id: string | null
          payment_gateway_response: Json | null
          payment_id: string | null
          payment_status: string | null
          payment_transaction_id: string | null
          promo_code_id: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          shipping_method: string | null
          status: string | null
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          billing_address?: Json | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          order_number: string
          paid_at?: string | null
          payment_gateway?: string | null
          payment_gateway_id?: string | null
          payment_gateway_response?: Json | null
          payment_id?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          promo_code_id?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: string | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          billing_address?: Json | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          payment_gateway?: string | null
          payment_gateway_id?: string | null
          payment_gateway_response?: Json | null
          payment_id?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          promo_code_id?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: string | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          id: string
          product_id: string
        }
        Insert: {
          category_id: string
          id?: string
          product_id: string
        }
        Update: {
          category_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_collection_items: {
        Row: {
          collection_id: string
          display_order: number | null
          id: string
          product_id: string
        }
        Insert: {
          collection_id: string
          display_order?: number | null
          id?: string
          product_id: string
        }
        Update: {
          collection_id?: string
          display_order?: number | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "product_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_collection_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          author_name: string
          comment: string | null
          created_at: string
          id: string
          is_approved: boolean
          product_id: string
          rating: number
        }
        Insert: {
          author_name: string
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id: string
          rating: number
        }
        Update: {
          author_name?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id?: string
          rating?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          acea_norm: string | null
          api_norm: string | null
          available_colors: Json | null
          available_cup_sizes: string[] | null
          available_sizes: string[] | null
          capacity: string | null
          care_instructions: string | null
          compare_at_price: number | null
          composition: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          price: number
          product_type: string | null
          short_description: string | null
          sku: string | null
          slug: string
          stock: number | null
          style: string | null
          title: string
          updated_at: string | null
          viscosity: string | null
          weight: number | null
        }
        Insert: {
          acea_norm?: string | null
          api_norm?: string | null
          available_colors?: Json | null
          available_cup_sizes?: string[] | null
          available_sizes?: string[] | null
          capacity?: string | null
          care_instructions?: string | null
          compare_at_price?: number | null
          composition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          price?: number
          product_type?: string | null
          short_description?: string | null
          sku?: string | null
          slug: string
          stock?: number | null
          style?: string | null
          title: string
          updated_at?: string | null
          viscosity?: string | null
          weight?: number | null
        }
        Update: {
          acea_norm?: string | null
          api_norm?: string | null
          available_colors?: Json | null
          available_cup_sizes?: string[] | null
          available_sizes?: string[] | null
          capacity?: string | null
          care_instructions?: string | null
          compare_at_price?: number | null
          composition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          price?: number
          product_type?: string | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          stock?: number | null
          style?: string | null
          title?: string
          updated_at?: string | null
          viscosity?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          buy_quantity: number | null
          code: string
          created_at: string | null
          discount_type: string
          discount_value: number
          get_quantity: number | null
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          max_uses: number | null
          min_order_amount: number | null
          uses_count: number | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          buy_quantity?: number | null
          code: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          get_quantity?: number | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_uses?: number | null
          min_order_amount?: number | null
          uses_count?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          buy_quantity?: number | null
          code?: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          get_quantity?: number | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_uses?: number | null
          min_order_amount?: number | null
          uses_count?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      shipping_rates: {
        Row: {
          created_at: string | null
          delivery_time: string | null
          description: string | null
          free_shipping_threshold: number | null
          id: string
          is_active: boolean | null
          min_order_amount: number | null
          name: string
          price: number
          shipping_zone_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_time?: string | null
          description?: string | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          min_order_amount?: number | null
          name: string
          price?: number
          shipping_zone_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_time?: string | null
          description?: string | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          min_order_amount?: number | null
          name?: string
          price?: number
          shipping_zone_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_rates_shipping_zone_id_fkey"
            columns: ["shipping_zone_id"]
            isOneToOne: false
            referencedRelation: "shipping_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          cities: string[] | null
          countries: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          cities?: string[] | null
          countries?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          cities?: string[] | null
          countries?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          admin_email: string | null
          announcement_bar: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          currency: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          maintenance_mode: boolean | null
          minimum_order_amount: number | null
          site_description: string | null
          site_name: string | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          admin_email?: string | null
          announcement_bar?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          currency?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          maintenance_mode?: boolean | null
          minimum_order_amount?: number | null
          site_description?: string | null
          site_name?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          admin_email?: string | null
          announcement_bar?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          currency?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          maintenance_mode?: boolean | null
          minimum_order_amount?: number | null
          site_description?: string | null
          site_name?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vehicle_brands: {
        Row: {
          display_order: number | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          display_order?: number | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          display_order?: number | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      vehicle_engines: {
        Row: {
          displacement: string | null
          fuel_type: string | null
          id: string
          model_id: string
          name: string
          power: string | null
        }
        Insert: {
          displacement?: string | null
          fuel_type?: string | null
          id?: string
          model_id: string
          name: string
          power?: string | null
        }
        Update: {
          displacement?: string | null
          fuel_type?: string | null
          id?: string
          model_id?: string
          name?: string
          power?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_engines_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "vehicle_models"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_models: {
        Row: {
          brand_id: string
          id: string
          name: string
          year_from: number | null
          year_to: number | null
        }
        Insert: {
          brand_id: string
          id?: string
          name: string
          year_from?: number | null
          year_to?: number | null
        }
        Update: {
          brand_id?: string
          id?: string
          name?: string
          year_from?: number | null
          year_to?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "vehicle_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_product_compatibility: {
        Row: {
          engine_id: string
          id: string
          product_id: string
        }
        Insert: {
          engine_id: string
          id?: string
          product_id: string
        }
        Update: {
          engine_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_product_compatibility_engine_id_fkey"
            columns: ["engine_id"]
            isOneToOne: false
            referencedRelation: "vehicle_engines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_product_compatibility_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_site_settings: {
        Row: {
          announcement_bar: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          currency: string | null
          facebook_url: string | null
          id: string | null
          instagram_url: string | null
          maintenance_mode: boolean | null
          minimum_order_amount: number | null
          site_description: string | null
          site_name: string | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          announcement_bar?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          currency?: string | null
          facebook_url?: string | null
          id?: string | null
          instagram_url?: string | null
          maintenance_mode?: boolean | null
          minimum_order_amount?: number | null
          site_description?: string | null
          site_name?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          announcement_bar?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          currency?: string | null
          facebook_url?: string | null
          id?: string | null
          instagram_url?: string | null
          maintenance_mode?: boolean | null
          minimum_order_amount?: number | null
          site_description?: string | null
          site_name?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer" | "customer"
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
      app_role: ["admin", "editor", "viewer", "customer"],
    },
  },
} as const
