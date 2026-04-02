export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      member_profiles: {
        Row: {
          city: string;
          created_at: string;
          email: string;
          first_name: string;
          full_name: string | null;
          gender: string;
          is_admin: boolean;
          last_name: string;
          member_number: string;
          photo_source: string;
          strava_athlete_id: number | null;
          strava_connected: boolean;
          strava_last_sync_at: string | null;
          strava_photo: string;
          updated_at: string;
          upload_photo: string;
          user_id: string;
          year_elevation: number;
          year_km: number;
        };
        Insert: {
          city?: string;
          created_at?: string;
          email: string;
          first_name: string;
          full_name?: string | null;
          gender: string;
          is_admin?: boolean;
          last_name: string;
          member_number: string;
          photo_source?: string;
          strava_athlete_id?: number | null;
          strava_connected?: boolean;
          strava_last_sync_at?: string | null;
          strava_photo?: string;
          updated_at?: string;
          upload_photo?: string;
          user_id: string;
          year_elevation?: number;
          year_km?: number;
        };
        Update: {
          city?: string;
          created_at?: string;
          email?: string;
          first_name?: string;
          full_name?: string | null;
          gender?: string;
          is_admin?: boolean;
          last_name?: string;
          member_number?: string;
          photo_source?: string;
          strava_athlete_id?: number | null;
          strava_connected?: boolean;
          strava_last_sync_at?: string | null;
          strava_photo?: string;
          updated_at?: string;
          upload_photo?: string;
          user_id?: string;
          year_elevation?: number;
          year_km?: number;
        };
        Relationships: [];
      };
      strava_connections: {
        Row: {
          access_token: string;
          athlete_id: number | null;
          created_at: string;
          expires_at: number;
          last_sync_at: string | null;
          last_webhook_at: string | null;
          member_id: string;
          refresh_token: string;
          scopes: string[];
          status: string;
          updated_at: string;
        };
        Insert: {
          access_token?: string;
          athlete_id?: number | null;
          created_at?: string;
          expires_at?: number;
          last_sync_at?: string | null;
          last_webhook_at?: string | null;
          member_id: string;
          refresh_token?: string;
          scopes?: string[];
          status?: string;
          updated_at?: string;
        };
        Update: {
          access_token?: string;
          athlete_id?: number | null;
          created_at?: string;
          expires_at?: number;
          last_sync_at?: string | null;
          last_webhook_at?: string | null;
          member_id?: string;
          refresh_token?: string;
          scopes?: string[];
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      clear_current_member_strava: {
        Args: never;
        Returns: undefined;
      };
      create_member_profile: {
        Args: {
          p_city?: string;
          p_draft_strava_profile?: Json;
          p_email: string;
          p_first_name: string;
          p_gender: string;
          p_last_name: string;
          p_member_number: string;
          p_upload_photo?: string;
          p_use_strava_photo?: boolean;
          p_user_id: string;
        };
        Returns: undefined;
      };
      find_member_profile_for_password_reset: {
        Args: {
          p_email: string;
          p_member_number: string;
        };
        Returns: string;
      };
      list_member_profiles_for_league: {
        Args: never;
        Returns: {
          city: string;
          first_name: string;
          full_name: string;
          gender: string;
          id: string;
          is_admin: boolean;
          last_name: string;
          member_number: string;
          photo_source: string;
          strava_athlete_id: number | null;
          strava_connected: boolean;
          strava_last_sync_at: string | null;
          strava_photo: string;
          upload_photo: string;
          year_elevation: number;
          year_km: number;
        }[];
      };
      set_current_member_strava: {
        Args: {
          p_profile: Json;
          p_use_strava_photo?: boolean;
        };
        Returns: undefined;
      };
      update_current_member_profile: {
        Args: {
          p_city?: string;
          p_email: string;
          p_first_name: string;
          p_gender: string;
          p_last_name: string;
          p_member_number: string;
          p_upload_photo?: string;
          p_use_strava_photo?: boolean;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
