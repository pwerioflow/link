export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          business_name: string
          business_description: string | null
          business_logo_url: string | null
          company_logo_url: string | null
          created_at: string
          updated_at: string
          username: string | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean
          stripe_charges_enabled: boolean
          stripe_payouts_enabled: boolean
        }
        Insert: {
          id: string
          business_name?: string
          business_description?: string | null
          business_logo_url?: string | null
          company_logo_url?: string | null
          created_at?: string
          updated_at?: string
          username?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          stripe_charges_enabled?: boolean
          stripe_payouts_enabled?: boolean
        }
        Update: {
          id?: string
          business_name?: string
          business_description?: string | null
          business_logo_url?: string | null
          company_logo_url?: string | null
          created_at?: string
          updated_at?: string
          username?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          stripe_charges_enabled?: boolean
          stripe_payouts_enabled?: boolean
        }
      }
      settings: {
        Row: {
          id: string
          button_color: string
          button_hover_color: string
          text_color: string
          text_hover_color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          button_color?: string
          button_hover_color?: string
          text_color?: string
          text_hover_color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          button_color?: string
          button_hover_color?: string
          text_color?: string
          text_hover_color?: string
          created_at?: string
          updated_at?: string
        }
      }
      links: {
        Row: {
          id: string
          user_id: string
          title: string
          subtitle: string | null
          href: string
          type: "link" | "email" | "whatsapp" | "download"
          icon_type: "instagram" | "email" | "website" | "download" | "whatsapp"
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          subtitle?: string | null
          href: string
          type: "link" | "email" | "whatsapp" | "download"
          icon_type: "instagram" | "email" | "website" | "download" | "whatsapp"
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          subtitle?: string | null
          href?: string
          type?: "link" | "email" | "whatsapp" | "download"
          icon_type?: "instagram" | "email" | "website" | "download" | "whatsapp"
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          stripe_price_id: string | null
          is_active: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          stripe_price_id?: string | null
          is_active?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          stripe_price_id?: string | null
          is_active?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          status: "active" | "inactive" | "canceled" | "past_due" | "trialing"
          current_period_start: string | null
          current_period_end: string | null
          trial_end: string | null
          plan_name: string
          plan_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: "active" | "inactive" | "canceled" | "past_due" | "trialing"
          current_period_start?: string | null
          current_period_end?: string | null
          trial_end?: string | null
          plan_name?: string
          plan_price?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: "active" | "inactive" | "canceled" | "past_due" | "trialing"
          current_period_start?: string | null
          current_period_end?: string | null
          trial_end?: string | null
          plan_name?: string
          plan_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      qr_code_metrics: {
        Row: {
          id: string
          user_id: string
          scan_count: number
          last_scanned_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scan_count?: number
          last_scanned_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scan_count?: number
          last_scanned_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Tipos para o carrinho de compras
export interface CartItem {
  product: Database["public"]["Tables"]["products"]["Row"]
  quantity: number
}
