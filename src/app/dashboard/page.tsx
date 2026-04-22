'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { matchesService } from '@/services/matches.service';
import { useEffect, useState } from 'react';
import { Match } from '@/types/match.types';
import Link from 'next/link';
import { Zap, Users, Trophy, TrendingUp, Swords } from 'lucide-react';

const STATUS_LABEL: Record<string, string>  = { open: 'Esperando', scheduled: 'Programada', in_progress: 'En progreso', finished: 'Finalizada' };
const STATUS_COLOR: Record<string, string>  = { open: '#FCD34D',   scheduled: '#60A5FA',    in_progress: '#4ADE80',      finished: '#9CA3AF'    };

export default function DashboardPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    matchesService.getAll().then((r) => setMatches(r.matches.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <MainLayout>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>
          Bienvenido a GameCenter
        </h1>
        <p style={{ fontSize: '14px', color: '#8892A4' }}>
          Tu plataforma para gestionar partidas, torneos y compartir conocimiento
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { icon: <Zap size={22} color="#A78BFA" />,        label: 'Partidas Activas',  value: matches.length.toString(), color: '#7C3AED' },
          { icon: <Users size={22} color="#60A5FA" />,       label: 'Jugadores Online',   value: '—',                       color: '#2563EB' },
          { icon: <Trophy size={22} color="#FCD34D" />,      label: 'Torneos Activos',   value: '—',                       color: '#D97706' },
          { icon: <TrendingUp size={22} color="#4ADE80" />,  label: 'Tips Compartidos',  value: '—',                       color: '#059669' },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '20px' }}>
            <span style={{ display: 'block', marginBottom: '10px' }}>{s.icon}</span>
            <p style={{ fontSize: '28px', fontWeight: '800', color: s.color, marginBottom: '4px' }}>{s.value}</p>
            <p style={{ fontSize: '12px', color: '#8892A4' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actividad reciente */}
      <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF' }}>Actividad Reciente</h2>
          <Link href="/partidas" style={{ fontSize: '12px', color: '#A78BFA' }}>Ver todas →</Link>
        </div>

        {matches.length === 0 ? (
          <p style={{ color: '#8892A4', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No hay partidas disponibles aún</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {matches.map((m) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', backgroundColor: '#161B2E', borderRadius: '8px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#7C3AED22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Swords size={16} color="#A78BFA" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>
                    <span style={{ color: '#A78BFA' }}>{m.creator_name}</span> creó partida de{' '}
                    <span style={{ color: '#A78BFA' }}>{m.game_name}</span>
                  </p>
                  <p style={{ fontSize: '11px', color: '#8892A4', margin: '2px 0 0' }}>{m.title}</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '600', color: STATUS_COLOR[m.status], backgroundColor: `${STATUS_COLOR[m.status]}22`, padding: '3px 10px', borderRadius: '20px' }}>
                  {STATUS_LABEL[m.status] || m.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}