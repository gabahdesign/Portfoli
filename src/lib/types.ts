/**
 * Core Type Definitions for the Portfolio Project
 */

export type Locale = "ca" | "es" | "en" | "fr";

export interface LocalizedText {
  ca: string;
  es: string;
  en: string;
  fr: string;
}

export interface Company {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  sector: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  website: string | null;
  is_freelance: boolean;
  parent_id: string | null;
  created_at: string;
}

export interface Work {
  id: string;
  company_id: string;
  slug: string;
  title: string;
  cover_url: string | null;
  summary: string | null;
  content: any; // TipTap JSON
  tags: string[];
  work_date: string | null;
  status: "draft" | "published" | "archived";
  featured: boolean;
  protected: boolean;
  pin_hash: string | null;
  version_history: any[]; // { timestamp, title, content }
  created_at: string;
  updated_at: string;
  visibility_type?: "private" | "public_token" | "public_always";
}

export interface AccessToken {
  id: string;
  token: string;
  label: string;
  welcome_message: LocalizedText | null;
  company_ids: string[] | null;
  active: boolean;
  expires_at: string | null;
  notify_email: boolean;
  pin_hash: string | null;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  token_id: string | null;
  event_type: "view_portfolio" | "view_about" | "view_company" | "view_work" | "view_cv" | "download_cv" | "pin_attempt" | "pin_success";
  resource_id: string | null;
  page_path: string | null;
  referrer: string | null;
  duration_sec: number | null;
  scroll_pct: number | null;
  created_at: string;
}

export interface CVSection {
  id: string;
  type: "experiencia" | "educacion" | "habilidades" | "idiomas" | "sobre_mi";
  title: LocalizedText;
  content: any; // LocalizedText or structured content
  sort_order: number;
}
