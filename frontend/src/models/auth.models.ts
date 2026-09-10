import type { AxiosRequestConfig, AxiosRequestHeaders } from "axios";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
}

export interface MenuItem {
  id: number;
  name: string;
  code: string;
  module?: string;
  is_menu: boolean;
  icon?: string;
  path?: string;
  sort_order: number;
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  module?: string;
  description?: string;
  is_menu: boolean;
  icon?: string;
  path?: string;
  sort_order: number;
}

export interface UserRole {
  id: number;
  name: string;
  code: string;
  description?: string;
  permissions?: Permission[];
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  employee_id?: string;
  full_name?: string;
  profile_picture?: string;
  is_active: boolean;
  roles: UserRole[];
  permission_codes?: string[];
  menu_tree?: MenuItem[];
}

export interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  headers: AxiosRequestHeaders;
}