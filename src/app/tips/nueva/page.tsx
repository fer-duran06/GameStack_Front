'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { tipsService } from '@/services/tips.service';

const inp: React.CSSProperties = { width: '100%', backgroundColor: '#161B2E', border: '1.5px solid #1E2540', borderRadius: '8px', padding: '10px 14px', color: '#E2E8F0', fontSize: '13px' };
const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#E2E8F0', marginBottom: '6px' };

export default function NuevoTipPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ game_id: '', title: '', content: '', category: '', isBuild: false, champion: '', role: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.game_id || !form.title || !form.content) { setError('Juego, título y contenido son obligatorios'); return; }
    setLoading(true); setError('');
    try {
      await tipsService.create({
        game_id: parseInt(form.game_id), title: form.title, content: form.content,
        category: form.category || undefined,
        build: form.isBuild && form.champion ? { champion: form.champion, role: form.role, items: {}, runes: {} } : undefined,
      });
      router.push('/tips');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al publicar');
    } finally { setLoading(false); }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Publicar tip o estrategia</h1>
          <p style={{ fontSize: '14px', color: '#8892A4' }}>Comparte tus conocimientos con la comunidad</p>
        </div>
        <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label style={lbl}>ID del juego *</label><input value={form.game_id} onChange={(e) => set('game_id', e.target.value)} type="number" placeholder="Ej: 1" style={inp} /></div>
            <div>
              <label style={lbl}>Categoría</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} style={inp}>
                <option value="">Seleccionar...</option>
                <option value="tip">Tip</option>
                <option value="estrategia">Estrategia</option>
                <option value="build">Build</option>
                <option value="guia">Guía</option>
              </select>
            </div>
          </div>
          <div><label style={lbl}>Título *</label><input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ej: Build Jinx ADC Crit" style={inp} /></div>
          <div><label style={lbl}>Contenido *</label><textarea value={form.content} onChange={(e) => set('content', e.target.value)} rows={6} placeholder="Escribe tu tip, estrategia o guía en detalle..." style={{ ...inp, resize: 'vertical' }} /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isBuild} onChange={(e) => set('isBuild', e.target.checked)} />
            <span style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: '600' }}>¿Incluir build de campeón? (solo LoL)</span>
          </label>
          {form.isBuild && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', backgroundColor: '#161B2E', borderRadius: '8px', border: '1px solid #1E2540' }}>
              <div><label style={lbl}>Campeón * (en inglés)</label><input value={form.champion} onChange={(e) => set('champion', e.target.value)} placeholder="Ej: Jinx" style={inp} /></div>
              <div><label style={lbl}>Rol</label><input value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Ej: ADC" style={inp} /></div>
              <p style={{ gridColumn: '1/-1', fontSize: '11px', color: '#FCD34D' }}>⚠️ El nombre debe ser exactamente como aparece en el juego (ej: "Jinx", "LeBlanc")</p>
            </div>
          )}
          {error && <p style={{ fontSize: '12px', color: '#F87171' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => router.back()} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #1E2540', borderRadius: '8px', color: '#8892A4', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              {loading ? 'Publicando...' : '💡 Publicar tip'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}