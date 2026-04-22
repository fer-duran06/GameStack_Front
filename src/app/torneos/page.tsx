'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

const mockTournaments = [
  { id: 1, name: 'Copa Latinoamérica 2026', game: 'League of Legends', status: 'registration', participants: '124/256', prize: '$50,000 USD', start: '15 May, 2026',  badge: 'Próximamente', badgeBg: '#7C3AED' },
  { id: 2, name: 'Torneo Battle Royale',    game: 'Valorant',           status: 'active',       participants: '89/100',  prize: '$25,000 USD', start: 'En vivo ahora', badge: 'En vivo',     badgeBg: '#16A34A' },
  { id: 3, name: 'Championship Series',     game: 'Counter-Strike 2',   status: 'registration', participants: '64/128',  prize: '$75,000 USD', start: '22 May, 2026',  badge: 'Próximamente', badgeBg: '#7C3AED' },
  { id: 4, name: 'Arena Masters',           game: 'Hearthstone',        status: 'finished',     participants: '200/200', prize: '$10,000 USD', start: '10 Abr, 2026',  badge: 'Finalizado',  badgeBg: '#374151' },
];

export default function TorneosPage() {
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

      {/* Banner */}
      <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '20px' }}>📅</span>
        <div>
          <p style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Próximos Torneos</p>
          <p style={{ fontSize: '13px', color: '#8892A4', margin: '2px 0 0' }}>No te pierdas las próximas competencias y asegura tu lugar</p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['Todos', 'Próximos', 'En vivo', 'Finalizados'].map((f, i) => (
          <button key={f} style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${i === 0 ? '#7C3AED' : '#1E2540'}`, backgroundColor: i === 0 ? '#7C3AED' : 'transparent', color: i === 0 ? '#FFFFFF' : '#8892A4', fontSize: '12px', cursor: 'pointer' }}>{f}</button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {mockTournaments.map((t) => (
          <div key={t.id} style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ height: '140px', backgroundColor: '#161B2E', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '40px' }}>🏆</span>
              <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '11px', fontWeight: '700', color: '#FFFFFF', backgroundColor: t.badgeBg, padding: '3px 10px', borderRadius: '20px' }}>{t.badge}</span>
            </div>
            <div style={{ padding: '14px' }}>
              <p style={{ fontSize: '11px', color: '#A78BFA', fontWeight: '600', marginBottom: '4px' }}>{t.game}</p>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '10px', lineHeight: 1.3 }}>{t.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#8892A4', marginBottom: '14px' }}>
                <span>📅 {t.start}</span>
                <span>👥 {t.participants} participantes</span>
                <span style={{ color: '#FCD34D', fontWeight: '600' }}>💰 {t.prize}</span>
              </div>
              <button style={{ width: '100%', padding: '9px 0', backgroundColor: t.status === 'finished' ? 'transparent' : '#7C3AED', border: t.status === 'finished' ? '1px solid #1E2540' : 'none', borderRadius: '8px', color: t.status === 'finished' ? '#8892A4' : '#FFFFFF', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                {t.status === 'active' ? 'Ver en vivo' : t.status === 'finished' ? 'Ver resultados' : 'Inscribirse'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}