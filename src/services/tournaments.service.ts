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

interface BracketResponse {
  message: string;
  total_matches_created: number;
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

  generateBracket: (tournamentId: number): Promise<BracketResponse> =>
    api.post<BracketResponse>(`/api/v1/tournaments/${tournamentId}/generate-bracket`, {}, true),
};