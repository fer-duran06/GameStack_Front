'use client';

import { useEffect, useState, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { rankingsService } from '@/services/rankings.service';
import { gamesService } from '@/services/games.service';
import { RankingEntry } from '@/types/ranking.types';
import { Game } from '@/types/game.types';
import { Calendar, BarChart2, Medal, Search, X } from 'lucide-react';

const medal = (pos: number) => {
  if (pos === 1) return <Medal size={16} color="#FCD34D" />;
  if (pos === 2) return <Medal size={16} color="#9CA3AF" />;
  if (pos === 3) return <Medal size={16} color="#D97706" />;
  return <span style={{ fontSize: '14px', fontWeight: '800', color: '#8892A4' }}>#{pos}</span>;
};

const posColor = (pos: number) =>
  pos === 1 ? '#FCD34D' : pos === 2 ? '#9CA3AF' : pos === 3 ? '#D97706' : '#8892A4';

export default function RankingsPage() {
  const [leaderboard, setLeaderboard]   = useState<RankingEntry[]>([]);
  const [loading, setLoading]           = useState(false);
  const [period, setPeriod]             = useState<'quincenal' | 'mensual'>('quincenal');
  const [error, setError]               = useState('');

  // Todos los juegos de la plataforma
  const [allGames, setAllGames]         = useState<Game[]>([]);

  // Juego seleccionado
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Buscador
  const [query, setQuery]               = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar todos los juegos al montar
  useEffect(() => {
    gamesService.getAll()
      .then((res) => {
        setAllGames(res.games || []);
        // Seleccionar el primero automáticamente
        if (res.games?.length > 0) {
          setSelectedGame(res.games[0]);
          setQuery(res.games[0].name);
        }
      })
      .catch(() => {
        // Si el endpoint no existe, fallback a localStorage
        try {
          const saved = localStorage.getItem('gamecenter_registered_games');
          if (saved) {
            const local = JSON.parse(saved) as { id: number; name: string; image_url: string }[];
            const mapped: Game[] = local.map((g) => ({
              id: g.id, name: g.name, image_url: g.image_url,
              rawg_id: 0, created_by: 0, created_at: '',
            }));
            setAllGames(mapped);
            if (mapped.length > 0) {
              setSelectedGame(mapped[0]);
              setQuery(mapped[0].name);
            }
          }
        } catch { /* ignore */ }
      });
  }, []);

  // Cargar ranking cuando cambia juego o periodo
  useEffect(() => {
    if (!selectedGame) return;
    fetchRankings(selectedGame.id, period);
  }, [selectedGame, period]);

  const fetchRankings = async (gameId: number, p: 'quincenal' | 'mensual') => {
    setLoading(true);
    setError('');
    try {
      const res = await rankingsService.get(gameId, p);
      setLeaderboard(res.leaderboard);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar rankings');
      setLeaderboard([]);
    } finally { setLoading(false); }
  };

  // Filtrar sugerencias
  const suggestions = allGames.filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setQuery(game.name);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedGame(null);
    setLeaderboard([]);
    setError('');
    inputRef.current?.focus();
  };

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
            {selectedGame ? ` — ${selectedGame.name}` : ''}
          </p>
        </div>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Filtro periodo */}
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

        {/* Buscador de juego */}
        <div ref={containerRef} style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '360px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#161B2E', border: '1.5px solid #1E2540',
            borderRadius: '8px', padding: '7px 12px',
          }}>
            <Search size={14} color="#8892A4" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
                if (!e.target.value) setSelectedGame(null);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Buscar juego..."
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: '#E2E8F0', fontSize: '13px', outline: 'none',
              }}
            />
            {query && (
              <button onClick={handleClear} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <X size={14} color="#8892A4" />
              </button>
            )}
          </div>

          {/* Sugerencias */}
          {showSuggestions && query && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              backgroundColor: '#161B2E', border: '1px solid #1E2540',
              borderRadius: '8px', overflow: 'hidden', zIndex: 100,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              {suggestions.slice(0, 8).map((game) => (
                <button
                  key={game.id}
                  onClick={() => handleSelectGame(game)}
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: 'none', border: 'none',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    cursor: 'pointer', textAlign: 'left',
                    borderBottom: '1px solid #1E254033',
                    backgroundColor: selectedGame?.id === game.id ? '#7C3AED22' : 'transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7C3AED22')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedGame?.id === game.id ? '#7C3AED22' : 'transparent')}
                >
                  {game.image_url ? (
                    <img
                      src={game.image_url}
                      alt={game.name}
                      style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#7C3AED44', flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: selectedGame?.id === game.id ? '600' : '400' }}>
                    {game.name}
                  </span>
                </button>
              ))}
              {suggestions.length === 0 && (
                <p style={{ padding: '12px 14px', fontSize: '13px', color: '#8892A4', margin: 0 }}>
                  No se encontraron juegos
                </p>
              )}
            </div>
          )}

          {/* Sin resultados */}
          {showSuggestions && query && suggestions.length === 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              backgroundColor: '#161B2E', border: '1px solid #1E2540',
              borderRadius: '8px', padding: '12px 14px', zIndex: 100,
            }}>
              <p style={{ fontSize: '13px', color: '#8892A4', margin: 0 }}>No se encontraron juegos</p>
            </div>
          )}
        </div>
      </div>

      {/* Aviso si no hay juegos en la plataforma */}
      {allGames.length === 0 && (
        <div style={{ backgroundColor: '#FCD34D11', border: '1px solid #FCD34D33', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', fontSize: '13px', color: '#FCD34D' }}>
          No hay juegos registrados en la plataforma aún. Ve a{' '}
          <a href="/juegos" style={{ color: '#A78BFA', textDecoration: 'underline' }}>Juegos</a>{' '}
          para registrar el primero.
        </div>
      )}

      {/* Tabla */}
      <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '70px 1fr 120px 100px 80px',
          padding: '12px 20px', backgroundColor: '#161B2E',
          fontSize: '11px', fontWeight: '600', color: '#8892A4',
        }}>
          <span>Posición</span><span>Jugador</span><span>Puntos</span><span>V / D</span><span>Partidas</span>
        </div>

        {!selectedGame && !loading && (
          <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px', fontSize: '13px' }}>
            Busca un juego para ver su ranking
          </p>
        )}

        {loading && (
          <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>Cargando...</p>
        )}

        {error && (
          <p style={{ color: '#F87171', textAlign: 'center', padding: '32px', fontSize: '13px' }}>{error}</p>
        )}

        {!loading && !error && selectedGame && leaderboard.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8892A4' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <BarChart2 size={36} color="#4B5563" />
            </div>
            <p>No hay datos de ranking para <strong style={{ color: '#E2E8F0' }}>{selectedGame.name}</strong> en este período</p>
          </div>
        )}

        {leaderboard.map((entry, i) => (
          <div
            key={i}
            style={{
              display: 'grid', gridTemplateColumns: '70px 1fr 120px 100px 80px',
              padding: '14px 20px', borderTop: '1px solid #1E2540',
              alignItems: 'center',
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