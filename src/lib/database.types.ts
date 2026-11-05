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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      objects: {
        Row: {
          address: string
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "objects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          is_active?: boolean
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      task_status_history: {
        Row: {
          changed_at: string
          changed_by: string
          comment: string | null
          from_status: Database["public"]["Enums"]["task_status"] | null
          id: number
          task_id: string
          to_status: Database["public"]["Enums"]["task_status"]
        }
        Insert: {
          changed_at?: string
          changed_by: string
          comment?: string | null
          from_status?: Database["public"]["Enums"]["task_status"] | null
          id?: never
          task_id: string
          to_status: Database["public"]["Enums"]["task_status"]
        }
        Update: {
          changed_at?: string
          changed_by?: string
          comment?: string | null
          from_status?: Database["public"]["Enums"]["task_status"] | null
          id?: never
          task_id?: string
          to_status?: Database["public"]["Enums"]["task_status"]
        }
        Relationships: [
          {
            foreignKeyName: "task_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_status_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string
          id: string
          object_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          description?: string
          id?: string
          object_id: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string
          id?: string
          object_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "objects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      change_task_status: {
        Args: {
          p_comment?: string
          p_expected_status: Database["public"]["Enums"]["task_status"]
          p_new_status: Database["public"]["Enums"]["task_status"]
          p_task_id: string
        }
        Returns: {
          assignee_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string
          id: string
          object_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_object: {
        Args: { p_address: string; p_name: string }
        Returns: {
          address: string
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "objects"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_task: {
        Args: {
          p_assignee_id: string
          p_description: string
          p_object_id: string
          p_title: string
        }
        Returns: {
          assignee_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string
          id: string
          object_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_object: { Args: { p_object_id: string }; Returns: undefined }
      delete_task: { Args: { p_task_id: string }; Returns: undefined }
      get_current_profile: {
        Args: never
        Returns: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_object_details: { Args: { p_object_id: string }; Returns: Json }
      get_task_actions: { Args: { p_task_id: string }; Returns: Json }
      get_task_details: { Args: { p_task_id: string }; Returns: Json }
      list_executors: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string }
        Returns: Json
      }
      list_my_tasks: {
        Args: {
          p_limit?: number
          p_object_id?: string
          p_offset?: number
          p_search?: string
          p_status?: Database["public"]["Enums"]["task_status"]
        }
        Returns: Json
      }
      list_objects: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string }
        Returns: Json
      }
      list_task_history: {
        Args: { p_limit?: number; p_offset?: number; p_task_id: string }
        Returns: Json
      }
      list_tasks: {
        Args: {
          p_assignee_id?: string
          p_limit?: number
          p_object_id?: string
          p_offset?: number
          p_search?: string
          p_status?: Database["public"]["Enums"]["task_status"]
        }
        Returns: Json
      }
      update_object: {
        Args: { p_address: string; p_name: string; p_object_id: string }
        Returns: {
          address: string
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "objects"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_task: {
        Args: {
          p_assignee_id: string
          p_description: string
          p_object_id: string
          p_task_id: string
          p_title: string
        }
        Returns: {
          assignee_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string
          id: string
          object_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "dispatcher" | "executor"
      task_status: "new" | "in_progress" | "in_review" | "accepted" | "rework"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["dispatcher", "executor"],
      task_status: ["new", "in_progress", "in_review", "accepted", "rework"],
    },
  },
} as const
