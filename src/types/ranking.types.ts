export type PeriodType = 'quincenal' | 'mensual';

export interface RankingEntry {
  live_position: number;
  player_name: string;
  total_score: number;
  wins: number;
  matches_played: number;
  period_start: string;
  period_end: string;
}

export interface RankingResponse {
  message: string;
  game_id: number;
  leaderboard: RankingEntry[];
}