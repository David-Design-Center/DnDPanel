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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          customer_name: string
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          phone_1: string | null
          phone_2: string | null
          email: string | null
          created_by: string
          created_at: string
          po_number: string | null
        }
        Insert: {
          id?: string
          customer_name: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          phone_1?: string | null
          phone_2?: string | null
          email?: string | null
          created_by: string
          created_at?: string
          po_number?: string | null
        }
        Update: {
          id?: string
          customer_name?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          phone_1?: string | null
          phone_2?: string | null
          email?: string | null
          created_by?: string
          created_at?: string
          po_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          item: string
          description: string | null
          qty: number
          price: number
          total: number
        }
        Insert: {
          id?: string
          order_id: string
          item: string
          description?: string | null
          qty: number
          price: number
          // total is generated
        }
        Update: {
          id?: string
          order_id?: string
          item?: string
          description?: string | null
          qty?: number
          price?: number
          // total is generated
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          order_id: string
          invoice_date: string
          pdf_url: string | null
          tax: number
          sub_total: number
          deposit: number
          total: number
          balance: number
          payments: Json
          final_balance: number
        }
        Insert: {
          id?: string
          order_id: string
          invoice_date?: string
          pdf_url?: string | null
          tax?: number
          sub_total: number
          deposit?: number
          // total is generated
          // balance is generated
          payments?: Json
          final_balance?: number
        }
        Update: {
          id?: string
          order_id?: string
          invoice_date?: string
          pdf_url?: string | null
          tax?: number
          sub_total?: number
          deposit?: number
          // total is generated
          // balance is generated
          payments?: Json
          final_balance?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          order_id: string | null
          sent_by: string
          sent_at: string
          subject: string
          content: string
          attachments: Json
          is_read: boolean
        }
        Insert: {
          id?: string
          order_id?: string | null
          sent_by: string
          sent_at?: string
          subject: string
          content: string
          attachments?: Json
          is_read?: boolean
        }
        Update: {
          id?: string
          order_id?: string | null
          sent_by?: string
          sent_at?: string
          subject?: string
          content?: string
          attachments?: Json
          is_read?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}