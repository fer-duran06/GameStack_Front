'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { matchesService } from '@/services/matches.service';
import { AlertTriangle, Swords } from 'lucide-react';

interface RegisteredGame { id: number; name: string; image_url: string; }

type FormErrors = {
  game_id?: string;
  title?: string;
  max_players?: string;
  scheduled_at?: string;
};

const baseInp: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#161B2E',
  border: '1.5px solid #1E2540',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#E2E8F0',
  fontSize: '13px',
};

const errorInp: React.CSSProperties = {
  ...baseInp,
  border: '1.5px solid #F87171',
};

const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#E2E8F0',
  marginBottom: '6px',
};

// Mínimo datetime-local: ahora mismo
const getNowLocal = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export default function NuevaPartidaPage() {
  const router = useRouter();
  const [games, setGames]     = useState<RegisteredGame[]>([]);
  const [form, setForm]       = useState({
    game_id: '',
    title: '',
    description: '',
    max_players: '2',
    scheduled_at: '',
  });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    // limpiar error del campo al editar
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  useEffect(() => {
    const saved = localStorage.getItem('gamecenter_registered_games');
    if (saved) { try { setGames(JSON.parse(saved)); } catch { /* ignore */ } }
  }, []);

  /* ── Validación ── */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const now = new Date();

    if (!form.game_id) {
      newErrors.game_id = 'Selecciona un juego';
    }

    if (!form.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (form.title.trim().length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres';
    }

    const maxP = parseInt(form.max_players);
    if (!form.max_players || isNaN(maxP)) {
      newErrors.max_players = 'Ingresa un número válido';
    } else if (maxP < 2) {
      newErrors.max_players = 'Mínimo 2 jugadores';
    } else if (maxP > 100) {
      newErrors.max_players = 'Máximo 100 jugadores';
    }

    if (form.scheduled_at) {
      const fecha = new Date(form.scheduled_at);
      if (fecha <= now) {
        newErrors.scheduled_at = 'La fecha debe ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await matchesService.create({
        game_id: parseInt(form.game_id),
        title: form.title.trim(),
        description: form.description || undefined,
        max_players: parseInt(form.max_players),
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : undefined,
      });
      router.push('/partidas');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error al crear partida');
    } finally { setLoading(false); }
  };

  const minDate = getNowLocal();

  return (
    <MainLayout>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Crear nueva partida</h1>
          <p style={{ fontSize: '14px', color: '#8892A4' }}>Publica una partida para que otros jugadores se unan</p>
        </div>

        <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Juego */}
          <div>
            <label style={lbl}>Juego *</label>
            {games.length === 0 ? (
              <div style={{ backgroundColor: '#161B2E', border: '1.5px solid #FCD34D44', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#FCD34D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={14} /> No tienes juegos registrados.{' '}
                <span onClick={() => router.push('/juegos')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Ve a Juegos</span> primero.
              </div>
            ) : (
              <>
                <select
                  value={form.game_id}
                  onChange={(e) => set('game_id', e.target.value)}
                  style={errors.game_id ? errorInp : baseInp}
                >
                  <option value="">Selecciona un juego...</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                {errors.game_id && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.game_id}</p>}
              </>
            )}
          </div>

          {/* Título */}
          <div>
            <label style={lbl}>Título *</label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Ej: Ranked 5v5 Diamante+"
              style={errors.title ? errorInp : baseInp}
            />
            {errors.title && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.title}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label style={lbl}>Descripción <span style={{ fontWeight: '400', color: '#8892A4' }}>(opcional)</span></label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Reglas, requisitos o cualquier detalle..."
              style={{ ...baseInp, resize: 'vertical' }}
            />
          </div>

          {/* Máx. jugadores + fecha */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={lbl}>Máximo de jugadores *</label>
              <input
                value={form.max_players}
                onChange={(e) => set('max_players', e.target.value)}
                type="number"
                min="2"
                max="100"
                style={errors.max_players ? errorInp : baseInp}
              />
              {errors.max_players && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.max_players}</p>}
            </div>

            <div>
              <label style={lbl}>
                Fecha y hora programada <span style={{ fontWeight: '400', color: '#8892A4' }}>(opcional)</span>
              </label>
              <input
                value={form.scheduled_at}
                onChange={(e) => set('scheduled_at', e.target.value)}
                type="datetime-local"
                min={minDate}
                style={errors.scheduled_at ? errorInp : baseInp}
              />
              {errors.scheduled_at && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.scheduled_at}</p>}
            </div>
          </div>

          {/* Error API */}
          {apiError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8717122', border: '1px solid #F8717144', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#F87171' }}>
              <AlertTriangle size={14} /> {apiError}
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => router.back()}
              style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #1E2540', borderRadius: '8px', color: '#8892A4', fontSize: '13px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || games.length === 0}
              style={{
                padding: '10px 20px', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px',
                color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                opacity: games.length === 0 ? 0.5 : 1,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {loading ? 'Creando...' : <><Swords size={14} /> Crear partida</>}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}