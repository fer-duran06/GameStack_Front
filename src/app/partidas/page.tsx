'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { matchesService } from '@/services/matches.service';
import { Match } from '@/types/match.types';
import { Swords, Calendar, Users, Eye } from 'lucide-react';

const STATUS_LABEL: Record<string, string> = { open: 'Esperando jugadores', scheduled: 'Programada', in_progress: 'En progreso', finished: 'Finalizada' };
const STATUS_COLOR: Record<string, string> = { open: '#FCD34D', scheduled: '#60A5FA', in_progress: '#4ADE80', finished: '#9CA3AF' };

export default function PartidasPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    matchesService.getAll().then((r) => setMatches(r.matches)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? matches : matches.filter((m) => m.status === filter);

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Partidas</h1>
          <p style={{ fontSize: '14px', color: '#8892A4' }}>Únete o crea nuevas partidas</p>
        </div>
        <Link href="/partidas/nueva" style={{ padding: '10px 18px', backgroundColor: '#7C3AED', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
          + Nueva Partida
        </Link>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[{ k: 'all', l: 'Todas' }, { k: 'open', l: 'Esperando' }, { k: 'in_progress', l: 'En progreso' }, { k: 'finished', l: 'Finalizadas' }].map((f) => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${filter === f.k ? '#7C3AED' : '#1E2540'}`, backgroundColor: filter === f.k ? '#7C3AED' : 'transparent', color: filter === f.k ? '#FFFFFF' : '#8892A4', fontSize: '12px', cursor: 'pointer' }}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: '#8892A4', textAlign: 'center', padding: '40px' }}>Cargando partidas...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#8892A4' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}><Swords size={40} color="#4B5563" /></div>
          <p>No hay partidas disponibles</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {filtered.map((m) => (
            <div key={m.id} style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1E2540', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#A78BFA', fontWeight: '600' }}>{m.game_name}</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: STATUS_COLOR[m.status], backgroundColor: `${STATUS_COLOR[m.status]}22`, padding: '3px 10px', borderRadius: '20px' }}>
                  {STATUS_LABEL[m.status] || m.status}
                </span>
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>{m.title}</h3>
                <p style={{ fontSize: '12px', color: '#8892A4', marginBottom: '14px' }}>Host: {m.creator_name}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#8892A4', marginBottom: '16px' }}>
                  {m.scheduled_at && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(m.scheduled_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> {m.max_players} jugadores máx</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {m.status === 'open' && (
                    <button style={{ flex: 1, padding: '9px 0', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                      Unirse
                    </button>
                  )}
                  <button style={{ flex: 1, padding: '9px 0', backgroundColor: 'transparent', border: '1px solid #1E2540', borderRadius: '8px', color: '#8892A4', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Eye size={13} /> Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
}