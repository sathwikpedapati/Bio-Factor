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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string | null
          date: string
          employee_id: string
          id: string
          notes: string | null
          status: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date: string
          employee_id: string
          id?: string
          notes?: string | null
          status?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          achieved: number | null
          budget: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          reach: number | null
          spent: number | null
          start_date: string | null
          status: string | null
          target: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          achieved?: number | null
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          reach?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          target?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          achieved?: number | null
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          reach?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          target?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dealers: {
        Row: {
          address: string | null
          business_name: string | null
          city: string | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          email: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          kyc_documents: Json | null
          kyc_status: string | null
          name: string
          outstanding_balance: number | null
          phone: string
          region_id: string | null
          state: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          email?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          kyc_documents?: Json | null
          kyc_status?: string | null
          name: string
          outstanding_balance?: number | null
          phone: string
          region_id?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          email?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          kyc_documents?: Json | null
          kyc_status?: string | null
          name?: string
          outstanding_balance?: number | null
          phone?: string
          region_id?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealers_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          bank_account: string | null
          created_at: string | null
          date_of_joining: string | null
          department: string
          designation: string | null
          email: string | null
          emergency_contact: string | null
          employee_code: string
          full_name: string
          id: string
          phone: string | null
          salary: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          created_at?: string | null
          date_of_joining?: string | null
          department: string
          designation?: string | null
          email?: string | null
          emergency_contact?: string | null
          employee_code: string
          full_name: string
          id?: string
          phone?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          created_at?: string | null
          date_of_joining?: string | null
          department?: string
          designation?: string | null
          email?: string | null
          emergency_contact?: string | null
          employee_code?: string
          full_name?: string
          id?: string
          phone?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      farmers: {
        Row: {
          created_at: string | null
          crops: Json | null
          dealer_id: string | null
          district: string | null
          farm_size_acres: number | null
          id: string
          name: string
          phone: string | null
          state: string | null
          village: string | null
        }
        Insert: {
          created_at?: string | null
          crops?: Json | null
          dealer_id?: string | null
          district?: string | null
          farm_size_acres?: number | null
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          village?: string | null
        }
        Update: {
          created_at?: string | null
          crops?: Json | null
          dealer_id?: string | null
          district?: string | null
          farm_size_acres?: number | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmers_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      field_visits: {
        Row: {
          created_at: string | null
          employee_id: string | null
          farmer_id: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          issues_reported: string | null
          location: string | null
          outcome: string | null
          photos: Json | null
          purpose: string | null
          visit_date: string
          visit_type: string
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          farmer_id?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          issues_reported?: string | null
          location?: string | null
          outcome?: string | null
          photos?: Json | null
          purpose?: string | null
          visit_date: string
          visit_type: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          farmer_id?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          issues_reported?: string | null
          location?: string | null
          outcome?: string | null
          photos?: Json | null
          purpose?: string | null
          visit_date?: string
          visit_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_visits_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_visits_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          dealer_id: string
          due_date: string | null
          id: string
          invoice_date: string | null
          invoice_number: string
          order_id: string | null
          paid_amount: number | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          dealer_id: string
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number: string
          order_id?: string | null
          paid_amount?: number | null
          status?: string | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
        }
        Update: {
          created_at?: string | null
          dealer_id?: string
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string
          order_id?: string | null
          paid_amount?: number | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      leaves: {
        Row: {
          approved_by: string | null
          created_at: string | null
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          start_date: string
          status: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          employee_id: string
          end_date: string
          id?: string
          leave_type: string
          reason?: string | null
          start_date: string
          status?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaves_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          discount_percent: number | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          discount_percent?: number | null
          id?: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          discount_percent?: number | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
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
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          dealer_id: string
          discount_amount: number | null
          expected_delivery: string | null
          id: string
          net_amount: number | null
          notes: string | null
          order_date: string | null
          order_number: string
          payment_status: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          dealer_id: string
          discount_amount?: number | null
          expected_delivery?: string | null
          id?: string
          net_amount?: number | null
          notes?: string | null
          order_date?: string | null
          order_number: string
          payment_status?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          dealer_id?: string
          discount_amount?: number | null
          expected_delivery?: string | null
          id?: string
          net_amount?: number | null
          notes?: string | null
          order_date?: string | null
          order_number?: string
          payment_status?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          dealer_id: string
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          received_by: string | null
          reference_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          dealer_id: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          received_by?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          dealer_id?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          received_by?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      production_batches: {
        Row: {
          actual_quantity: number | null
          batch_number: string
          cost_per_unit: number | null
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          machine_id: string | null
          notes: string | null
          planned_quantity: number
          product_id: string
          raw_materials: Json | null
          start_date: string | null
          status: string | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          actual_quantity?: number | null
          batch_number: string
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          machine_id?: string | null
          notes?: string | null
          planned_quantity: number
          product_id: string
          raw_materials?: Json | null
          start_date?: string | null
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_quantity?: number | null
          batch_number?: string
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          machine_id?: string | null
          notes?: string | null
          planned_quantity?: number
          product_id?: string
          raw_materials?: Json | null
          start_date?: string | null
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          min_stock_level: number | null
          name: string
          price: number
          sku: string
          status: string | null
          unit: string | null
        }
        Insert: {
          category: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          min_stock_level?: number | null
          name: string
          price: number
          sku: string
          status?: string | null
          unit?: string | null
        }
        Update: {
          category?: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          min_stock_level?: number | null
          name?: string
          price?: number
          sku?: string
          status?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      qc_tests: {
        Row: {
          approved_by: string | null
          attachments: Json | null
          batch_id: string
          created_at: string | null
          id: string
          notes: string | null
          parameters: Json | null
          passed: boolean | null
          result: string | null
          test_date: string | null
          test_type: string
          tested_by: string | null
        }
        Insert: {
          approved_by?: string | null
          attachments?: Json | null
          batch_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          parameters?: Json | null
          passed?: boolean | null
          result?: string | null
          test_date?: string | null
          test_type: string
          tested_by?: string | null
        }
        Update: {
          approved_by?: string | null
          attachments?: Json | null
          batch_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          parameters?: Json | null
          passed?: boolean | null
          result?: string | null
          test_date?: string | null
          test_type?: string
          tested_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qc_tests_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "production_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
          zone: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
          zone?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          zone?: string | null
        }
        Relationships: []
      }
      stocks: {
        Row: {
          batch_number: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          product_id: string
          quantity: number
          status: string | null
          updated_at: string | null
          warehouse_id: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          product_id: string
          quantity?: number
          status?: string | null
          updated_at?: string | null
          warehouse_id: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          product_id?: string
          quantity?: number
          status?: string | null
          updated_at?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stocks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stocks_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      trials: {
        Row: {
          budget: number | null
          created_at: string | null
          created_by: string | null
          documents: Json | null
          end_date: string | null
          id: string
          name: string
          objectives: string | null
          product_id: string | null
          results: string | null
          spent: number | null
          stage: string | null
          start_date: string | null
          status: string | null
          trial_code: string
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          documents?: Json | null
          end_date?: string | null
          id?: string
          name: string
          objectives?: string | null
          product_id?: string | null
          results?: string | null
          spent?: number | null
          stage?: string | null
          start_date?: string | null
          status?: string | null
          trial_code: string
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          documents?: Json | null
          end_date?: string | null
          id?: string
          name?: string
          objectives?: string | null
          product_id?: string | null
          results?: string | null
          spent?: number | null
          stage?: string | null
          start_date?: string | null
          status?: string | null
          trial_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          address: string | null
          capacity: number | null
          city: string | null
          code: string
          created_at: string | null
          id: string
          manager_id: string | null
          name: string
          region_id: string | null
          status: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          code: string
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name: string
          region_id?: string | null
          status?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          code?: string
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          region_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "sales_officer"
        | "field_officer"
        | "mdo"
        | "regional_manager"
        | "zonal_manager"
        | "warehouse_manager"
        | "manufacturing_manager"
        | "qc_analyst"
        | "finance_officer"
        | "hr_manager"
        | "rnd_manager"
        | "executive"
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
      app_role: [
        "super_admin",
        "sales_officer",
        "field_officer",
        "mdo",
        "regional_manager",
        "zonal_manager",
        "warehouse_manager",
        "manufacturing_manager",
        "qc_analyst",
        "finance_officer",
        "hr_manager",
        "rnd_manager",
        "executive",
      ],
    },
  },
} as const
