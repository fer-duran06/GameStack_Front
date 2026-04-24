import { api } from '@/lib/api';
import { CreateTournamentPayload, Tournament } from '@/types/tournament.types';

interface TournamentsResponse {
  message: string;
  tournaments: Tournament[];
}

interface CreateTournamentResponse {
  message: string;
  tournament: Tournament;
}

interface JoinResponse {
  message: string;
}

interface LeaveResponse {
  message: string;
}

interface StatusResponse {
  message: string;
  tournament?: Tournament;
}

interface BracketMatch {
  id: number;
  round: number;
  status: string;
  participant1_id?: number;
  participant2_id?: number;
  participant1_name?: string;
  participant2_name?: string;
  winner_id?: number;
  winner_name?: string;
}

export interface BracketResponse {
  message: string;
  total_matches_created?: number;
  matches?: BracketMatch[];
  bracket?: BracketMatch[];
}

export const tournamentsService = {
  getAll: (): Promise<TournamentsResponse> =>
    api.get<TournamentsResponse>('/api/v1/tournaments'),

  getMy: (): Promise<TournamentsResponse> =>
    api.get<TournamentsResponse>('/api/v1/tournaments/my', true),

  create: (payload: CreateTournamentPayload): Promise<CreateTournamentResponse> =>
    api.post<CreateTournamentResponse>('/api/v1/tournaments', payload, true),

  join: (tournamentId: number): Promise<JoinResponse> =>
    api.post<JoinResponse>(`/api/v1/tournaments/${tournamentId}/join`, {}, true),

  leave: (tournamentId: number): Promise<LeaveResponse> =>
    api.post<LeaveResponse>(`/api/v1/tournaments/${tournamentId}/leave`, {}, true),

  // Iniciar torneo (registration → active)
  start: (tournamentId: number): Promise<StatusResponse> =>
    api.post<StatusResponse>(`/api/v1/tournaments/${tournamentId}/start`, {}, true),

  // Finalizar torneo (active → finished)
  finish: (tournamentId: number): Promise<StatusResponse> =>
    api.post<StatusResponse>(`/api/v1/tournaments/${tournamentId}/finish`, {}, true),

  // Generar bracket y obtener partidas
  generateBracket: (tournamentId: number): Promise<BracketResponse> =>
    api.post<BracketResponse>(`/api/v1/tournaments/${tournamentId}/generate-bracket`, {}, true),

  // Obtener bracket ya generado
  getBracket: (tournamentId: number): Promise<BracketResponse> =>
    api.get<BracketResponse>(`/api/v1/tournaments/${tournamentId}/bracket`, true),
};