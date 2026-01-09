/**
 * Database Types - Generated from Supabase Schema
 * 
 * Auto-generated from project: jivsdcwwzhyhorhsmyex
 * Generated on: 2026-01-09
 * Updated: 2026-01-09 - Added client_email, custom_message, expiration_days
 */

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
      audit_logs: {
        Row: {
          action: string
          client_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          client_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          client_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_answers: {
        Row: {
          answer_text: string
          client_id: string
          created_at: string | null
          id: string
          question_id: string
        }
        Insert: {
          answer_text: string
          client_id: string
          created_at?: string | null
          id?: string
          question_id: string
        }
        Update: {
          answer_text?: string
          client_id?: string
          created_at?: string | null
          id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_answers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          document_type: string
          file_size_bytes: number | null
          file_url: string
          id: string
          uploaded_at: string | null
        }
        Insert: {
          client_id: string
          document_type: string
          file_size_bytes?: number | null
          file_url: string
          id?: string
          uploaded_at?: string | null
        }
        Update: {
          client_id?: string
          document_type?: string
          file_size_bytes?: number | null
          file_url?: string
          id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_links: {
        Row: {
          access_count: number | null
          client_id: string
          created_at: string | null
          expires_at: string
          id: string
          last_accessed_at: string | null
          magic_link_token: string
          revoked_at: string | null
        }
        Insert: {
          access_count?: number | null
          client_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          last_accessed_at?: string | null
          magic_link_token: string
          revoked_at?: string | null
        }
        Update: {
          access_count?: number | null
          client_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          magic_link_token?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          case_name: string
          client_email: string | null
          client_name: string
          completed_at: string | null
          contract_signed_url: string | null
          contract_template_id: string | null
          created_at: string | null
          custom_message: string | null
          deleted_at: string | null
          expiration_days: number | null
          id: string
          link_used: boolean | null
          questionnaire_template_id: string | null
          required_documents: string[] | null
          signature_data: Json | null
          signature_hash: string | null
          signature_ip: string | null
          signature_timestamp: string | null
          status: string
          user_id: string
        }
        Insert: {
          case_name: string
          client_email?: string | null
          client_name: string
          completed_at?: string | null
          contract_signed_url?: string | null
          contract_template_id?: string | null
          created_at?: string | null
          custom_message?: string | null
          deleted_at?: string | null
          expiration_days?: number | null
          id?: string
          link_used?: boolean | null
          questionnaire_template_id?: string | null
          required_documents?: string[] | null
          signature_data?: Json | null
          signature_hash?: string | null
          signature_ip?: string | null
          signature_timestamp?: string | null
          status?: string
          user_id: string
        }
        Update: {
          case_name?: string
          client_email?: string | null
          client_name?: string
          completed_at?: string | null
          contract_signed_url?: string | null
          contract_template_id?: string | null
          created_at?: string | null
          custom_message?: string | null
          deleted_at?: string | null
          expiration_days?: number | null
          id?: string
          link_used?: boolean | null
          questionnaire_template_id?: string | null
          required_documents?: string[] | null
          signature_data?: Json | null
          signature_hash?: string | null
          signature_ip?: string | null
          signature_timestamp?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_contract_template_id_fkey"
            columns: ["contract_template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_questionnaire_template_id_fkey"
            columns: ["questionnaire_template_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          client_id: string
          created_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          recipient_email: string
          sent_at: string | null
          status: string | null
          type: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          type: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          calendar_link: string | null
          created_at: string | null
          firm_logo_url: string | null
          firm_name: string
          id: string
          theme_mode: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calendar_link?: string | null
          created_at?: string | null
          firm_logo_url?: string | null
          firm_name?: string
          id?: string
          theme_mode?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calendar_link?: string | null
          created_at?: string | null
          firm_logo_url?: string | null
          firm_name?: string
          id?: string
          theme_mode?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      questionnaire_templates: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          created_at: string | null
          id: string
          order_index: number
          question_text: string
          questionnaire_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_index?: number
          question_text: string
          questionnaire_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_index?: number
          question_text?: string
          questionnaire_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_templates"
            referencedColumns: ["id"]
          },
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

// ===========================================
// Convenience type aliases
// ===========================================

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Client = Database['public']['Tables']['clients']['Row']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']

// ClientInsert without user_id (added automatically by service)
export type ClientCreateInput = Omit<ClientInsert, 'user_id'>

export type ClientLink = Database['public']['Tables']['client_links']['Row']
export type ClientLinkInsert = Database['public']['Tables']['client_links']['Insert']

export type ClientDocument = Database['public']['Tables']['client_documents']['Row']
export type ClientDocumentInsert = Database['public']['Tables']['client_documents']['Insert']

export type ClientAnswer = Database['public']['Tables']['client_answers']['Row']
export type ClientAnswerInsert = Database['public']['Tables']['client_answers']['Insert']

export type ContractTemplate = Database['public']['Tables']['contract_templates']['Row']
export type ContractTemplateInsert = Database['public']['Tables']['contract_templates']['Insert']

export type QuestionnaireTemplate = Database['public']['Tables']['questionnaire_templates']['Row']
export type QuestionnaireTemplateInsert = Database['public']['Tables']['questionnaire_templates']['Insert']

export type Question = Database['public']['Tables']['questions']['Row']
export type QuestionInsert = Database['public']['Tables']['questions']['Insert']

export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']

export type EmailNotification = Database['public']['Tables']['email_notifications']['Row']

// ===========================================
// Extended types for joins
// ===========================================

export type ClientWithLink = Client & {
  client_links?: ClientLink[]
}

export type ClientWithDetails = Client & {
  contract_template?: ContractTemplate | null
  questionnaire_template?: (QuestionnaireTemplate & { questions?: Question[] }) | null
  client_links?: ClientLink[]
  client_documents?: ClientDocument[]
  client_answers?: ClientAnswer[]
}

export type QuestionnaireWithQuestions = QuestionnaireTemplate & {
  questions?: Question[]
}

// Signature data type
export type SignatureData = {
  dataUrl?: string
  typed_name?: string
  timestamp: string
  ip?: string
}

// Client status type
export type ClientStatus = 'pending' | 'completed'
