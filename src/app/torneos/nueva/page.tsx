'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { tournamentsService } from '@/services/tournaments.service';
import { TournamentType } from '@/types/tournament.types';

interface RegisteredGame { id: number; name: string; image_url: string; }

const inp: React.CSSProperties = { width: '100%', backgroundColor: '#161B2E', border: '1.5px solid #1E2540', borderRadius: '8px', padding: '10px 14px', color: '#E2E8F0', fontSize: '13px' };
const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#E2E8F0', marginBottom: '6px' };

export default function NuevoTorneoPage() {
  const router = useRouter();
  const [games, setGames]     = useState<RegisteredGame[]>([]);
  const [form, setForm]       = useState({ game_id: '', name: '', description: '', type: 'single' as TournamentType, max_participants: '8', rules: '', start_date: '', end_date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const saved = localStorage.getItem('gamecenter_registered_games');
    if (saved) { try { setGames(JSON.parse(saved)); } catch { /* ignore */ } }
  }, []);

  const handleSubmit = async () => {
    if (!form.game_id || !form.name || !form.start_date) { setError('Selecciona un juego, nombre y fecha de inicio son obligatorios'); return; }
    setLoading(true); setError('');
    try {
      const res = await tournamentsService.create({
        game_id: parseInt(form.game_id), name: form.name,
        description: form.description || undefined, type: form.type,
        max_participants: parseInt(form.max_participants),
        rules: form.rules || undefined,
        start_date: new Date(form.start_date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
      });

      const saved = localStorage.getItem('gamecenter_my_tournaments');
      const existing = saved ? JSON.parse(saved) : [];
      const selectedGame = games.find((g) => g.id === parseInt(form.game_id));
      localStorage.setItem('gamecenter_my_tournaments', JSON.stringify([...existing, {
        id: res.tournament.id, name: form.name, game_id: parseInt(form.game_id),
        game_name: selectedGame?.name || '', type: form.type, status: 'registration',
        max_participants: parseInt(form.max_participants), start_date: form.start_date,
        end_date: form.end_date || undefined, description: form.description || undefined,
      }]));

      router.push('/torneos');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear torneo');
    } finally { setLoading(false); }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Crear nuevo torneo</h1>
          <p style={{ fontSize: '14px', color: '#8892A4' }}>Organiza una competencia para la comunidad</p>
        </div>
        <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Selector de juego */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={lbl}>Juego *</label>
              {games.length === 0 ? (
                <div style={{ backgroundColor: '#161B2E', border: '1.5px solid #FCD34D44', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#FCD34D' }}>
                  ⚠️ Sin juegos. Ve a{' '}
                  <span onClick={() => router.push('/juegos')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Juegos</span> primero.
                </div>
              ) : (
                <select value={form.game_id} onChange={(e) => set('game_id', e.target.value)} style={inp}>
                  <option value="">Selecciona un juego...</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div><label style={lbl}>Nombre del torneo *</label><input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej: Copa LatAm 2026" style={inp} /></div>
          </div>

          <div><label style={lbl}>Descripción</label><textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} placeholder="Describe el torneo..." style={{ ...inp, resize: 'vertical' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={lbl}>Formato *</label>
              <select value={form.type} onChange={(e) => set('type', e.target.value)} style={inp}>
                <option value="single">Eliminación simple</option>
                <option value="double">Doble eliminación</option>
                <option value="round_robin">Round Robin</option>
              </select>
            </div>
            <div><label style={lbl}>Máx. participantes</label><input value={form.max_participants} onChange={(e) => set('max_participants', e.target.value)} type="number" min="4" style={inp} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label style={lbl}>Fecha inicio *</label><input value={form.start_date} onChange={(e) => set('start_date', e.target.value)} type="datetime-local" style={inp} /></div>
            <div><label style={lbl}>Fecha fin <span style={{ fontSize: '11px', color: '#8892A4', fontWeight: '400' }}>(posterior al inicio)</span></label><input value={form.end_date} onChange={(e) => set('end_date', e.target.value)} type="datetime-local" style={inp} /></div>
          </div>
          <div><label style={lbl}>Reglas</label><textarea value={form.rules} onChange={(e) => set('rules', e.target.value)} rows={3} placeholder="Escribe las reglas del torneo..." style={{ ...inp, resize: 'vertical' }} /></div>

          {error && <p style={{ fontSize: '12px', color: '#F87171' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => router.back()} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #1E2540', borderRadius: '8px', color: '#8892A4', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleSubmit} disabled={loading || games.length === 0} style={{ padding: '10px 20px', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: games.length === 0 ? 0.5 : 1 }}>
              {loading ? 'Creando...' : '🏆 Crear torneo'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}