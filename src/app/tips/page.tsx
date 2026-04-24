'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { ThumbsUp, Lightbulb, Globe, X, ChevronRight } from 'lucide-react';
import { tipsService } from '@/services/tips.service';
import { Tip } from '@/types/tip.types';

const CAT_COLOR: Record<string, string> = {
  tip: '#60A5FA',
  estrategia: '#4ADE80',
  build: '#A78BFA',
  guia: '#FCD34D',
};

const CATEGORY_MAP: Record<string, string | null> = {
  todos:      null,
  tip:        'tip',
  estrategia: 'estrategia',
  build:      'build',
};

export default function TipsPage() {
  const [myTips, setMyTips]               = useState<Tip[]>([]);
  const [communityTips, setCommunityTips] = useState<Tip[]>([]);
  const [loading, setLoading]             = useState(true);
  const [loadingMy, setLoadingMy]         = useState(true);
  const [likingId, setLikingId]           = useState<number | null>(null);
  const [filter, setFilter]               = useState('todos');
  const [selectedTip, setSelectedTip]     = useState<Tip | null>(null);

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

  const filteredCommunity = communityTips.filter((t) => {
    const cat = CATEGORY_MAP[filter];
    if (!cat) return true;
    return t.category === cat;
  });

  const handleLike = async (tipId: number) => {
    if (likingId === tipId) return;
    setLikingId(tipId);
    try {
      const res = await tipsService.toggleLike(tipId);
      const delta = res.action === 'liked' ? 1 : -1;
      const update = (list: Tip[]) =>
        list.map((t) => t.id === tipId ? { ...t, likes_count: t.likes_count + delta } : t);
      setCommunityTips((prev) => update(prev));
      setMyTips((prev) => update(prev));
      setSelectedTip((prev) =>
        prev?.id === tipId ? { ...prev, likes_count: prev.likes_count + delta } : prev,
      );
    } catch { /* silencioso */ }
    finally { setLikingId(null); }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateStr; }
  };

  const TipCard = ({ tip, isMine = false }: { tip: Tip; isMine?: boolean }) => (
    <div style={{
      backgroundColor: '#0F1424',
      border: `1px solid ${isMine ? '#7C3AED44' : '#1E2540'}`,
      borderRadius: '12px', padding: '18px',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isMine && (
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#7C3AED',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700', color: '#FFFFFF', flexShrink: 0,
            }}>
              {tip.author_name?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            {!isMine && (
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>
                {tip.author_name || 'Usuario'}
              </p>
            )}
            <p style={{ fontSize: '11px', color: '#8892A4', margin: 0 }}>
              {tip.game_name || `Game ID: ${tip.game_id}`} · {formatDate(tip.created_at)}
            </p>
          </div>
        </div>
        {tip.category && (
          <span style={{
            fontSize: '11px', fontWeight: '600', flexShrink: 0,
            color: CAT_COLOR[tip.category] || '#8892A4',
            backgroundColor: `${CAT_COLOR[tip.category] || '#8892A4'}22`,
            padding: '3px 10px', borderRadius: '20px',
          }}>
            {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
          </span>
        )}
      </div>

      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>{tip.title}</h3>

      <p style={{
        fontSize: '12px', color: '#8892A4', lineHeight: 1.6, marginBottom: '12px',
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', flex: 1,
      }}>
        {tip.content}
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid #1E2540', paddingTop: '10px', marginTop: 'auto',
      }}>
        <button
          onClick={() => handleLike(tip.id)}
          disabled={likingId === tip.id}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', padding: 0,
            color: likingId === tip.id ? '#A78BFA' : '#8892A4',
            cursor: 'pointer', fontSize: '12px',
          }}
        >
          <ThumbsUp size={13} />
          <span>{tip.likes_count}</span>
        </button>
        <button
          onClick={() => setSelectedTip(tip)}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', padding: 0,
            color: '#A78BFA', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
          }}
        >
          Ver más <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );

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

      {/* Mis tips */}
      {loadingMy ? (
        <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>Cargando mis tips...</p>
      ) : myTips.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#A78BFA', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={13} /> Mis tips publicados ({myTips.length})
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {myTips.map((tip) => <TipCard key={tip.id} tip={tip} isMine />)}
          </div>
        </div>
      )}

      {/* Comunidad */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#8892A4', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe size={13} /> Tips de la comunidad
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { k: 'todos',      l: 'Todos' },
            { k: 'tip',        l: 'Tips' },
            { k: 'estrategia', l: 'Estrategias' },
            { k: 'build',      l: 'Builds' },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              style={{
                padding: '7px 16px', borderRadius: '20px',
                border: `1px solid ${filter === f.k ? '#7C3AED' : '#1E2540'}`,
                backgroundColor: filter === f.k ? '#7C3AED' : 'transparent',
                color: filter === f.k ? '#FFFFFF' : '#8892A4',
                fontSize: '12px', cursor: 'pointer',
              }}
            >
              {f.l}
            </button>
          ))}
        </div>

        {loading && <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>Cargando tips...</p>}

        {!loading && filteredCommunity.length === 0 && (
          <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>
            No hay {filter !== 'todos' ? `tips de categoría "${filter}"` : 'tips disponibles'} aún
          </p>
        )}

        {!loading && filteredCommunity.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {filteredCommunity.map((tip) => <TipCard key={tip.id} tip={tip} />)}
          </div>
        )}
      </div>

      {/* Modal Ver más */}
      {selectedTip && (
        <div
          onClick={() => setSelectedTip(null)}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0F1424', border: '1px solid #1E2540',
              borderRadius: '16px', width: '100%', maxWidth: '560px',
              maxHeight: '85vh', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #1E2540',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#7C3AED',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '700', color: '#FFFFFF', flexShrink: 0,
                }}>
                  {selectedTip.author_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
                    {selectedTip.author_name || 'Usuario'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#8892A4', margin: 0 }}>
                    {selectedTip.game_name || `Game ID: ${selectedTip.game_id}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTip(null)}
                style={{ background: 'none', border: 'none', color: '#8892A4', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                {selectedTip.category && (
                  <span style={{
                    fontSize: '12px', fontWeight: '600',
                    color: CAT_COLOR[selectedTip.category] || '#8892A4',
                    backgroundColor: `${CAT_COLOR[selectedTip.category] || '#8892A4'}22`,
                    padding: '4px 12px', borderRadius: '20px',
                  }}>
                    {selectedTip.category.charAt(0).toUpperCase() + selectedTip.category.slice(1)}
                  </span>
                )}
                <span style={{ fontSize: '11px', color: '#8892A4' }}>{formatDate(selectedTip.created_at)}</span>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', marginBottom: '16px', lineHeight: 1.3 }}>
                {selectedTip.title}
              </h2>

              <p style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.8, marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                {selectedTip.content}
              </p>

              {selectedTip.build && (
                <div style={{
                  backgroundColor: '#161B2E', border: '1px solid #7C3AED44',
                  borderRadius: '10px', padding: '16px', marginBottom: '20px',
                }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#A78BFA', marginBottom: '12px' }}>🎮 Build de campeón</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ backgroundColor: '#0F1424', borderRadius: '8px', padding: '10px 12px' }}>
                      <p style={{ fontSize: '11px', color: '#8892A4', margin: '0 0 4px' }}>Campeón</p>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{selectedTip.build.champion}</p>
                    </div>
                    {selectedTip.build.role && (
                      <div style={{ backgroundColor: '#0F1424', borderRadius: '8px', padding: '10px 12px' }}>
                        <p style={{ fontSize: '11px', color: '#8892A4', margin: '0 0 4px' }}>Rol</p>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{selectedTip.build.role}</p>
                      </div>
                    )}
                    {selectedTip.build.patch_version && (
                      <div style={{ backgroundColor: '#0F1424', borderRadius: '8px', padding: '10px 12px' }}>
                        <p style={{ fontSize: '11px', color: '#8892A4', margin: '0 0 4px' }}>Parche</p>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{selectedTip.build.patch_version}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px solid #1E2540', paddingTop: '16px' }}>
                <button
                  onClick={() => handleLike(selectedTip.id)}
                  disabled={likingId === selectedTip.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'none', border: '1px solid #1E2540',
                    borderRadius: '8px', padding: '8px 16px',
                    color: likingId === selectedTip.id ? '#A78BFA' : '#8892A4',
                    cursor: 'pointer', fontSize: '13px',
                  }}
                >
                  <ThumbsUp size={14} />
                  <span>{selectedTip.likes_count} {selectedTip.likes_count === 1 ? 'like' : 'likes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}