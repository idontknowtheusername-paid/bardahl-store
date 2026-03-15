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
          unsubscribe_token: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          unsubscribe_token?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          unsubscribe_token?: string | null
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
          parent_id: string | null
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
          parent_id?: string | null
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
          parent_id?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
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
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
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
      customer_vehicles: {
        Row: {
          brand: string | null
          created_at: string
          customer_id: string
          fuel_type: string | null
          id: string
          license_plate: string
          mileage: number | null
          model: string | null
          updated_at: string
          vin: string | null
          year: number | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          customer_id: string
          fuel_type?: string | null
          id?: string
          license_plate: string
          mileage?: number | null
          model?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          customer_id?: string
          fuel_type?: string | null
          id?: string
          license_plate?: string
          mileage?: number | null
          model?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      description_generation_schedule: {
        Row: {
          current_frequency: string | null
          id: number
          last_run: string | null
          setup_date: string | null
          switch_date: string | null
          total_processed: number | null
          total_runs: number | null
        }
        Insert: {
          current_frequency?: string | null
          id?: number
          last_run?: string | null
          setup_date?: string | null
          switch_date?: string | null
          total_processed?: number | null
          total_runs?: number | null
        }
        Update: {
          current_frequency?: string | null
          id?: number
          last_run?: string | null
          setup_date?: string | null
          switch_date?: string | null
          total_processed?: number | null
          total_runs?: number | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          id: string
          label: string
          notes: string | null
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          label: string
          notes?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          label?: string
          notes?: string | null
        }
        Relationships: []
      }
      lubrication_plans: {
        Row: {
          brake_fluid_type: string | null
          change_frequency_km: number | null
          change_frequency_months: number | null
          coolant_type: string | null
          created_at: string
          engine_cleaner: string | null
          gearbox_cleaner: string | null
          id: string
          oil_quantity_engine: string | null
          oil_quantity_gearbox: string | null
          oil_type_engine: string | null
          oil_type_gearbox: string | null
          radiator_cleaner: string | null
          recommended_product_id: string | null
          reminder_frequency_months: number | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          brake_fluid_type?: string | null
          change_frequency_km?: number | null
          change_frequency_months?: number | null
          coolant_type?: string | null
          created_at?: string
          engine_cleaner?: string | null
          gearbox_cleaner?: string | null
          id?: string
          oil_quantity_engine?: string | null
          oil_quantity_gearbox?: string | null
          oil_type_engine?: string | null
          oil_type_gearbox?: string | null
          radiator_cleaner?: string | null
          recommended_product_id?: string | null
          reminder_frequency_months?: number | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          brake_fluid_type?: string | null
          change_frequency_km?: number | null
          change_frequency_months?: number | null
          coolant_type?: string | null
          created_at?: string
          engine_cleaner?: string | null
          gearbox_cleaner?: string | null
          id?: string
          oil_quantity_engine?: string | null
          oil_quantity_gearbox?: string | null
          oil_type_engine?: string | null
          oil_type_gearbox?: string | null
          radiator_cleaner?: string | null
          recommended_product_id?: string | null
          reminder_frequency_months?: number | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lubrication_plans_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: true
            referencedRelation: "customer_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          admin_validated: boolean | null
          admin_validated_at: string | null
          admin_validated_by: string | null
          created_at: string
          id: string
          last_date: string | null
          maintenance_type: string
          mileage_at_service: number | null
          next_date: string | null
          notes: string | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          admin_validated?: boolean | null
          admin_validated_at?: string | null
          admin_validated_by?: string | null
          created_at?: string
          id?: string
          last_date?: string | null
          maintenance_type: string
          mileage_at_service?: number | null
          next_date?: string | null
          notes?: string | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          admin_validated?: boolean | null
          admin_validated_at?: string | null
          admin_validated_by?: string | null
          created_at?: string
          id?: string
          last_date?: string | null
          maintenance_type?: string
          mileage_at_service?: number | null
          next_date?: string | null
          notes?: string | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "customer_vehicles"
            referencedColumns: ["id"]
          },
        ]
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
      oil_change_reminders: {
        Row: {
          alert_preferences: Json
          alerts_sent: Json
          created_at: string
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          is_active: boolean
          last_purchase_date: string
          next_reminder_date: string
          order_id: string | null
          product_id: string | null
          product_title: string | null
          reminder_count: number
          reminder_interval_months: number
          updated_at: string
          vehicle_brand: string | null
          vehicle_engine: string | null
          vehicle_model: string | null
        }
        Insert: {
          alert_preferences?: Json
          alerts_sent?: Json
          created_at?: string
          customer_email: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          is_active?: boolean
          last_purchase_date?: string
          next_reminder_date?: string
          order_id?: string | null
          product_id?: string | null
          product_title?: string | null
          reminder_count?: number
          reminder_interval_months?: number
          updated_at?: string
          vehicle_brand?: string | null
          vehicle_engine?: string | null
          vehicle_model?: string | null
        }
        Update: {
          alert_preferences?: Json
          alerts_sent?: Json
          created_at?: string
          customer_email?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          is_active?: boolean
          last_purchase_date?: string
          next_reminder_date?: string
          order_id?: string | null
          product_id?: string | null
          product_title?: string | null
          reminder_count?: number
          reminder_interval_months?: number
          updated_at?: string
          vehicle_brand?: string | null
          vehicle_engine?: string | null
          vehicle_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oil_change_reminders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      page_views: {
        Row: {
          created_at: string
          id: string
          page_path: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page_path?: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          session_id?: string | null
        }
        Relationships: []
      }
      problem_solutions: {
        Row: {
          category: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          problem_number: number
          recommended_products: string
          symptom: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          problem_number: number
          recommended_products: string
          symptom: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          problem_number?: number
          recommended_products?: string
          symptom?: string
          updated_at?: string | null
        }
        Relationships: []
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
          click_count: number | null
          compare_at_price: number | null
          composition: string | null
          created_at: string | null
          description: string | null
          featured_order: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          price: number
          product_type: string | null
          sales_count: number | null
          short_description: string | null
          sku: string | null
          slug: string
          stock: number | null
          style: string | null
          subcategory_id: string | null
          title: string
          updated_at: string | null
          view_count: number | null
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
          click_count?: number | null
          compare_at_price?: number | null
          composition?: string | null
          created_at?: string | null
          description?: string | null
          featured_order?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          price?: number
          product_type?: string | null
          sales_count?: number | null
          short_description?: string | null
          sku?: string | null
          slug: string
          stock?: number | null
          style?: string | null
          subcategory_id?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
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
          click_count?: number | null
          compare_at_price?: number | null
          composition?: string | null
          created_at?: string | null
          description?: string | null
          featured_order?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          price?: number
          product_type?: string | null
          sales_count?: number | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          stock?: number | null
          style?: string | null
          subcategory_id?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
          viscosity?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      revenues: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          id: string
          label: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          id?: string
          label: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          label?: string
          notes?: string | null
          updated_at?: string
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
          qr_activation_price: number | null
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
          qr_activation_price?: number | null
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
          qr_activation_price?: number | null
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
      vehicle_qr_codes: {
        Row: {
          created_at: string
          id: string
          is_paid: boolean | null
          payment_id: string | null
          qr_token: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_paid?: boolean | null
          payment_id?: string | null
          qr_token?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_paid?: boolean | null
          payment_id?: string | null
          qr_token?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_qr_codes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "customer_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_specifications: {
        Row: {
          brake_fluid_type: string | null
          brand: string
          change_frequency_km: number | null
          change_frequency_months: number | null
          coolant_type: string | null
          created_at: string
          engine_cleaner: string | null
          engine_type: string | null
          gearbox_cleaner: string | null
          id: string
          model: string
          oil_quantity_engine: string | null
          oil_quantity_gearbox: string | null
          oil_type_engine: string | null
          oil_type_gearbox: string | null
          radiator_cleaner: string | null
          recommended_viscosity_tropical: string | null
          updated_at: string
          year_end: number | null
          year_start: number | null
        }
        Insert: {
          brake_fluid_type?: string | null
          brand: string
          change_frequency_km?: number | null
          change_frequency_months?: number | null
          coolant_type?: string | null
          created_at?: string
          engine_cleaner?: string | null
          engine_type?: string | null
          gearbox_cleaner?: string | null
          id?: string
          model: string
          oil_quantity_engine?: string | null
          oil_quantity_gearbox?: string | null
          oil_type_engine?: string | null
          oil_type_gearbox?: string | null
          radiator_cleaner?: string | null
          recommended_viscosity_tropical?: string | null
          updated_at?: string
          year_end?: number | null
          year_start?: number | null
        }
        Update: {
          brake_fluid_type?: string | null
          brand?: string
          change_frequency_km?: number | null
          change_frequency_months?: number | null
          coolant_type?: string | null
          created_at?: string
          engine_cleaner?: string | null
          engine_type?: string | null
          gearbox_cleaner?: string | null
          id?: string
          model?: string
          oil_quantity_engine?: string | null
          oil_quantity_gearbox?: string | null
          oil_type_engine?: string | null
          oil_type_gearbox?: string | null
          radiator_cleaner?: string | null
          recommended_viscosity_tropical?: string | null
          updated_at?: string
          year_end?: number | null
          year_start?: number | null
        }
        Relationships: []
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
      delete_product_cascade: {
        Args: { p_product_id: string }
        Returns: undefined
      }
      get_user_email: { Args: never; Returns: string }
      get_user_phone: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_product_click: {
        Args: { product_id: string }
        Returns: undefined
      }
      increment_product_view: {
        Args: { product_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      log_generation_run: {
        Args: { processed_count: number }
        Returns: undefined
      }
      lookup_customer_email: { Args: { identifier: string }; Returns: string }
      owns_vehicle: { Args: { _vehicle_id: string }; Returns: boolean }
      search_products_fuzzy: {
        Args: { search_query: string }
        Returns: {
          id: string
          is_active: boolean
          price: number
          short_description: string
          similarity_score: number
          stock: number
          title: string
        }[]
      }
      should_switch_to_daily: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_schedule_frequency: {
        Args: { new_frequency: string }
        Returns: undefined
      }
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
