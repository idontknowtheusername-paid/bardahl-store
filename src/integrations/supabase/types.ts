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
      abandoned_carts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          items: Json
          recovered: boolean | null
          recovered_at: string | null
          recovery_email_sent: boolean | null
          recovery_email_sent_at: string | null
          session_id: string
          total: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          items: Json
          recovered?: boolean | null
          recovered_at?: string | null
          recovery_email_sent?: boolean | null
          recovery_email_sent_at?: string | null
          session_id: string
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          items?: Json
          recovered?: boolean | null
          recovered_at?: string | null
          recovery_email_sent?: boolean | null
          recovery_email_sent_at?: string | null
          session_id?: string
          total?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_generation_log: {
        Row: {
          blog_post_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          prompt: string
          status: string | null
        }
        Insert: {
          blog_post_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          prompt: string
          status?: string | null
        }
        Update: {
          blog_post_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          prompt?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_generation_log_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_categories: {
        Row: {
          blog_post_id: string
          category_id: string
        }
        Insert: {
          blog_post_id: string
          category_id: string
        }
        Update: {
          blog_post_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          read_time: number | null
          scheduled_for: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: number | null
          scheduled_for?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: number | null
          scheduled_for?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
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
      contact_messages: {
        Row: {
          admin_reply: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          replied_at: string | null
          status: Database["public"]["Enums"]["contact_status"] | null
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
          status?: Database["public"]["Enums"]["contact_status"] | null
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
          status?: Database["public"]["Enums"]["contact_status"] | null
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_files: {
        Row: {
          alt_text: string | null
          created_at: string | null
          description: string | null
          file_path: string
          file_size: number
          file_url: string
          filename: string
          folder_id: string | null
          height: number | null
          id: string
          mime_type: string
          original_filename: string
          tags: string[] | null
          title: string | null
          updated_at: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          description?: string | null
          file_path: string
          file_size: number
          file_url: string
          filename: string
          folder_id?: string | null
          height?: number | null
          id?: string
          mime_type: string
          original_filename: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_size?: number
          file_url?: string
          filename?: string
          folder_id?: string | null
          height?: number | null
          id?: string
          mime_type?: string
          original_filename?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      media_folders: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          parent_id: string | null
          path: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          parent_id?: string | null
          path: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          path?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          preferences: Json | null
          source: Database["public"]["Enums"]["newsletter_source"] | null
          status: Database["public"]["Enums"]["newsletter_status"] | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          preferences?: Json | null
          source?: Database["public"]["Enums"]["newsletter_source"] | null
          status?: Database["public"]["Enums"]["newsletter_status"] | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          preferences?: Json | null
          source?: Database["public"]["Enums"]["newsletter_source"] | null
          status?: Database["public"]["Enums"]["newsletter_status"] | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
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
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
          order_id: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
          order_id?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_note: string | null
          billing_address: string | null
          billing_city: string | null
          billing_country: string | null
          billing_first_name: string | null
          billing_last_name: string | null
          created_at: string
          customer_id: string | null
          customer_note: string | null
          id: string
          order_number: string
          payment_gateway_id: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          payment_transaction_id: string | null
          shipping_address: string | null
          shipping_address_line2: string | null
          shipping_city: string
          shipping_cost: number | null
          shipping_country: string | null
          shipping_email: string
          shipping_first_name: string
          shipping_last_name: string | null
          shipping_phone: string
          shipping_postal_code: string | null
          shipping_rate_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string
          use_different_billing: boolean | null
        }
        Insert: {
          admin_note?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_first_name?: string | null
          billing_last_name?: string | null
          created_at?: string
          customer_id?: string | null
          customer_note?: string | null
          id?: string
          order_number: string
          payment_gateway_id?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          payment_transaction_id?: string | null
          shipping_address?: string | null
          shipping_address_line2?: string | null
          shipping_city: string
          shipping_cost?: number | null
          shipping_country?: string | null
          shipping_email: string
          shipping_first_name: string
          shipping_last_name?: string | null
          shipping_phone: string
          shipping_postal_code?: string | null
          shipping_rate_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          tracking_number?: string | null
          updated_at?: string
          use_different_billing?: boolean | null
        }
        Update: {
          admin_note?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_first_name?: string | null
          billing_last_name?: string | null
          created_at?: string
          customer_id?: string | null
          customer_note?: string | null
          id?: string
          order_number?: string
          payment_gateway_id?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          payment_transaction_id?: string | null
          shipping_address?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string
          shipping_cost?: number | null
          shipping_country?: string | null
          shipping_email?: string
          shipping_first_name?: string
          shipping_last_name?: string | null
          shipping_phone?: string
          shipping_postal_code?: string | null
          shipping_rate_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          use_different_billing?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_shipping_rate_id_fkey"
            columns: ["shipping_rate_id"]
            isOneToOne: false
            referencedRelation: "shipping_rates"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          slug: string
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          slug: string
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          slug?: string
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
          available_colors: Json | null
          available_cup_sizes: string[] | null
          available_sizes: string[] | null
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
          style: Database["public"]["Enums"]["product_style"] | null
          title: string
          updated_at: string
        }
        Insert: {
          available_colors?: Json | null
          available_cup_sizes?: string[] | null
          available_sizes?: string[] | null
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
          style?: Database["public"]["Enums"]["product_style"] | null
          title: string
          updated_at?: string
        }
        Update: {
          available_colors?: Json | null
          available_cup_sizes?: string[] | null
          available_sizes?: string[] | null
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
          style?: Database["public"]["Enums"]["product_style"] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          applies_to_product_ids: string[] | null
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
          updated_at: string | null
          uses_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applies_to_product_ids?: string[] | null
          buy_quantity?: number | null
          code: string
          created_at?: string | null
          discount_type: string
          discount_value: number
          get_quantity?: number | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_uses?: number | null
          min_order_amount?: number | null
          updated_at?: string | null
          uses_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applies_to_product_ids?: string[] | null
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
          updated_at?: string | null
          uses_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      related_products: {
        Row: {
          product_id: string
          related_product_id: string
        }
        Insert: {
          product_id: string
          related_product_id: string
        }
        Update: {
          product_id?: string
          related_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "related_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_products_related_product_id_fkey"
            columns: ["related_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_generate_weekly_blog: { Args: never; Returns: undefined }
      generate_order_number: { Args: never; Returns: string }
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
      app_role: "admin" | "customer" | "editor" | "viewer"
      contact_status: "new" | "in_progress" | "replied" | "closed"
      newsletter_source: "website" | "checkout" | "manual" | "import"
      newsletter_status: "active" | "unsubscribed" | "bounced"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      product_style: "classique" | "sexy" | "sport" | "confort" | "elegant"
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
      app_role: ["admin", "customer", "editor", "viewer"],
      contact_status: ["new", "in_progress", "replied", "closed"],
      newsletter_source: ["website", "checkout", "manual", "import"],
      newsletter_status: ["active", "unsubscribed", "bounced"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      payment_status: ["pending", "paid", "failed", "refunded"],
      product_style: ["classique", "sexy", "sport", "confort", "elegant"],
    },
  },
} as const
