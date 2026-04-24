'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { rankingsService } from '@/services/rankings.service';
import { gamesService } from '@/services/games.service';
import { RankingEntry } from '@/types/ranking.types';
import { Calendar, BarChart2, Medal, Search, X, Gamepad2 } from 'lucide-react';

interface LocalGame { id: number; name: string; image_url: string; }
interface Suggestion { name: string; image_url: string; game_id: number | null; }

const LAST_GAME_KEY = 'gamecenter_rankings_last_game';

const medal = (pos: number) => {
  if (pos === 1) return <Medal size={16} color="#FCD34D" />;
  if (pos === 2) return <Medal size={16} color="#9CA3AF" />;
  if (pos === 3) return <Medal size={16} color="#D97706" />;
  return <span style={{ fontSize: '14px', fontWeight: '800', color: '#8892A4' }}>#{pos}</span>;
};
const posColor = (pos: number) =>
  pos === 1 ? '#FCD34D' : pos === 2 ? '#9CA3AF' : pos === 3 ? '#D97706' : '#8892A4';

export default function RankingsPage() {
  const [leaderboard, setLeaderboard]     = useState<RankingEntry[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [period, setPeriod]               = useState<'quincenal' | 'mensual'>('quincenal');
  const [rankingError, setRankingError]   = useState('');

  // Juego seleccionado
  const [selectedName, setSelectedName]   = useState('');
  const [selectedId, setSelectedId]       = useState<number | null>(null);

  // Buscador
  const [query, setQuery]                 = useState('');
  const [suggestions, setSuggestions]     = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Juegos del usuario en localStorage (para mapear nombre → id)
  const [localGames, setLocalGames]       = useState<LocalGame[]>([]);

  const inputRef    = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar juegos locales y último juego seleccionado al montar
  useEffect(() => {
    const saved = localStorage.getItem('gamecenter_registered_games');
    const local: LocalGame[] = saved ? JSON.parse(saved) : [];
    setLocalGames(local);

    // Restaurar último juego seleccionado
    const last = localStorage.getItem(LAST_GAME_KEY);
    if (last) {
      try {
        const { name, id } = JSON.parse(last);
        setSelectedName(name);
        setSelectedId(id);
        setQuery(name);
      } catch { /* ignore */ }
    }
  }, []);

  // Cargar ranking cuando cambia el juego seleccionado o el periodo
  useEffect(() => {
    if (!selectedId) return;
    fetchRankings(selectedId, period);
  }, [selectedId, period]);

  const fetchRankings = async (gameId: number, p: 'quincenal' | 'mensual') => {
    setLoadingRanking(true);
    setRankingError('');
    try {
      const res = await rankingsService.get(gameId, p);
      setLeaderboard(res.leaderboard);
    } catch (err: unknown) {
      setRankingError(err instanceof Error ? err.message : 'Error al cargar rankings');
      setLeaderboard([]);
    } finally { setLoadingRanking(false); }
  };

  // Buscar sugerencias: primero en localStorage, luego en RAWG si el back lo permite
  const searchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); return; }

    setLoadingSuggestions(true);

    // 1. Filtrar juegos locales del usuario
    const localMatches: Suggestion[] = localGames
      .filter((g) => g.name.toLowerCase().includes(q.toLowerCase()))
      .map((g) => ({ name: g.name, image_url: g.image_url, game_id: g.id }));

    // 2. Intentar buscar en la plataforma (GET /api/v1/games)
    let platformGames: LocalGame[] = [];
    try {
      const res = await gamesService.getAll();
      platformGames = (res.games || []).map((g) => ({
        id: g.id, name: g.name, image_url: g.image_url || '',
      }));
    } catch { /* endpoint no existe, solo usar locales */ }

    const platformMatches: Suggestion[] = platformGames
      .filter((g) => g.name.toLowerCase().includes(q.toLowerCase()))
      .map((g) => ({ name: g.name, image_url: g.image_url, game_id: g.id }));

    // 3. Si no hay resultados de plataforma, buscar en RAWG (solo como sugerencia visual)
    let rawgMatches: Suggestion[] = [];
    if (platformMatches.length === 0 && localMatches.length === 0) {
      try {
        const res = await gamesService.search(q);
        rawgMatches = (res.results || []).slice(0, 5).map((r) => {
          // Intentar encontrar si ya está registrado localmente
          const local = localGames.find((l) => l.name.toLowerCase() === r.name.toLowerCase());
          return { name: r.name, image_url: r.image_url, game_id: local?.id ?? null };
        });
      } catch { /* ignore */ }
    }

    // Combinar y deduplicar por nombre
    const all = [...platformMatches, ...localMatches, ...rawgMatches];
    const seen = new Set<string>();
    const deduped = all.filter((s) => {
      const key = s.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setSuggestions(deduped.slice(0, 8));
    setLoadingSuggestions(false);
  }, [localGames]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setShowSuggestions(true);
    if (!val) {
      setSelectedName('');
      setSelectedId(null);
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchSuggestions(val), 300);
  };

  const handleSelect = (s: Suggestion) => {
    setQuery(s.name);
    setSelectedName(s.name);
    setShowSuggestions(false);

    if (s.game_id) {
      setSelectedId(s.game_id);
      localStorage.setItem(LAST_GAME_KEY, JSON.stringify({ name: s.name, id: s.game_id }));
    } else {
      // El juego existe en RAWG pero no está registrado en la plataforma
      setSelectedId(null);
      setLeaderboard([]);
      setRankingError(`"${s.name}" no está registrado en la plataforma. Ve a Juegos para registrarlo primero.`);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedName('');
    setSelectedId(null);
    setSuggestions([]);
    setLeaderboard([]);
    setRankingError('');
    localStorage.removeItem(LAST_GAME_KEY);
    inputRef.current?.focus();
  };

  // Cerrar sugerencias al clicar fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <MainLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Rankings</h1>
        <p style={{ fontSize: '14px', color: '#8892A4' }}>Compite y escala posiciones</p>
      </div>

      {/* Banner periodo */}
      <div style={{ backgroundColor: '#7C3AED22', border: '1px solid #7C3AED44', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Calendar size={18} color="#A78BFA" />
        <div>
          <p style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Período Actual</p>
          <p style={{ fontSize: '12px', color: '#A78BFA', margin: '2px 0 0' }}>
            Ranking {period === 'quincenal' ? 'Quincenal' : 'Mensual'}
            {selectedName ? ` — ${selectedName}` : ''}
          </p>
        </div>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Periodo */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '2px' }}>
          {(['quincenal', 'mensual'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '7px 16px', borderRadius: '20px',
                border: `1px solid ${period === p ? '#7C3AED' : '#1E2540'}`,
                backgroundColor: period === p ? '#7C3AED' : 'transparent',
                color: period === p ? '#FFFFFF' : '#8892A4',
                fontSize: '12px', cursor: 'pointer',
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div ref={containerRef} style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '400px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#161B2E', border: '1.5px solid #1E2540',
            borderRadius: '8px', padding: '7px 12px',
          }}>
            {loadingSuggestions
              ? <div style={{ width: '14px', height: '14px', border: '2px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
              : <Search size={14} color="#8892A4" style={{ flexShrink: 0 }} />
            }
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => { if (query.length >= 2) setShowSuggestions(true); }}
              placeholder="Buscar juego por nombre..."
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#E2E8F0', fontSize: '13px', outline: 'none' }}
            />
            {query && (
              <button onClick={handleClear} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={14} color="#8892A4" />
              </button>
            )}
          </div>

          {/* Dropdown sugerencias */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              backgroundColor: '#161B2E', border: '1px solid #1E2540',
              borderRadius: '8px', overflow: 'hidden', zIndex: 100,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(s)}
                  style={{
                    width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    cursor: 'pointer', textAlign: 'left',
                    borderBottom: i < suggestions.length - 1 ? '1px solid #1E254033' : 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7C3AED22')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.name} style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#7C3AED44', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Gamepad2 size={14} color="#A78BFA" />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', color: '#E2E8F0', margin: 0, fontWeight: '500' }}>{s.name}</p>
                    {!s.game_id && (
                      <p style={{ fontSize: '10px', color: '#FCD34D', margin: '2px 0 0' }}>No registrado en la plataforma</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {showSuggestions && query.length >= 2 && suggestions.length === 0 && !loadingSuggestions && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, backgroundColor: '#161B2E', border: '1px solid #1E2540', borderRadius: '8px', padding: '12px 14px', zIndex: 100 }}>
              <p style={{ fontSize: '13px', color: '#8892A4', margin: 0 }}>No se encontraron juegos para "{query}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Spinner CSS */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Tabla */}
      <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 120px 100px 80px', padding: '12px 20px', backgroundColor: '#161B2E', fontSize: '11px', fontWeight: '600', color: '#8892A4' }}>
          <span>Posición</span><span>Jugador</span><span>Puntos</span><span>V / D</span><span>Partidas</span>
        </div>

        {!selectedId && !loadingRanking && !rankingError && (
          <p style={{ color: '#8892A4', textAlign: 'center', padding: '40px', fontSize: '13px' }}>
            Escribe el nombre de un juego para ver su ranking
          </p>
        )}

        {loadingRanking && (
          <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>Cargando ranking...</p>
        )}

        {rankingError && (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ color: '#F87171', fontSize: '13px', marginBottom: rankingError.includes('registrado') ? '12px' : '0' }}>{rankingError}</p>
            {rankingError.includes('registrado') && (
              <a href="/juegos" style={{ fontSize: '12px', color: '#A78BFA' }}>Ir a Juegos →</a>
            )}
          </div>
        )}

        {!loadingRanking && !rankingError && selectedId && leaderboard.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8892A4' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}><BarChart2 size={36} color="#4B5563" /></div>
            <p>No hay datos de ranking para <strong style={{ color: '#E2E8F0' }}>{selectedName}</strong> en este período</p>
          </div>
        )}

        {!loadingRanking && leaderboard.map((entry, i) => (
          <div
            key={i}
            style={{
              display: 'grid', gridTemplateColumns: '70px 1fr 120px 100px 80px',
              padding: '14px 20px', borderTop: '1px solid #1E2540', alignItems: 'center',
              backgroundColor: entry.live_position <= 3 ? '#7C3AED08' : 'transparent',
            }}
          >
            <span style={{ fontWeight: '800', color: posColor(entry.live_position), fontSize: '14px', display: 'flex', alignItems: 'center' }}>
              {medal(entry.live_position)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#FFFFFF' }}>
                {entry.player_name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>{entry.player_name}</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#A78BFA' }}>{entry.total_score}</span>
            <span style={{ fontSize: '12px', color: '#4ADE80', fontWeight: '600' }}>{entry.wins} / {entry.matches_played - entry.wins}</span>
            <span style={{ fontSize: '12px', color: '#8892A4' }}>{entry.matches_played}</span>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}