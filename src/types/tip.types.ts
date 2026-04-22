export interface Build {
  id: number;
  tip_id: number;
  champion: string;
  role: string;
  items: Record<string, unknown>;
  runes: Record<string, unknown>;
  skill_order?: Record<string, unknown>;
  patch_version?: string;
}

export interface Tip {
  id: number;
  game_id: number;
  author_id: number;
  title: string;
  content: string;
  category?: string;
  likes_count: number;
  created_at: string;
  updated_at?: string;
  build?: Build;
}

export interface CreateBuildPayload {
  champion: string;
  role: string;
  items: Record<string, unknown>;
  runes: Record<string, unknown>;
  skill_order?: Record<string, unknown>;
  patch_version?: string;
}

export interface CreateTipPayload {
  game_id: number;
  title: string;
  content: string;
  category?: string;
  build?: CreateBuildPayload;
}