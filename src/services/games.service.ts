import { api } from '@/lib/api';
import { CreateGamePayload, Game, RAWGGame } from '@/types/game.types';

interface SearchResponse {
  message: string;
  results: RAWGGame[];
}

interface CreateGameResponse {
  message: string;
  game?: Game;
  gameId?: number;
}

interface GamesListResponse {
  message: string;
  games: Game[];
}

export const gamesService = {
  // Todos los juegos registrados en la plataforma
  getAll: (): Promise<GamesListResponse> =>
    api.get<GamesListResponse>('/api/v1/games', true),

  // Buscar en RAWG
  search: (query: string): Promise<SearchResponse> =>
    api.get<SearchResponse>(`/api/v1/games/search?q=${encodeURIComponent(query)}`, true),

  // Registrar juego en la plataforma
  create: (payload: CreateGamePayload): Promise<CreateGameResponse> =>
    api.post<CreateGameResponse>('/api/v1/games', payload, true),
};