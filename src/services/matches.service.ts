import { api } from '@/lib/api';
import { CreateMatchPayload, Match } from '@/types/match.types';

interface MatchesResponse {
  message: string;
  matches: Match[];
}

interface CreateMatchResponse {
  message: string;
  match: Match;
}

interface JoinMatchResponse {
  message: string;
}

export const matchesService = {
  getAll: (): Promise<MatchesResponse> =>
    api.get<MatchesResponse>('/api/v1/matches'),

  create: (payload: CreateMatchPayload): Promise<CreateMatchResponse> =>
    api.post<CreateMatchResponse>('/api/v1/matches', payload, true),

  join: (matchId: number): Promise<JoinMatchResponse> =>
    api.post<JoinMatchResponse>(`/api/v1/matches/${matchId}/join`, {}, true),
};