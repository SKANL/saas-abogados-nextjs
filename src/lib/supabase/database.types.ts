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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
          organization_id: string | null
          questionnaire_template_id: string | null
          required_documents: string[] | null
          signature_data: Json | null
          signature_hash: string | null
          signature_ip: string | null
          signature_timestamp: string | null
          signed_name: string | null
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
          organization_id?: string | null
          questionnaire_template_id?: string | null
          required_documents?: string[] | null
          signature_data?: Json | null
          signature_hash?: string | null
          signature_ip?: string | null
          signature_timestamp?: string | null
          signed_name?: string | null
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
          organization_id?: string | null
          questionnaire_template_id?: string | null
          required_documents?: string[] | null
          signature_data?: Json | null
          signature_hash?: string | null
          signature_ip?: string | null
          signature_timestamp?: string | null
          signed_name?: string | null
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
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          invited_email_match_required: boolean | null
          organization_id: string | null
          revoked_at: string | null
          role: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invitation_token: string
          invited_by: string
          invited_email_match_required?: boolean | null
          organization_id?: string | null
          revoked_at?: string | null
          role: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          invited_email_match_required?: boolean | null
          organization_id?: string | null
          revoked_at?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          id: string
          logo_url: string | null
          max_clients_per_lawyer: number | null
          max_lawyers: number | null
          max_storage_gb: number | null
          name: string
          owner_id: string | null
          primary_color: string | null
          secondary_color: string | null
          slug: string
          status: string | null
          subscription_plan: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          max_clients_per_lawyer?: number | null
          max_lawyers?: number | null
          max_storage_gb?: number | null
          name: string
          owner_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          status?: string | null
          subscription_plan?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          max_clients_per_lawyer?: number | null
          max_lawyers?: number | null
          max_storage_gb?: number | null
          name?: string
          owner_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          status?: string | null
          subscription_plan?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bio: string | null
          calendar_link: string | null
          created_at: string | null
          email_notifications: boolean | null
          firm_logo_url: string | null
          firm_name: string
          full_name: string | null
          id: string
          language: string | null
          last_login_at: string | null
          license_number: string | null
          max_clients: number | null
          max_storage_mb: number | null
          onboarding_completed: boolean | null
          organization_id: string | null
          phone: string | null
          profile_photo_url: string | null
          role: string | null
          status: string | null
          subscription_expires_at: string | null
          subscription_plan: string | null
          theme_mode: string | null
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          calendar_link?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          firm_logo_url?: string | null
          firm_name?: string
          full_name?: string | null
          id?: string
          language?: string | null
          last_login_at?: string | null
          license_number?: string | null
          max_clients?: number | null
          max_storage_mb?: number | null
          onboarding_completed?: boolean | null
          organization_id?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          role?: string | null
          status?: string | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          theme_mode?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          calendar_link?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          firm_logo_url?: string | null
          firm_name?: string
          full_name?: string | null
          id?: string
          language?: string | null
          last_login_at?: string | null
          license_number?: string | null
          max_clients?: number | null
          max_storage_mb?: number | null
          onboarding_completed?: boolean | null
          organization_id?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          role?: string | null
          status?: string | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          theme_mode?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      role_permissions: {
        Row: {
          permission_id: string
          role: string
        }
        Insert: {
          permission_id: string
          role: string
        }
        Update: {
          permission_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      get_user_role: { Args: never; Returns: string }
      has_permission: {
        Args: { permission_name: string; user_role: string }
        Returns: boolean
      }
      validate_invitation_token: {
        Args: { token: string; user_email: string }
        Returns: boolean
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

// ============================================================================
// Convenience Type Exports
// ============================================================================

export type Client = Tables<'clients'>
export type Profile = Tables<'profiles'>
export type Organization = Tables<'organizations'>
export type Invitation = Tables<'invitations'>
export type ClientLink = Tables<'client_links'>
export type ClientAnswer = Tables<'client_answers'>
export type ClientDocument = Tables<'client_documents'>
export type Question = Tables<'questions'>
export type QuestionnaireTemplate = Tables<'questionnaire_templates'>
export type ContractTemplate = Tables<'contract_templates'>
export type AuditLog = Tables<'audit_logs'>
export type EmailNotification = Tables<'email_notifications'>
export type Permission = Tables<'permissions'>
export type RolePermission = Tables<'role_permissions'>

// Insert and Update Types
export type ClientInsert = TablesInsert<'clients'>
export type ClientUpdate = TablesUpdate<'clients'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>
export type OrganizationInsert = TablesInsert<'organizations'>
export type OrganizationUpdate = TablesUpdate<'organizations'>
export type InvitationInsert = TablesInsert<'invitations'>
export type InvitationUpdate = TablesUpdate<'invitations'>
export type ClientAnswerInsert = TablesInsert<'client_answers'>
export type ClientDocumentInsert = TablesInsert<'client_documents'>
export type ClientLinkInsert = TablesInsert<'client_links'>
export type QuestionInsert = TablesInsert<'questions'>
export type QuestionnaireTemplateInsert = TablesInsert<'questionnaire_templates'>
export type ContractTemplateInsert = TablesInsert<'contract_templates'>
export type AuditLogInsert = TablesInsert<'audit_logs'>
export type EmailNotificationInsert = TablesInsert<'email_notifications'>

// Aliases for common patterns
export type ClientCreateInput = Omit<ClientInsert, 'user_id' | 'id' | 'created_at' | 'completed_at' | 'signature_data' | 'signature_hash' | 'signature_ip' | 'signature_timestamp' | 'signed_name' | 'contract_signed_url' | 'link_used'>
export type ClientUpdateInput = ClientUpdate

// Extended Types
export type ClientWithDetails = Client & {
  client_links?: ClientLink[]
  client_answers?: ClientAnswer[]
  client_documents?: ClientDocument[]
}

export type SignatureData = {
  typed_name: string
  timestamp: string
}
