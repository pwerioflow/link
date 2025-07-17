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
          username: string | null // Adicionado
        }
        Insert: {
          id: string
          business_name?: string
          business_description?: string | null
          business_logo_url?: string | null
          company_logo_url?: string | null
          created_at?: string
          updated_at?: string
          username?: string | null // Adicionado
        }
        Update: {
          id?: string
          business_name?: string
          business_description?: string | null
          business_logo_url?: string | null
          company_logo_url?: string | null
          created_at?: string
          updated_at?: string
          username?: string | null // Adicionado
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
