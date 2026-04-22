'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { rankingsService } from '@/services/rankings.service';
import { RankingEntry } from '@/types/ranking.types';
import { Calendar, BarChart2, Medal } from 'lucide-react';

const medal = (pos: number) => {
  if (pos === 1) return <Medal size={16} color="#FCD34D" />;
  if (pos === 2) return <Medal size={16} color="#9CA3AF" />;
  if (pos === 3) return <Medal size={16} color="#D97706" />;
  return <span style={{ fontSize: '14px', fontWeight: '800', color: '#8892A4' }}>#{pos}</span>;
};

export default function RankingsPage() {
  const [leaderboard, setLeaderboard] = useState<RankingEntry[]>([]);
  const [loading, setLoading]         = useState(false);
  const [period, setPeriod]           = useState<'quincenal' | 'mensual'>('quincenal');
  const [gameId, setGameId]           = useState('1');
  const [error, setError]             = useState('');

  const fetchRankings = async () => {
    const id = parseInt(gameId);
    if (!id) return;
    setLoading(true); setError('');
    try {
      const res = await rankingsService.get(id, period);
      setLeaderboard(res.leaderboard);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar rankings');
      setLeaderboard([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRankings(); }, [period, gameId]);

  const posColor = (pos: number) => pos === 1 ? '#FCD34D' : pos === 2 ? '#9CA3AF' : pos === 3 ? '#D97706' : '#8892A4';

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
            Ranking {period === 'quincenal' ? 'Quincenal' : 'Mensual'} — Game ID: {gameId}
          </p>
        </div>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['quincenal', 'mensual'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${period === p ? '#7C3AED' : '#1E2540'}`, backgroundColor: period === p ? '#7C3AED' : 'transparent', color: period === p ? '#FFFFFF' : '#8892A4', fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize' }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', color: '#8892A4' }}>Game ID:</label>
          <input value={gameId} onChange={(e) => setGameId(e.target.value)} type="number" min="1"
            style={{ width: '70px', backgroundColor: '#161B2E', border: '1px solid #1E2540', borderRadius: '8px', padding: '7px 10px', color: '#E2E8F0', fontSize: '12px' }} />
          <button onClick={fetchRankings} style={{ padding: '7px 14px', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '12px', cursor: 'pointer' }}>Cargar</button>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 120px 100px 80px', padding: '12px 20px', backgroundColor: '#161B2E', fontSize: '11px', fontWeight: '600', color: '#8892A4' }}>
          <span>Posición</span><span>Jugador</span><span>Puntos</span><span>V / D</span><span>Partidas</span>
        </div>

        {loading && <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>Cargando...</p>}
        {error   && <p style={{ color: '#F87171', textAlign: 'center', padding: '32px', fontSize: '13px' }}>{error}</p>}

        {!loading && !error && leaderboard.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8892A4' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}><BarChart2 size={36} color="#4B5563" /></div>
            <p>No hay datos de ranking para este juego y período</p>
          </div>
        )}

        {leaderboard.map((entry, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 120px 100px 80px', padding: '14px 20px', borderTop: '1px solid #1E2540', alignItems: 'center', backgroundColor: entry.live_position <= 3 ? '#7C3AED08' : 'transparent' }}>
            <span style={{ fontWeight: '800', color: posColor(entry.live_position), fontSize: '14px', display: 'flex', alignItems: 'center' }}>{medal(entry.live_position)}</span>
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