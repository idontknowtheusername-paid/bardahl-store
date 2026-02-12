// Copy types from main project - simplified version
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
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          parent_id: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          parent_id?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          parent_id?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
      }
      contact_messages: {
        Row: {
          admin_reply: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          replied_at: string | null
          status: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          replied_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          replied_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          preferences: Json | null
          source: string | null
          status: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          preferences?: Json | null
          source?: string | null
          status?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          preferences?: Json | null
          source?: string | null
          status?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
      }
      order_items: {
        Row: {
          color: string | null
          cup_size: string | null
          id: string
          image_url: string | null
          order_id: string
          product_id: string | null
          product_title: string
          quantity: number
          size: string | null
          unit_price: number
        }
        Insert: {
          color?: string | null
          cup_size?: string | null
          id?: string
          image_url?: string | null
          order_id: string
          product_id?: string | null
          product_title: string
          quantity: number
          size?: string | null
          unit_price: number
        }
        Update: {
          color?: string | null
          cup_size?: string | null
          id?: string
          image_url?: string | null
          order_id?: string
          product_id?: string | null
          product_title?: string
          quantity?: number
          size?: string | null
          unit_price?: number
        }
      }
      orders: {
        Row: {
          admin_note: string | null
          created_at: string
          customer_id: string | null
          customer_note: string | null
          id: string
          order_number: string
          payment_status: string | null
          payment_transaction_id: string | null
          shipping_address: string | null
          shipping_city: string
          shipping_cost: number | null
          shipping_country: string | null
          shipping_email: string
          shipping_first_name: string
          shipping_last_name: string | null
          shipping_phone: string
          status: string | null
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          customer_id?: string | null
          customer_note?: string | null
          id?: string
          order_number: string
          payment_status?: string | null
          payment_transaction_id?: string | null
          shipping_address?: string | null
          shipping_city: string
          shipping_cost?: number | null
          shipping_country?: string | null
          shipping_email: string
          shipping_first_name: string
          shipping_last_name?: string | null
          shipping_phone: string
          status?: string | null
          subtotal: number
          total: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          customer_id?: string | null
          customer_note?: string | null
          id?: string
          order_number?: string
          payment_status?: string | null
          payment_transaction_id?: string | null
          shipping_address?: string | null
          shipping_city?: string
          shipping_cost?: number | null
          shipping_country?: string | null
          shipping_email?: string
          shipping_first_name?: string
          shipping_last_name?: string | null
          shipping_phone?: string
          status?: string | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
        }
      }
      product_categories: {
        Row: {
          category_id: string
          product_id: string
        }
        Insert: {
          category_id: string
          product_id: string
        }
        Update: {
          category_id?: string
          product_id?: string
        }
      }
      product_collection_items: {
        Row: {
          collection_id: string
          product_id: string
        }
        Insert: {
          collection_id: string
          product_id: string
        }
        Update: {
          collection_id?: string
          product_id?: string
        }
      }
      product_collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          slug?: string
          title?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          product_id?: string
        }
      }
      product_variants: {
        Row: {
          additional_price: number | null
          color: string | null
          color_code: string | null
          created_at: string
          cup_size: string | null
          id: string
          product_id: string
          size: string | null
          stock: number | null
        }
        Insert: {
          additional_price?: number | null
          color?: string | null
          color_code?: string | null
          created_at?: string
          cup_size?: string | null
          id?: string
          product_id: string
          size?: string | null
          stock?: number | null
        }
        Update: {
          additional_price?: number | null
          color?: string | null
          color_code?: string | null
          created_at?: string
          cup_size?: string | null
          id?: string
          product_id?: string
          size?: string | null
          stock?: number | null
        }
      }
      promo_codes: {
        Row: {
          id: string
          code: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_order_amount: number | null
          max_uses: number | null
          uses_count: number
          valid_from: string
          valid_until: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_order_amount?: number | null
          max_uses?: number | null
          uses_count?: number
          valid_from?: string
          valid_until?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          min_order_amount?: number | null
          max_uses?: number | null
          uses_count?: number
          valid_from?: string
          valid_until?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          care_instructions: string | null
          compare_at_price: number | null
          composition: string | null
          created_at: string
          description: Json | null
          enable_variants: boolean | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          meta_description: string | null
          meta_image_url: string | null
          meta_title: string | null
          price: number
          short_description: string | null
          sku: string | null
          slug: string
          stock: number | null
          style: string | null
          title: string
          updated_at: string
          available_colors: Json | null
          available_sizes: string[] | null
          available_cup_sizes: string[] | null
        }
        Insert: {
          care_instructions?: string | null
          compare_at_price?: number | null
          composition?: string | null
          created_at?: string
          description?: Json | null
          enable_variants?: boolean | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          meta_description?: string | null
          meta_image_url?: string | null
          meta_title?: string | null
          price: number
          short_description?: string | null
          sku?: string | null
          slug: string
          stock?: number | null
          style?: string | null
          title: string
          updated_at?: string
          available_colors?: Json | null
          available_sizes?: string[] | null
          available_cup_sizes?: string[] | null
        }
        Update: {
          care_instructions?: string | null
          compare_at_price?: number | null
          composition?: string | null
          created_at?: string
          description?: Json | null
          enable_variants?: boolean | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          meta_description?: string | null
          meta_image_url?: string | null
          meta_title?: string | null
          price?: number
          short_description?: string | null
          sku?: string | null
          slug?: string
          stock?: number | null
          style?: string | null
          title?: string
          updated_at?: string
          available_colors?: Json | null
          available_sizes?: string[] | null
          available_cup_sizes?: string[] | null
        }
      }
      shipping_rates: {
        Row: {
          created_at: string
          delivery_time: string | null
          description: string | null
          free_shipping_threshold: number | null
          id: string
          is_active: boolean | null
          min_order_amount: number | null
          name: string
          price: number
          shipping_zone_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_time?: string | null
          description?: string | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          min_order_amount?: number | null
          name: string
          price: number
          shipping_zone_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_time?: string | null
          description?: string | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          min_order_amount?: number | null
          name?: string
          price?: number
          shipping_zone_id?: string
          updated_at?: string
        }
      }
      shipping_zones: {
        Row: {
          cities: string[] | null
          countries: string[] | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          cities?: string[] | null
          countries?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          cities?: string[] | null
          countries?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
      }
      site_settings: {
        Row: {
          announcement_bar: string | null
          contact_email: string | null
          contact_phone: string | null
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
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          announcement_bar?: string | null
          contact_email?: string | null
          contact_phone?: string | null
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
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          announcement_bar?: string | null
          contact_email?: string | null
          contact_phone?: string | null
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
          updated_at?: string
          whatsapp_number?: string | null
        }
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
