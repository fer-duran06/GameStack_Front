'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { matchesService } from '@/services/matches.service';
import { Match } from '@/types/match.types';
import { Swords, Calendar, Users, Eye, X, Check, AlertTriangle } from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  open: 'Esperando jugadores',
  scheduled: 'Programada',
  in_progress: 'En progreso',
  finished: 'Finalizada',
};
const STATUS_COLOR: Record<string, string> = {
  open: '#FCD34D',
  scheduled: '#60A5FA',
  in_progress: '#4ADE80',
  finished: '#9CA3AF',
};

export default function PartidasPage() {
  const [matches, setMatches]               = useState<Match[]>([]);
  const [loading, setLoading]               = useState(true);
  const [filter, setFilter]                 = useState('all');

  // Modal de detalle
  const [selectedMatch, setSelectedMatch]   = useState<Match | null>(null);

  // Estado de unirse
  const [joiningId, setJoiningId]           = useState<number | null>(null);
  const [joinedIds, setJoinedIds]           = useState<Set<number>>(new Set());
  const [joinError, setJoinError]           = useState('');

  useEffect(() => {
    matchesService
      .getAll()
      .then((r) => setMatches(r.matches))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === 'all' ? matches : matches.filter((m) => m.status === filter);

  /* ── Unirse a partida ── */
  const handleJoin = async (matchId: number) => {
    if (joiningId === matchId) return;
    setJoiningId(matchId);
    setJoinError('');
    try {
      await matchesService.join(matchId);
      setJoinedIds((prev) => new Set([...prev, matchId]));
      // actualizar en el modal si está abierto
      setSelectedMatch((prev) =>
        prev?.id === matchId ? { ...prev } : prev,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al unirse';
      setJoinError(msg);
    } finally {
      setJoiningId(null);
    }
  };

  /* ── Helpers ── */
  const openDetail  = (m: Match) => { setSelectedMatch(m); setJoinError(''); };
  const closeDetail = () => { setSelectedMatch(null); setJoinError(''); };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <MainLayout>
      {/* ── Encabezado ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Partidas</h1>
          <p style={{ fontSize: '14px', color: '#8892A4' }}>Únete o crea nuevas partidas</p>
        </div>
        <Link
          href="/partidas/nueva"
          style={{ padding: '10px 18px', backgroundColor: '#7C3AED', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}
        >
          + Nueva Partida
        </Link>
      </div>

      {/* ── Filtros ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { k: 'all',         l: 'Todas' },
          { k: 'open',        l: 'Esperando' },
          { k: 'in_progress', l: 'En progreso' },
          { k: 'finished',    l: 'Finalizadas' },
        ].map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              border: `1px solid ${filter === f.k ? '#7C3AED' : '#1E2540'}`,
              backgroundColor: filter === f.k ? '#7C3AED' : 'transparent',
              color: filter === f.k ? '#FFFFFF' : '#8892A4',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {f.l}
          </button>
        ))}
      </div>

      {/* ── Lista ── */}
      {loading ? (
        <p style={{ color: '#8892A4', textAlign: 'center', padding: '40px' }}>Cargando partidas...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#8892A4' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <Swords size={40} color="#4B5563" />
          </div>
          <p>No hay partidas disponibles</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {filtered.map((m) => {
            const isJoined  = joinedIds.has(m.id);
            const isJoining = joiningId === m.id;

            return (
              <div
                key={m.id}
                style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', overflow: 'hidden' }}
              >
                {/* Cabecera de la card */}
                <div
                  style={{ padding: '12px 16px', borderBottom: '1px solid #1E2540', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '12px', color: '#A78BFA', fontWeight: '600' }}>{m.game_name}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: STATUS_COLOR[m.status],
                      backgroundColor: `${STATUS_COLOR[m.status]}22`,
                      padding: '3px 10px',
                      borderRadius: '20px',
                    }}
                  >
                    {STATUS_LABEL[m.status] || m.status}
                  </span>
                </div>

                {/* Cuerpo */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>{m.title}</h3>
                  <p style={{ fontSize: '12px', color: '#8892A4', marginBottom: '14px' }}>Host: {m.creator_name}</p>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#8892A4', marginBottom: '16px' }}>
                    {m.scheduled_at && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        {new Date(m.scheduled_at).toLocaleDateString('es-MX', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={12} /> {m.max_players} jugadores máx
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Botón Unirse */}
                    {m.status === 'open' && (
                      <button
                        onClick={() => handleJoin(m.id)}
                        disabled={isJoining || isJoined}
                        style={{
                          flex: 1,
                          padding: '9px 0',
                          backgroundColor: isJoined ? '#16A34A' : '#7C3AED',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: isJoined ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          opacity: isJoining ? 0.7 : 1,
                        }}
                      >
                        {isJoining ? 'Uniéndose...' : isJoined ? <><Check size={13} /> Unido</> : 'Unirse'}
                      </button>
                    )}

                    {/* Botón Ver detalles */}
                    <button
                      onClick={() => openDetail(m)}
                      style={{
                        flex: 1,
                        padding: '9px 0',
                        backgroundColor: 'transparent',
                        border: '1px solid #1E2540',
                        borderRadius: '8px',
                        color: '#8892A4',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Eye size={13} /> Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL DE DETALLE DE PARTIDA
      ══════════════════════════════════════════ */}
      {selectedMatch && (
        <div
          onClick={closeDetail}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0F1424',
              border: '1px solid #1E2540',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '500px',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #1E2540',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Swords size={20} color="#A78BFA" />
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
                  {selectedMatch.title}
                </h2>
              </div>
              <button
                onClick={closeDetail}
                style={{ background: 'none', border: 'none', color: '#8892A4', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo */}
            <div style={{ padding: '24px' }}>
              {/* Status badge */}
              <div style={{ marginBottom: '20px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '5px 14px',
                    borderRadius: '20px',
                    color: STATUS_COLOR[selectedMatch.status] || '#9CA3AF',
                    backgroundColor: `${STATUS_COLOR[selectedMatch.status] || '#9CA3AF'}22`,
                    border: `1px solid ${STATUS_COLOR[selectedMatch.status] || '#9CA3AF'}44`,
                  }}
                >
                  {STATUS_LABEL[selectedMatch.status] || selectedMatch.status}
                </span>
              </div>

              {/* Info grid */}
              <div
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}
              >
                {[
                  { label: 'Juego',            value: selectedMatch.game_name },
                  { label: 'Host',             value: selectedMatch.creator_name },
                  { label: 'Máx. jugadores',   value: `${selectedMatch.max_players} jugadores` },
                  ...(selectedMatch.scheduled_at
                    ? [{ label: 'Fecha programada', value: formatDate(selectedMatch.scheduled_at) }]
                    : []),
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{ backgroundColor: '#161B2E', borderRadius: '8px', padding: '12px 14px' }}
                  >
                    <p style={{ fontSize: '11px', color: '#8892A4', margin: '0 0 4px' }}>{item.label}</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Descripción */}
              {selectedMatch.description && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#8892A4', marginBottom: '6px' }}>
                    Descripción
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#E2E8F0',
                      lineHeight: 1.6,
                      backgroundColor: '#161B2E',
                      borderRadius: '8px',
                      padding: '12px 14px',
                    }}
                  >
                    {selectedMatch.description}
                  </p>
                </div>
              )}

              {/* Error de unirse */}
              {joinError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#F8717122',
                    border: '1px solid #F8717144',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginBottom: '14px',
                    fontSize: '13px',
                    color: '#F87171',
                  }}
                >
                  <AlertTriangle size={14} /> {joinError}
                </div>
              )}

              {/* Botón de acción */}
              {selectedMatch.status === 'open' && (
                <button
                  onClick={() => handleJoin(selectedMatch.id)}
                  disabled={joiningId === selectedMatch.id || joinedIds.has(selectedMatch.id)}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: joinedIds.has(selectedMatch.id) ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: joinedIds.has(selectedMatch.id) ? '#16A34A' : '#7C3AED',
                    color: '#FFFFFF',
                  }}
                >
                  {joiningId === selectedMatch.id
                    ? 'Uniéndose...'
                    : joinedIds.has(selectedMatch.id)
                    ? <><Check size={16} /> Ya estás en esta partida</>
                    : <><Swords size={16} /> Unirme a la partida</>}
                </button>
              )}

              {selectedMatch.status === 'finished' && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: '#9CA3AF22',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: '#9CA3AF',
                  }}
                >
                  Esta partida ya ha finalizado
                </div>
              )}

              {selectedMatch.status === 'in_progress' && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: '#4ADE8022',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: '#4ADE80',
                    fontWeight: '600',
                  }}
                >
                  🟢 Partida en curso
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}