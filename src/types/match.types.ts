export type MatchStatus = 'open' | 'scheduled' | 'in_progress' | 'finished';

export interface Match {
  id: number;
  game_id: number;
  game_name: string;
  game_image?: string;
  creator_id: number;
  creator_name: string;
  title: string;
  description?: string;
  status: MatchStatus;
  max_players: number;
  scheduled_at?: string;
  created_at: string;
}

export interface CreateMatchPayload {
  game_id: number;
  title: string;
  description?: string;
  max_players: number;
  scheduled_at?: string;
}