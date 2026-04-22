'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { ThumbsUp, MessageCircle, Bookmark, Lightbulb, Globe } from 'lucide-react';

interface MyTip {
  id: number;
  game_id: number;
  title: string;
  content: string;
  category?: string;
  likes_count: number;
  created_at: string;
}

const CAT_COLOR: Record<string, string> = {
  tip: '#60A5FA', estrategia: '#4ADE80', build: '#A78BFA', guia: '#FCD34D',
};

const mockTips = [
  { id: 'm1', author: 'ZedMaster',   game: 'League of Legends', title: 'Build Lethality Zed para One-Shot',    content: 'Maximiza tu daño con esta build optimizada para eliminar carries en mid-late game. Incluye runas, items y combo recomendado.', category: 'Build',      catColor: '#A78BFA', likes: 234, comments: 45, time: 'hace 2 horas' },
  { id: 'm2', author: 'TacticalPro', game: 'Valorant',           title: 'Estrategia de Defensa en Haven',       content: 'Aprende a defender efectivamente los 3 sites de Haven con rotaciones optimizadas y posicionamiento clave para cada agente.', category: 'Estrategia', catColor: '#4ADE80', likes: 189, comments: 32, time: 'hace 5 horas' },
  { id: 'm3', author: 'ChessMentor', game: 'Chess',              title: 'Apertura Italiana para Principiantes', content: 'Una apertura sólida y fácil de aprender que te dará ventaja en las primeras jugadas. Ideal para comenzar.',                  category: 'Tip',        catColor: '#60A5FA', likes: 156, comments: 28, time: 'hace 8 horas' },
  { id: 'm4', author: 'SupportKing', game: 'League of Legends',  title: 'Tank Thresh Support Build',            content: 'Build tanque para Thresh que te permite proteger a tu carry mientras inicias peleas. Perfecto para soloQ.',                 category: 'Build',      catColor: '#A78BFA', likes: 198, comments: 41, time: 'hace 12 horas' },
];

export default function TipsPage() {
  const [myTips, setMyTips] = useState<MyTip[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('gamecenter_my_tips');
    if (saved) {
      try { setMyTips(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

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

      {/* ── Mis tips publicados ── */}
      {myTips.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#A78BFA', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={13} /> Mis tips publicados ({myTips.length})
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {myTips.map((tip) => (
              <div key={tip.id} style={{ backgroundColor: '#0F1424', border: '1px solid #7C3AED44', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#8892A4' }}>Game ID: {tip.game_id}</span>
                    <span style={{ fontSize: '10px', color: '#8892A4' }}>· {formatDate(tip.created_at)}</span>
                  </div>
                  {tip.category && (
                    <span style={{ fontSize: '11px', fontWeight: '600', color: CAT_COLOR[tip.category] || '#8892A4', backgroundColor: `${CAT_COLOR[tip.category] || '#8892A4'}22`, padding: '3px 10px', borderRadius: '20px' }}>
                      {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>{tip.title}</h3>
                <p style={{ fontSize: '12px', color: '#8892A4', lineHeight: 1.6, marginBottom: '12px' }}>{tip.content}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#8892A4', borderTop: '1px solid #1E2540', paddingTop: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ThumbsUp size={12} /> {tip.likes_count}</span>
                  <span style={{ fontSize: '11px', color: '#A78BFA' }}>ID: {tip.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tips de la comunidad (mock) ── */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#8892A4', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe size={13} /> Tips de la comunidad
        </p>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['Todos', 'Tips', 'Estrategias', 'Builds'].map((f, i) => (
            <button key={f} style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${i === 0 ? '#7C3AED' : '#1E2540'}`, backgroundColor: i === 0 ? '#7C3AED' : 'transparent', color: i === 0 ? '#FFFFFF' : '#8892A4', fontSize: '12px', cursor: 'pointer' }}>{f}</button>
          ))}
        </div>

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
                <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><ThumbsUp size={12} /> {tip.likes}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageCircle size={12} /> {tip.comments}</span>
                <span style={{ marginLeft: 'auto', cursor: 'pointer' }}><Bookmark size={12} /></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}