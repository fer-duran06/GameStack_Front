'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

const mockTips = [
  { id: 1, author: 'ZedMaster',   game: 'League of Legends', title: 'Build Lethality Zed para One-Shot',       content: 'Maximiza tu daño con esta build optimizada para eliminar carries en mid-late game. Incluye runas, items y combo recomendado.', category: 'Build',      catColor: '#A78BFA', likes: 234, comments: 45, time: 'hace 2 horas' },
  { id: 2, author: 'TacticalPro', game: 'Valorant',           title: 'Estrategia de Defensa en Haven',          content: 'Aprende a defender efectivamente los 3 sites de Haven con rotaciones optimizadas y posicionamiento clave para cada agente.', category: 'Estrategia', catColor: '#4ADE80', likes: 189, comments: 32, time: 'hace 5 horas' },
  { id: 3, author: 'ChessMentor', game: 'Chess',              title: 'Apertura Italiana para Principiantes',    content: 'Una apertura sólida y fácil de aprender que te dará ventaja en las primeras jugadas. Ideal para comenzar.',                  category: 'Tip',        catColor: '#60A5FA', likes: 156, comments: 28, time: 'hace 8 horas' },
  { id: 4, author: 'SupportKing', game: 'League of Legends', title: 'Tank Thresh Support Build',               content: 'Build tanque para Thresh que te permite proteger a tu carry mientras inicias peleas. Perfecto para soloQ.',                 category: 'Build',      catColor: '#A78BFA', likes: 198, comments: 41, time: 'hace 12 horas' },
];

export default function TipsPage() {
  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Tips & Estrategias</h1>
          <p style={{ fontSize: '14px', color: '#8892A4' }}>Comparte y aprende de la comunidad</p>
        </div>
        <Link href="/tips/nueva" style={{ padding: '10px 18px', backgroundColor: '#7C3AED', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
          + Publicar
        </Link>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['Todos', 'Tips', 'Estrategias', 'Builds'].map((f, i) => (
          <button key={f} style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${i === 0 ? '#7C3AED' : '#1E2540'}`, backgroundColor: i === 0 ? '#7C3AED' : 'transparent', color: i === 0 ? '#FFFFFF' : '#8892A4', fontSize: '12px', cursor: 'pointer' }}>{f}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {mockTips.map((tip) => (
          <div key={tip.id} style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>
                  {tip.author.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{tip.author}</p>
                  <p style={{ fontSize: '11px', color: '#8892A4', margin: 0 }}>{tip.game} · {tip.time}</p>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '600', color: tip.catColor, backgroundColor: `${tip.catColor}22`, padding: '3px 10px', borderRadius: '20px' }}>{tip.category}</span>
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>{tip.title}</h3>
            <p style={{ fontSize: '12px', color: '#8892A4', lineHeight: 1.6, marginBottom: '14px' }}>{tip.content}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#8892A4' }}>
              <span style={{ cursor: 'pointer' }}>👍 {tip.likes}</span>
              <span>💬 {tip.comments}</span>
              <span style={{ marginLeft: 'auto', cursor: 'pointer' }}>🔖</span>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}