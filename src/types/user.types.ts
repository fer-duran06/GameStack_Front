export interface User {
  id: number;
  name: string;
  email: string;
  biografia?: string;
  role: 'user' | 'admin';
  riot_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface UpdateUserPayload {
  name?: string;
  biografia?: string;
  riot_id?: string;
}

export interface UserStats {
  torneos_jugados: string;
}

export interface UserProfileResponse {
  message: string;
  user: User;
  stats: UserStats;
}