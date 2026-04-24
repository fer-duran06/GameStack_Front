'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Trophy, Calendar, Users, Globe, ClipboardList, X, AlertTriangle, Check, LogOut, Play, Square, GitBranch } from 'lucide-react';
import { tournamentsService, BracketResponse } from '@/services/tournaments.service';
import { Tournament } from '@/types/tournament.types';
import { useAuth } from '@/context/AuthContext';

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

const FILTER_MAP: Record<string, string | null> = {
  all:      null,
  proximos: 'registration',
  live:     'active',
  finished: 'finished',
};

const STORAGE_KEY = 'gamecenter_joined_tournaments';

const loadJoinedIds = (): Set<number> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set<number>(JSON.parse(raw));
  } catch { return new Set(); }
};

const saveJoinedIds = (ids: Set<number>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch { /* ignore */ }
};

export default function TorneosPage() {
  const { user } = useAuth();

  const [myTournaments, setMyTournaments]               = useState<Tournament[]>([]);
  const [communityTournaments, setCommunityTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading]                           = useState(true);
  const [loadingMy, setLoadingMy]                       = useState(true);
  const [filter, setFilter]                             = useState('all');

  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const [joiningId, setJoiningId]   = useState<number | null>(null);
  const [leavingId, setLeavingId]   = useState<number | null>(null);
  const [actionId, setActionId]     = useState<number | null>(null); // start/finish
  const [joinedIds, setJoinedIds]   = useState<Set<number>>(new Set());
  const [joinError, setJoinError]   = useState('');
  const [actionError, setActionError] = useState('');

  // Bracket modal
  const [bracketTournament, setBracketTournament] = useState<Tournament | null>(null);
  const [bracketData, setBracketData]             = useState<BracketResponse | null>(null);
  const [loadingBracket, setLoadingBracket]       = useState(false);
  const [bracketError, setBracketError]           = useState('');

  useEffect(() => {
    setJoinedIds(loadJoinedIds());
  }, []);

  const fetchTournaments = () => {
    tournamentsService.getMy()
      .then((res) => setMyTournaments(res.tournaments))
      .catch(() => {})
      .finally(() => setLoadingMy(false));

    tournamentsService.getAll()
      .then((res) => setCommunityTournaments(res.tournaments))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTournaments(); }, []);

  const filteredTournaments = communityTournaments.filter((t) => {
    const statusFilter = FILTER_MAP[filter];
    if (!statusFilter) return true;
    return t.status === statusFilter;
  });

  /* ── Inscribirse ── */
  const handleJoin = async (tournamentId: number) => {
    if (joiningId === tournamentId) return;
    setJoiningId(tournamentId);
    setJoinError('');
    try {
      await tournamentsService.join(tournamentId);
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : '').toLowerCase();
      if (!msg.includes('inscrito') && !msg.includes('already') && !msg.includes('existe') && !msg.includes('duplicate')) {
        setJoinError(err instanceof Error ? err.message : 'Error al inscribirse');
        setJoiningId(null);
        return;
      }
    }
    const updated = new Set([...joinedIds, tournamentId]);
    setJoinedIds(updated);
    saveJoinedIds(updated);
    setCommunityTournaments((prev) =>
      prev.map((t) => t.id === tournamentId
        ? { ...t, current_participants: Number(t.current_participants || 0) + 1 }
        : t),
    );
    setSelectedTournament((prev) =>
      prev?.id === tournamentId
        ? { ...prev, current_participants: Number(prev.current_participants || 0) + 1 }
        : prev,
    );
    setJoiningId(null);
  };

  /* ── Cancelar inscripción ── */
  const handleLeave = async (tournamentId: number) => {
    if (leavingId === tournamentId) return;
    setLeavingId(tournamentId);
    setJoinError('');
    try { await tournamentsService.leave(tournamentId); } catch { /* ignorar si no existe */ }
    const updated = new Set([...joinedIds]);
    updated.delete(tournamentId);
    setJoinedIds(updated);
    saveJoinedIds(updated);
    setCommunityTournaments((prev) =>
      prev.map((t) => t.id === tournamentId
        ? { ...t, current_participants: Math.max(0, Number(t.current_participants || 0) - 1) }
        : t),
    );
    setSelectedTournament((prev) =>
      prev?.id === tournamentId
        ? { ...prev, current_participants: Math.max(0, Number(prev.current_participants || 0) - 1) }
        : prev,
    );
    setLeavingId(null);
  };

  /* ── Iniciar torneo ── */
  const handleStart = async (tournamentId: number) => {
    if (actionId) return;
    setActionId(tournamentId);
    setActionError('');
    try {
      await tournamentsService.start(tournamentId);
      // Actualizar status localmente
      const updateStatus = (list: Tournament[]) =>
        list.map((t) => t.id === tournamentId ? { ...t, status: 'active' as const } : t);
      setMyTournaments((prev) => updateStatus(prev));
      setCommunityTournaments((prev) => updateStatus(prev));
      setSelectedTournament((prev) =>
        prev?.id === tournamentId ? { ...prev, status: 'active' as const } : prev,
      );
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Error al iniciar el torneo');
    } finally { setActionId(null); }
  };

  /* ── Finalizar torneo ── */
  const handleFinish = async (tournamentId: number) => {
    if (actionId) return;
    setActionId(tournamentId);
    setActionError('');
    try {
      await tournamentsService.finish(tournamentId);
      const updateStatus = (list: Tournament[]) =>
        list.map((t) => t.id === tournamentId ? { ...t, status: 'finished' as const } : t);
      setMyTournaments((prev) => updateStatus(prev));
      setCommunityTournaments((prev) => updateStatus(prev));
      setSelectedTournament((prev) =>
        prev?.id === tournamentId ? { ...prev, status: 'finished' as const } : prev,
      );
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Error al finalizar el torneo');
    } finally { setActionId(null); }
  };

  /* ── Ver bracket ── */
  const handleViewBracket = async (t: Tournament) => {
    setBracketTournament(t);
    setBracketData(null);
    setBracketError('');
    setLoadingBracket(true);
    try {
      // Intentar obtener bracket existente primero
      const res = await tournamentsService.getBracket(t.id);
      setBracketData(res);
    } catch {
      // Si no existe aún, mostrar opción de generarlo
      setBracketError('No se ha generado el bracket aún');
    } finally { setLoadingBracket(false); }
  };

  const handleGenerateBracket = async (tournamentId: number) => {
    setLoadingBracket(true);
    setBracketError('');
    try {
      const res = await tournamentsService.generateBracket(tournamentId);
      setBracketData(res);
    } catch (err: unknown) {
      setBracketError(err instanceof Error ? err.message : 'Error al generar el bracket');
    } finally { setLoadingBracket(false); }
  };

  const openInfo  = (t: Tournament) => { setSelectedTournament(t); setJoinError(''); setActionError(''); };
  const closeInfo = () => { setSelectedTournament(null); setJoinError(''); setActionError(''); };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateStr; }
  };

  const isCreator = (t: Tournament) => user && t.creator_id && user.id === t.creator_id;

  // Obtener matches del bracket
  const bracketMatches = bracketData?.matches || bracketData?.bracket || [];
  const rounds = bracketMatches.length > 0
    ? [...new Set(bracketMatches.map((m) => m.round))].sort((a, b) => a - b)
    : [];

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
      {!loadingMy && myTournaments.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#A78BFA', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={13} /> Mis torneos creados ({myTournaments.length})
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {myTournaments.map((t) => (
              <div key={t.id} style={{ backgroundColor: '#0F1424', border: '1px solid #7C3AED44', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '100px', backgroundColor: '#7C3AED22', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Trophy size={36} color="#A78BFA" />
                  <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: STATUS_COLOR[t.status] ? `${STATUS_COLOR[t.status]}CC` : '#374151', color: '#0D0F17', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' }}>
                    {STATUS_LABEL[t.status] || t.status}
                  </span>
                </div>
                <div style={{ padding: '14px' }}>
                  <p style={{ fontSize: '11px', color: '#A78BFA', fontWeight: '600', marginBottom: '4px' }}>{t.game_name || `Game ID: ${t.game_id}`}</p>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '10px', lineHeight: 1.3 }}>{t.name}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#8892A4', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ClipboardList size={11} /> {TYPE_LABEL[t.type] || t.type}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={11} /> {Number(t.current_participants || 0)}/{t.max_participants} participantes</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} /> {formatDate(t.start_date)}</span>
                  </div>

                  {/* Botones de gestión */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openInfo(t)} style={{ flex: 1, padding: '7px 0', backgroundColor: 'transparent', border: '1px solid #7C3AED44', borderRadius: '8px', color: '#A78BFA', fontSize: '11px', cursor: 'pointer' }}>
                        Ver info
                      </button>
                      <button onClick={() => handleViewBracket(t)} style={{ flex: 1, padding: '7px 0', backgroundColor: 'transparent', border: '1px solid #1E2540', borderRadius: '8px', color: '#8892A4', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <GitBranch size={11} /> Bracket
                      </button>
                    </div>

                    {/* Iniciar / Finalizar */}
                    {t.status === 'registration' && (
                      <button
                        onClick={() => handleStart(t.id)}
                        disabled={actionId === t.id}
                        style={{ width: '100%', padding: '7px 0', backgroundColor: '#059669', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        {actionId === t.id ? 'Iniciando...' : <><Play size={11} /> Iniciar torneo</>}
                      </button>
                    )}
                    {t.status === 'active' && (
                      <button
                        onClick={() => handleFinish(t.id)}
                        disabled={actionId === t.id}
                        style={{ width: '100%', padding: '7px 0', backgroundColor: '#DC2626', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        {actionId === t.id ? 'Finalizando...' : <><Square size={11} /> Finalizar torneo</>}
                      </button>
                    )}
                  </div>
                  {actionError && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '6px' }}>{actionError}</p>}
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

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { k: 'all',      l: 'Todos' },
            { k: 'proximos', l: 'Próximos' },
            { k: 'live',     l: 'En vivo' },
            { k: 'finished', l: 'Finalizados' },
          ].map((f) => (
            <button key={f.k} onClick={() => setFilter(f.k)} style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${filter === f.k ? '#7C3AED' : '#1E2540'}`, backgroundColor: filter === f.k ? '#7C3AED' : 'transparent', color: filter === f.k ? '#FFFFFF' : '#8892A4', fontSize: '12px', cursor: 'pointer' }}>
              {f.l}
            </button>
          ))}
        </div>

        {loading && <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>Cargando torneos...</p>}
        {!loading && filteredTournaments.length === 0 && (
          <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>No hay torneos disponibles</p>
        )}

        {!loading && filteredTournaments.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {filteredTournaments.map((t) => {
              const isJoined  = joinedIds.has(t.id);
              const isJoining = joiningId === t.id;
              const isLeaving = leavingId === t.id;
              const current   = Number(t.current_participants || 0);
              const isFull    = current >= t.max_participants;
              const creator   = isCreator(t);

              return (
                <div key={t.id} style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ height: '140px', backgroundColor: '#161B2E', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trophy size={40} color="#A78BFA" />
                    <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '11px', fontWeight: '700', color: '#FFFFFF', backgroundColor: `${STATUS_COLOR[t.status] || '#374151'}CC`, padding: '3px 10px', borderRadius: '20px' }}>
                      {STATUS_LABEL[t.status] || t.status}
                    </span>
                  </div>
                  <div style={{ padding: '14px' }}>
                    <p style={{ fontSize: '11px', color: '#A78BFA', fontWeight: '600', marginBottom: '4px' }}>{t.game_name || `Game ID: ${t.game_id}`}</p>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '10px', lineHeight: 1.3 }}>{t.name}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#8892A4', marginBottom: '14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} /> {formatDate(t.start_date)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={11} /> {current}/{t.max_participants} participantes</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openInfo(t)} style={{ flex: 1, padding: '8px 0', backgroundColor: 'transparent', border: '1px solid #1E2540', borderRadius: '8px', color: '#8892A4', fontSize: '11px', cursor: 'pointer' }}>
                        Ver info
                      </button>
                      {t.status === 'registration' && !creator && (
                        isJoined ? (
                          <button onClick={() => handleLeave(t.id)} disabled={isLeaving} style={{ flex: 1, padding: '8px 0', border: '1px solid #F8717144', borderRadius: '8px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', backgroundColor: '#F8717122', color: '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {isLeaving ? '...' : <><LogOut size={11} /> Salir</>}
                          </button>
                        ) : (
                          <button onClick={() => handleJoin(t.id)} disabled={isJoining || isFull} style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '600', cursor: isFull ? 'default' : 'pointer', backgroundColor: isFull ? '#374151' : '#7C3AED', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {isJoining ? '...' : isFull ? 'Lleno' : 'Inscribirse'}
                          </button>
                        )
                      )}
                      {t.status === 'active' && (
                        <button onClick={() => handleViewBracket(t)} style={{ flex: 1, padding: '8px 0', backgroundColor: '#FCD34D22', border: '1px solid #FCD34D44', borderRadius: '8px', color: '#FCD34D', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <GitBranch size={11} /> Bracket
                        </button>
                      )}
                      {t.status === 'finished' && (
                        <button onClick={() => handleViewBracket(t)} style={{ flex: 1, padding: '8px 0', backgroundColor: 'transparent', border: '1px solid #1E2540', borderRadius: '8px', color: '#8892A4', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <GitBranch size={11} /> Resultados
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

      {/* ══════════════════════════════════════════
          MODAL INFO DE TORNEO
      ══════════════════════════════════════════ */}
      {selectedTournament && (
        <div onClick={closeInfo} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '16px', width: '100%', maxWidth: '520px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1E2540', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={20} color="#A78BFA" />
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>{selectedTournament.name}</h2>
              </div>
              <button onClick={closeInfo} style={{ background: 'none', border: 'none', color: '#8892A4', cursor: 'pointer', padding: '4px' }}><X size={18} /></button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', padding: '5px 14px', borderRadius: '20px', color: STATUS_COLOR[selectedTournament.status] || '#9CA3AF', backgroundColor: `${STATUS_COLOR[selectedTournament.status] || '#9CA3AF'}22`, border: `1px solid ${STATUS_COLOR[selectedTournament.status] || '#9CA3AF'}44` }}>
                  {STATUS_LABEL[selectedTournament.status] || selectedTournament.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                {[
                  { label: 'Juego',         value: selectedTournament.game_name || `ID: ${selectedTournament.game_id}` },
                  { label: 'Formato',       value: TYPE_LABEL[selectedTournament.type] || selectedTournament.type },
                  { label: 'Participantes', value: `${Number(selectedTournament.current_participants || 0)} / ${selectedTournament.max_participants}` },
                  { label: 'Fecha inicio',  value: formatDate(selectedTournament.start_date) },
                  ...(selectedTournament.end_date     ? [{ label: 'Fecha fin',    value: formatDate(selectedTournament.end_date) }]    : []),
                  ...(selectedTournament.creator_name ? [{ label: 'Organizador', value: selectedTournament.creator_name }]             : []),
                ].map((item) => (
                  <div key={item.label} style={{ backgroundColor: '#161B2E', borderRadius: '8px', padding: '12px 14px' }}>
                    <p style={{ fontSize: '11px', color: '#8892A4', margin: '0 0 4px' }}>{item.label}</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {selectedTournament.description && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#8892A4', marginBottom: '6px' }}>Descripción</p>
                  <p style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: 1.6 }}>{selectedTournament.description}</p>
                </div>
              )}

              {selectedTournament.rules && (
                <div style={{ marginBottom: '20px', backgroundColor: '#161B2E', borderRadius: '8px', padding: '14px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#A78BFA', marginBottom: '6px' }}>Reglas</p>
                  <p style={{ fontSize: '12px', color: '#8892A4', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedTournament.rules}</p>
                </div>
              )}

              {/* Errores */}
              {(joinError || actionError) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8717122', border: '1px solid #F8717144', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#F87171' }}>
                  <AlertTriangle size={14} /> {joinError || actionError}
                </div>
              )}

              {/* Botones creador */}
              {isCreator(selectedTournament) && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  {selectedTournament.status === 'registration' && (
                    <button
                      onClick={() => handleStart(selectedTournament.id)}
                      disabled={actionId === selectedTournament.id}
                      style={{ flex: 1, padding: '11px 0', backgroundColor: '#059669', border: 'none', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {actionId === selectedTournament.id ? 'Iniciando...' : <><Play size={14} /> Iniciar torneo</>}
                    </button>
                  )}
                  {selectedTournament.status === 'active' && (
                    <button
                      onClick={() => handleFinish(selectedTournament.id)}
                      disabled={actionId === selectedTournament.id}
                      style={{ flex: 1, padding: '11px 0', backgroundColor: '#DC2626', border: 'none', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {actionId === selectedTournament.id ? 'Finalizando...' : <><Square size={14} /> Finalizar torneo</>}
                    </button>
                  )}
                  <button
                    onClick={() => { closeInfo(); handleViewBracket(selectedTournament); }}
                    style={{ flex: 1, padding: '11px 0', backgroundColor: 'transparent', border: '1px solid #7C3AED', borderRadius: '10px', color: '#A78BFA', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <GitBranch size={14} /> Ver bracket
                  </button>
                </div>
              )}

              {/* Botones participante */}
              {!isCreator(selectedTournament) && selectedTournament.status === 'registration' && (
                joinedIds.has(selectedTournament.id) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ width: '100%', padding: '12px 0', borderRadius: '10px', backgroundColor: '#16A34A', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Check size={16} /> Ya estás inscrito
                    </div>
                    <button onClick={() => handleLeave(selectedTournament.id)} disabled={leavingId === selectedTournament.id} style={{ width: '100%', padding: '10px 0', borderRadius: '10px', backgroundColor: 'transparent', border: '1px solid #F8717144', color: '#F87171', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      {leavingId === selectedTournament.id ? 'Cancelando...' : <><LogOut size={14} /> Cancelar mi inscripción</>}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoin(selectedTournament.id)}
                    disabled={joiningId === selectedTournament.id || Number(selectedTournament.current_participants || 0) >= selectedTournament.max_participants}
                    style={{ width: '100%', padding: '12px 0', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: Number(selectedTournament.current_participants || 0) >= selectedTournament.max_participants ? '#374151' : '#7C3AED', color: '#FFFFFF' }}
                  >
                    {joiningId === selectedTournament.id ? 'Inscribiendo...' : Number(selectedTournament.current_participants || 0) >= selectedTournament.max_participants ? 'Torneo lleno' : <><Trophy size={16} /> Inscribirme al torneo</>}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL BRACKET
      ══════════════════════════════════════════ */}
      {bracketTournament && (
        <div onClick={() => setBracketTournament(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1E2540', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GitBranch size={20} color="#A78BFA" />
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Bracket — {bracketTournament.name}</h2>
                  <p style={{ fontSize: '11px', color: '#8892A4', margin: 0 }}>{TYPE_LABEL[bracketTournament.type] || bracketTournament.type}</p>
                </div>
              </div>
              <button onClick={() => setBracketTournament(null)} style={{ background: 'none', border: 'none', color: '#8892A4', cursor: 'pointer', padding: '4px' }}><X size={18} /></button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {loadingBracket && (
                <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>Cargando bracket...</p>
              )}

              {!loadingBracket && bracketError && (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <p style={{ color: '#8892A4', marginBottom: '16px', fontSize: '13px' }}>{bracketError}</p>
                  {isCreator(bracketTournament) && bracketTournament.status !== 'registration' && (
                    <button
                      onClick={() => handleGenerateBracket(bracketTournament.id)}
                      style={{ padding: '10px 24px', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <GitBranch size={14} /> Generar bracket
                    </button>
                  )}
                  {isCreator(bracketTournament) && bracketTournament.status === 'registration' && (
                    <p style={{ fontSize: '12px', color: '#FCD34D' }}>Inicia el torneo primero para generar el bracket</p>
                  )}
                </div>
              )}

              {!loadingBracket && !bracketError && bracketMatches.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <p style={{ color: '#8892A4', fontSize: '13px' }}>No hay partidas en el bracket aún</p>
                  {isCreator(bracketTournament) && (
                    <button
                      onClick={() => handleGenerateBracket(bracketTournament.id)}
                      style={{ marginTop: '16px', padding: '10px 24px', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <GitBranch size={14} /> Generar bracket
                    </button>
                  )}
                </div>
              )}

              {!loadingBracket && bracketMatches.length > 0 && (
                <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {rounds.map((round) => {
                    const roundMatches = bracketMatches.filter((m) => m.round === round);
                    return (
                      <div key={round} style={{ minWidth: '200px', flexShrink: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: '#A78BFA', marginBottom: '12px', textAlign: 'center' }}>
                          Ronda {round}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {roundMatches.map((match) => (
                            <div key={match.id} style={{ backgroundColor: '#161B2E', border: '1px solid #1E2540', borderRadius: '10px', overflow: 'hidden' }}>
                              {/* Jugador 1 */}
                              <div style={{
                                padding: '10px 14px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                backgroundColor: match.winner_id === match.participant1_id ? '#16A34A22' : 'transparent',
                                borderBottom: '1px solid #1E2540',
                              }}>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: match.winner_id === match.participant1_id ? '#4ADE80' : '#FFFFFF' }}>
                                  {match.participant1_name || 'Por definir'}
                                </span>
                                {match.winner_id === match.participant1_id && <Check size={13} color="#4ADE80" />}
                              </div>
                              {/* Jugador 2 */}
                              <div style={{
                                padding: '10px 14px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                backgroundColor: match.winner_id === match.participant2_id ? '#16A34A22' : 'transparent',
                              }}>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: match.winner_id === match.participant2_id ? '#4ADE80' : '#FFFFFF' }}>
                                  {match.participant2_name || 'Por definir'}
                                </span>
                                {match.winner_id === match.participant2_id && <Check size={13} color="#4ADE80" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Info de total de partidas si viene en la respuesta */}
              {bracketData?.total_matches_created && bracketMatches.length === 0 && (
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#161B2E', borderRadius: '8px', marginTop: '16px' }}>
                  <p style={{ fontSize: '13px', color: '#4ADE80', fontWeight: '600' }}>
                    ✓ Bracket generado — {bracketData.total_matches_created} partidas creadas
                  </p>
                  <p style={{ fontSize: '12px', color: '#8892A4', marginTop: '4px' }}>
                    Los detalles de las partidas estarán disponibles en breve
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}