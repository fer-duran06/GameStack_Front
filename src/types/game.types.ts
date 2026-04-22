export interface Game {
  id: number;
  name: string;
  description?: string;
  category?: string;
  image_url?: string;
  max_players?: number;
  rawg_id: number;
  created_by: number;
  created_at: string;
}

export interface RAWGGame {
  rawg_id: number;
  name: string;
  image_url: string;
}

export interface CreateGamePayload {
  name: string;
  description?: string;
  category?: string;
  image_url?: string;
  max_players?: number;
  rawg_id: number;
}