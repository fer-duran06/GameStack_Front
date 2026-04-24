'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { tournamentsService } from '@/services/tournaments.service';
import { TournamentType } from '@/types/tournament.types';
import { AlertTriangle, Trophy } from 'lucide-react';

interface RegisteredGame { id: number; name: string; image_url: string; }

type FormErrors = {
  game_id?: string;
  name?: string;
  max_participants?: string;
  start_date?: string;
  end_date?: string;
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

const getNowLocal = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export default function NuevoTorneoPage() {
  const router = useRouter();
  const [games, setGames]     = useState<RegisteredGame[]>([]);
  const [form, setForm]       = useState({
    game_id: '',
    name: '',
    description: '',
    type: 'single' as TournamentType,
    max_participants: '8',
    rules: '',
    start_date: '',
    end_date: '',
  });
  const [errors, setErrors]     = useState<FormErrors>({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
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

    if (!form.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (form.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    const maxP = parseInt(form.max_participants);
    if (!form.max_participants || isNaN(maxP)) {
      newErrors.max_participants = 'Ingresa un número válido';
    } else if (maxP < 4) {
      newErrors.max_participants = 'Mínimo 4 participantes';
    } else if (maxP > 256) {
      newErrors.max_participants = 'Máximo 256 participantes';
    }

    if (!form.start_date) {
      newErrors.start_date = 'La fecha de inicio es obligatoria';
    } else {
      const startDate = new Date(form.start_date);
      if (startDate <= now) {
        newErrors.start_date = 'La fecha de inicio debe ser futura';
      }
    }

    if (form.end_date) {
      const endDate   = new Date(form.end_date);
      const startDate = new Date(form.start_date);
      if (endDate <= new Date()) {
        newErrors.end_date = 'La fecha de fin debe ser futura';
      } else if (form.start_date && endDate <= startDate) {
        newErrors.end_date = 'La fecha de fin debe ser posterior a la de inicio';
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
      await tournamentsService.create({
        game_id: parseInt(form.game_id),
        name: form.name.trim(),
        description: form.description || undefined,
        type: form.type,
        max_participants: parseInt(form.max_participants),
        rules: form.rules || undefined,
        start_date: new Date(form.start_date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
      });
      router.push('/torneos');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error al crear torneo');
    } finally { setLoading(false); }
  };

  const minDate = getNowLocal();

  return (
    <MainLayout>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Crear nuevo torneo</h1>
          <p style={{ fontSize: '14px', color: '#8892A4' }}>Organiza una competencia para la comunidad</p>
        </div>

        <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Juego + nombre */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={lbl}>Juego *</label>
              {games.length === 0 ? (
                <div style={{ backgroundColor: '#161B2E', border: '1.5px solid #FCD34D44', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#FCD34D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={13} /> Sin juegos.{' '}
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

            <div>
              <label style={lbl}>Nombre del torneo *</label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ej: Copa LatAm 2026"
                style={errors.name ? errorInp : baseInp}
              />
              {errors.name && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.name}</p>}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label style={lbl}>Descripción <span style={{ fontWeight: '400', color: '#8892A4' }}>(opcional)</span></label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              placeholder="Describe el torneo..."
              style={{ ...baseInp, resize: 'vertical' }}
            />
          </div>

          {/* Formato + participantes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={lbl}>Formato *</label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
                style={baseInp}
              >
                <option value="single">Eliminación simple</option>
                <option value="double">Doble eliminación</option>
                <option value="round_robin">Round Robin</option>
              </select>
            </div>

            <div>
              <label style={lbl}>Máx. participantes *</label>
              <input
                value={form.max_participants}
                onChange={(e) => set('max_participants', e.target.value)}
                type="number"
                min="4"
                max="256"
                style={errors.max_participants ? errorInp : baseInp}
              />
              {errors.max_participants && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.max_participants}</p>}
            </div>
          </div>

          {/* Fechas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={lbl}>Fecha de inicio *</label>
              <input
                value={form.start_date}
                onChange={(e) => set('start_date', e.target.value)}
                type="datetime-local"
                min={minDate}
                style={errors.start_date ? errorInp : baseInp}
              />
              {errors.start_date && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.start_date}</p>}
            </div>

            <div>
              <label style={lbl}>
                Fecha de fin <span style={{ fontWeight: '400', color: '#8892A4' }}>(opcional — debe ser posterior al inicio)</span>
              </label>
              <input
                value={form.end_date}
                onChange={(e) => set('end_date', e.target.value)}
                type="datetime-local"
                min={form.start_date || minDate}
                style={errors.end_date ? errorInp : baseInp}
              />
              {errors.end_date && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.end_date}</p>}
            </div>
          </div>

          {/* Reglas */}
          <div>
            <label style={lbl}>Reglas <span style={{ fontWeight: '400', color: '#8892A4' }}>(opcional)</span></label>
            <textarea
              value={form.rules}
              onChange={(e) => set('rules', e.target.value)}
              rows={3}
              placeholder="Escribe las reglas del torneo..."
              style={{ ...baseInp, resize: 'vertical' }}
            />
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
              {loading ? 'Creando...' : <><Trophy size={14} /> Crear torneo</>}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}