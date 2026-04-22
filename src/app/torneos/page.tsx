'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Trophy, Calendar, Users, Globe, ClipboardList, X, AlertTriangle, Check } from 'lucide-react';
import { tournamentsService } from '@/services/tournaments.service';
import { Tournament } from '@/types/tournament.types';

const TYPE_LABEL: Record<string, string> = {
  single: 'Eliminación simple',
  double: 'Doble eliminación',
  round_robin: 'Round Robin',
};

const STATUS_LABEL: Record<string, string> = {
  registration: 'Inscripción abierta',
  active: 'En vivo',
  finished: 'Finalizado',
};

const STATUS_COLOR: Record<string, string> = {
  registration: '#4ADE80',
  active: '#FCD34D',
  finished: '#9CA3AF',
};

export default function TorneosPage() {
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
  const [communityTournaments, setCommunityTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMy, setLoadingMy] = useState(true);

  // Modal de info
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Estado de inscripción por torneo
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());
  const [joinError, setJoinError] = useState<string>('');

  useEffect(() => {
    tournamentsService.getMy()
      .then((res) => setMyTournaments(res.tournaments))
      .catch(() => {})
      .finally(() => setLoadingMy(false));

    tournamentsService.getAll()
      .then((res) => setCommunityTournaments(res.tournaments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (tournamentId: number) => {
    if (joiningId === tournamentId) return;
    setJoiningId(tournamentId);
    setJoinError('');
    try {
      await tournamentsService.join(tournamentId);
      setJoinedIds((prev) => new Set([...prev, tournamentId]));
      // Actualizar contador de participantes
      setCommunityTournaments((prev) =>
        prev.map((t) =>
          t.id === tournamentId
            ? { ...t, current_participants: (t.current_participants || 0) + 1 }
            : t
        )
      );
      setSelectedTournament((prev) =>
        prev?.id === tournamentId
          ? { ...prev, current_participants: (prev.current_participants || 0) + 1 }
          : prev
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al inscribirse';
      setJoinError(msg);
    } finally {
      setJoiningId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

  const openInfo = (t: Tournament) => {
    setSelectedTournament(t);
    setJoinError('');
  };

  const closeInfo = () => {
    setSelectedTournament(null);
    setJoinError('');
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Torneos</h1>
          <p style={{ fontSize: '14px', color: '#8892A4' }}>Participa en competencias organizadas</p>
        </div>
        <Link href="/torneos/nueva" style={{ padding: '10px 18px', backgroundColor: '#7C3AED', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
          + Crear Torneo
        </Link>
      </div>

      {/* ── Mis torneos creados ── */}
      {loadingMy ? (
        <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>Cargando mis torneos...</p>
      ) : myTournaments.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#A78BFA', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={13} /> Mis torneos creados ({myTournaments.length})
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {myTournaments.map((t) => (
              <div key={t.id} style={{ backgroundColor: '#0F1424', border: '1px solid #7C3AED44', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '100px', backgroundColor: '#7C3AED22', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Trophy size={36} color="#A78BFA" />
                  <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#7C3AED', color: '#FFFFFF', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>
                    ID: {t.id}
                  </span>
                  <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#16A34A', color: '#FFFFFF', fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px' }}>
                    {STATUS_LABEL[t.status] || t.status}
                  </span>
                </div>
                <div style={{ padding: '14px' }}>
                  <p style={{ fontSize: '11px', color: '#A78BFA', fontWeight: '600', marginBottom: '4px' }}>{t.game_name || `Game ID: ${t.game_id}`}</p>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '10px', lineHeight: 1.3 }}>{t.name}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#8892A4', marginBottom: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ClipboardList size={11} /> {TYPE_LABEL[t.type] || t.type}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={11} /> {t.current_participants || 0}/{t.max_participants} participantes</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} /> {formatDate(t.start_date)}</span>
                  </div>
                  <button
                    onClick={() => openInfo(t)}
                    style={{ width: '100%', padding: '8px 0', backgroundColor: 'transparent', border: '1px solid #7C3AED44', borderRadius: '8px', color: '#A78BFA', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Ver info
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Torneos de la comunidad ── */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#8892A4', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe size={13} /> Torneos destacados
        </p>

        <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar size={20} color="#A78BFA" />
          <div>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Próximos Torneos</p>
            <p style={{ fontSize: '13px', color: '#8892A4', margin: '2px 0 0' }}>No te pierdas las próximas competencias y asegura tu lugar</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['Todos', 'Próximos', 'En vivo', 'Finalizados'].map((f, i) => (
            <button key={f} style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${i === 0 ? '#7C3AED' : '#1E2540'}`, backgroundColor: i === 0 ? '#7C3AED' : 'transparent', color: i === 0 ? '#FFFFFF' : '#8892A4', fontSize: '12px', cursor: 'pointer' }}>{f}</button>
          ))}
        </div>

        {loading && <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>Cargando torneos...</p>}
        {!loading && communityTournaments.length === 0 && (
          <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>No hay torneos disponibles aún</p>
        )}

        {!loading && communityTournaments.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {communityTournaments.map((t) => {
              const isJoined = joinedIds.has(t.id);
              const isJoining = joiningId === t.id;
              const isFull = (t.current_participants || 0) >= t.max_participants;

              return (
                <div key={t.id} style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ height: '140px', backgroundColor: '#161B2E', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trophy size={40} color="#A78BFA" />
                    <span style={{
                      position: 'absolute', top: '10px', right: '10px',
                      fontSize: '11px', fontWeight: '700', color: '#FFFFFF',
                      backgroundColor: STATUS_COLOR[t.status] ? `${STATUS_COLOR[t.status]}CC` : '#374151',
                      padding: '3px 10px', borderRadius: '20px',
                    }}>
                      {STATUS_LABEL[t.status] || t.status}
                    </span>
                  </div>
                  <div style={{ padding: '14px' }}>
                    <p style={{ fontSize: '11px', color: '#A78BFA', fontWeight: '600', marginBottom: '4px' }}>{t.game_name || `Game ID: ${t.game_id}`}</p>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '10px', lineHeight: 1.3 }}>{t.name}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#8892A4', marginBottom: '14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} /> {formatDate(t.start_date)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={11} /> {t.current_participants || 0}/{t.max_participants} participantes</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => openInfo(t)}
                        style={{ flex: 1, padding: '8px 0', backgroundColor: 'transparent', border: '1px solid #1E2540', borderRadius: '8px', color: '#8892A4', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Ver info
                      </button>
                      {t.status === 'registration' && (
                        <button
                          onClick={() => handleJoin(t.id)}
                          disabled={isJoining || isJoined || isFull}
                          style={{
                            flex: 1, padding: '8px 0', border: 'none', borderRadius: '8px',
                            fontSize: '11px', fontWeight: '600', cursor: isJoined || isFull ? 'default' : 'pointer',
                            backgroundColor: isJoined ? '#16A34A' : isFull ? '#374151' : '#7C3AED',
                            color: '#FFFFFF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                          }}
                        >
                          {isJoining ? '...' : isJoined ? <><Check size={11} /> Inscrito</> : isFull ? 'Lleno' : 'Inscribirse'}
                        </button>
                      )}
                      {t.status === 'active' && (
                        <button style={{ flex: 1, padding: '8px 0', backgroundColor: '#FCD34D22', border: '1px solid #FCD34D44', borderRadius: '8px', color: '#FCD34D', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                          En vivo
                        </button>
                      )}
                      {t.status === 'finished' && (
                        <button style={{ flex: 1, padding: '8px 0', backgroundColor: 'transparent', border: '1px solid #1E2540', borderRadius: '8px', color: '#8892A4', fontSize: '11px', cursor: 'pointer' }}>
                          Resultados
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal de información de torneo ── */}
      {selectedTournament && (
        <div
          onClick={closeInfo}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '16px',
              width: '100%', maxWidth: '520px', overflow: 'hidden',
            }}
          >
            {/* Header modal */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1E2540', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={20} color="#A78BFA" />
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
                  {selectedTournament.name}
                </h2>
              </div>
              <button onClick={closeInfo} style={{ background: 'none', border: 'none', color: '#8892A4', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Body modal */}
            <div style={{ padding: '24px' }}>
              {/* Status badge */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{
                  fontSize: '12px', fontWeight: '600', padding: '5px 14px', borderRadius: '20px',
                  color: STATUS_COLOR[selectedTournament.status] || '#9CA3AF',
                  backgroundColor: `${STATUS_COLOR[selectedTournament.status] || '#9CA3AF'}22`,
                  border: `1px solid ${STATUS_COLOR[selectedTournament.status] || '#9CA3AF'}44`,
                }}>
                  {STATUS_LABEL[selectedTournament.status] || selectedTournament.status}
                </span>
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                {[
                  { label: 'Juego', value: selectedTournament.game_name || `ID: ${selectedTournament.game_id}` },
                  { label: 'Formato', value: TYPE_LABEL[selectedTournament.type] || selectedTournament.type },
                  { label: 'Participantes', value: `${selectedTournament.current_participants || 0} / ${selectedTournament.max_participants}` },
                  { label: 'Fecha inicio', value: formatDate(selectedTournament.start_date) },
                  ...(selectedTournament.end_date ? [{ label: 'Fecha fin', value: formatDate(selectedTournament.end_date) }] : []),
                  ...(selectedTournament.creator_name ? [{ label: 'Organizador', value: selectedTournament.creator_name }] : []),
                ].map((item) => (
                  <div key={item.label} style={{ backgroundColor: '#161B2E', borderRadius: '8px', padding: '12px 14px' }}>
                    <p style={{ fontSize: '11px', color: '#8892A4', margin: '0 0 4px' }}>{item.label}</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Descripción */}
              {selectedTournament.description && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#8892A4', marginBottom: '6px' }}>Descripción</p>
                  <p style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: 1.6 }}>{selectedTournament.description}</p>
                </div>
              )}

              {/* Reglas */}
              {selectedTournament.rules && (
                <div style={{ marginBottom: '20px', backgroundColor: '#161B2E', borderRadius: '8px', padding: '14px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#A78BFA', marginBottom: '6px' }}>Reglas</p>
                  <p style={{ fontSize: '12px', color: '#8892A4', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedTournament.rules}</p>
                </div>
              )}

              {/* Error de inscripción */}
              {joinError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8717122', border: '1px solid #F8717144', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#F87171' }}>
                  <AlertTriangle size={14} /> {joinError}
                </div>
              )}

              {/* Botón inscripción */}
              {selectedTournament.status === 'registration' && (
                <button
                  onClick={() => handleJoin(selectedTournament.id)}
                  disabled={joiningId === selectedTournament.id || joinedIds.has(selectedTournament.id) || (selectedTournament.current_participants || 0) >= selectedTournament.max_participants}
                  style={{
                    width: '100%', padding: '12px 0', borderRadius: '10px', border: 'none',
                    fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    backgroundColor: joinedIds.has(selectedTournament.id) ? '#16A34A' : (selectedTournament.current_participants || 0) >= selectedTournament.max_participants ? '#374151' : '#7C3AED',
                    color: '#FFFFFF',
                  }}
                >
                  {joiningId === selectedTournament.id ? 'Inscribiendo...' : joinedIds.has(selectedTournament.id) ? <><Check size={16} /> Ya estás inscrito</> : (selectedTournament.current_participants || 0) >= selectedTournament.max_participants ? 'Torneo lleno' : <><Trophy size={16} /> Inscribirme al torneo</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}