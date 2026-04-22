'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { ThumbsUp, MessageCircle, Bookmark, Lightbulb, Globe } from 'lucide-react';
import { tipsService } from '@/services/tips.service';
import { Tip } from '@/types/tip.types';

const CAT_COLOR: Record<string, string> = {
  tip: '#60A5FA', estrategia: '#4ADE80', build: '#A78BFA', guia: '#FCD34D',
};

export default function TipsPage() {
  const [myTips, setMyTips] = useState<Tip[]>([]);
  const [communityTips, setCommunityTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMy, setLoadingMy] = useState(true);
  const [likingId, setLikingId] = useState<number | null>(null);

  useEffect(() => {
    tipsService.getMy()
      .then((res) => setMyTips(res.tips))
      .catch(() => {})
      .finally(() => setLoadingMy(false));

    tipsService.getAll()
      .then((res) => setCommunityTips(res.tips))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLike = async (tipId: number) => {
    if (likingId === tipId) return;
    setLikingId(tipId);
    try {
      const res = await tipsService.toggleLike(tipId);
      const delta = res.action === 'liked' ? 1 : -1;
      setCommunityTips((prev) =>
        prev.map((t) => t.id === tipId ? { ...t, likes_count: t.likes_count + delta } : t)
      );
      setMyTips((prev) =>
        prev.map((t) => t.id === tipId ? { ...t, likes_count: t.likes_count + delta } : t)
      );
    } catch {
      // silencioso
    } finally {
      setLikingId(null);
    }
  };

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
      {loadingMy ? (
        <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>Cargando mis tips...</p>
      ) : myTips.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#A78BFA', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={13} /> Mis tips publicados ({myTips.length})
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {myTips.map((tip) => (
              <div key={tip.id} style={{ backgroundColor: '#0F1424', border: '1px solid #7C3AED44', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#8892A4' }}>Game: {tip.game_name || `ID ${tip.game_id}`}</span>
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
                  <button
                    onClick={() => handleLike(tip.id)}
                    disabled={likingId === tip.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#8892A4', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                  >
                    <ThumbsUp size={12} /> {tip.likes_count}
                  </button>
                  <span style={{ fontSize: '11px', color: '#A78BFA' }}>ID: {tip.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tips de la comunidad ── */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#8892A4', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe size={13} /> Tips de la comunidad
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['Todos', 'Tips', 'Estrategias', 'Builds'].map((f, i) => (
            <button key={f} style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${i === 0 ? '#7C3AED' : '#1E2540'}`, backgroundColor: i === 0 ? '#7C3AED' : 'transparent', color: i === 0 ? '#FFFFFF' : '#8892A4', fontSize: '12px', cursor: 'pointer' }}>{f}</button>
          ))}
        </div>

        {loading && <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>Cargando tips...</p>}
        {!loading && communityTips.length === 0 && (
          <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>No hay tips disponibles aún</p>
        )}

        {!loading && communityTips.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {communityTips.map((tip) => (
              <div key={tip.id} style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>
                      {tip.author_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{tip.author_name || 'Usuario'}</p>
                      <p style={{ fontSize: '11px', color: '#8892A4', margin: 0 }}>{tip.game_name || `Game ID: ${tip.game_id}`} · {formatDate(tip.created_at)}</p>
                    </div>
                  </div>
                  {tip.category && (
                    <span style={{ fontSize: '11px', fontWeight: '600', color: CAT_COLOR[tip.category] || '#8892A4', backgroundColor: `${CAT_COLOR[tip.category] || '#8892A4'}22`, padding: '3px 10px', borderRadius: '20px' }}>
                      {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>{tip.title}</h3>
                <p style={{ fontSize: '12px', color: '#8892A4', lineHeight: 1.6, marginBottom: '14px' }}>{tip.content}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#8892A4' }}>
                  <button
                    onClick={() => handleLike(tip.id)}
                    disabled={likingId === tip.id}
                    style={{
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      background: 'none', border: 'none', padding: 0,
                      color: likingId === tip.id ? '#A78BFA' : '#8892A4',
                      fontSize: '12px', transition: 'color 0.15s',
                    }}
                  >
                    <ThumbsUp size={12} /> {tip.likes_count}
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageCircle size={12} /> 0</span>
                  <span style={{ marginLeft: 'auto', cursor: 'pointer' }}><Bookmark size={12} /></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}