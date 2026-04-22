'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { matchesService } from '@/services/matches.service';
import { AlertTriangle, Swords } from 'lucide-react';

interface RegisteredGame { id: number; name: string; image_url: string; }

const inp: React.CSSProperties = { width: '100%', backgroundColor: '#161B2E', border: '1.5px solid #1E2540', borderRadius: '8px', padding: '10px 14px', color: '#E2E8F0', fontSize: '13px' };
const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#E2E8F0', marginBottom: '6px' };

export default function NuevaPartidaPage() {
  const router = useRouter();
  const [games, setGames]     = useState<RegisteredGame[]>([]);
  const [form, setForm]       = useState({ game_id: '', title: '', description: '', max_players: '2', scheduled_at: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const saved = localStorage.getItem('gamecenter_registered_games');
    if (saved) { try { setGames(JSON.parse(saved)); } catch { /* ignore */ } }
  }, []);

  const handleSubmit = async () => {
    if (!form.game_id || !form.title) { setError('Selecciona un juego y escribe un título'); return; }
    setLoading(true); setError('');
    try {
      await matchesService.create({
        game_id: parseInt(form.game_id), title: form.title,
        description: form.description || undefined,
        max_players: parseInt(form.max_players),
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : undefined,
      });
      router.push('/partidas');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear partida');
    } finally { setLoading(false); }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Crear nueva partida</h1>
          <p style={{ fontSize: '14px', color: '#8892A4' }}>Publica una partida para que otros jugadores se unan</p>
        </div>
        <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Selector de juego */}
          <div>
            <label style={lbl}>Juego *</label>
            {games.length === 0 ? (
              <div style={{ backgroundColor: '#161B2E', border: '1.5px solid #FCD34D44', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#FCD34D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={14} /> No tienes juegos registrados. Ve a{' '}
                <span onClick={() => router.push('/juegos')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Juegos</span>
                {' '}y registra uno primero.
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

          <div><label style={lbl}>Título *</label><input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ej: Ranked 5v5 Diamante+" style={inp} /></div>
          <div><label style={lbl}>Descripción</label><textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Reglas, requisitos o cualquier detalle..." style={{ ...inp, resize: 'vertical' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label style={lbl}>Máximo de jugadores</label><input value={form.max_players} onChange={(e) => set('max_players', e.target.value)} type="number" min="2" style={inp} /></div>
            <div><label style={lbl}>Fecha y hora programada</label><input value={form.scheduled_at} onChange={(e) => set('scheduled_at', e.target.value)} type="datetime-local" style={inp} /></div>
          </div>

          {error && <p style={{ fontSize: '12px', color: '#F87171' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => router.back()} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #1E2540', borderRadius: '8px', color: '#8892A4', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleSubmit} disabled={loading || games.length === 0} style={{ padding: '10px 20px', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: games.length === 0 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading ? 'Creando...' : <><Swords size={14} /> Crear partida</>}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}