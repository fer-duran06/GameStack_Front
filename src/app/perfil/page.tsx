'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { usersService } from '@/services/users.service';
import { User, UserStats } from '@/types/user.types';
import { Zap, Trophy, Target, Calendar, Gamepad2, Flame, Medal, Star, BarChart2, Check } from 'lucide-react';

const achievements = [
  { icon: Trophy,   name: 'Primera Victoria',   desc: 'Gana tu primera partida',        unlocked: true  },
  { icon: Flame,    name: 'Racha de 5',         desc: 'Gana 5 partidas consecutivas',   unlocked: true  },
  { icon: Target,   name: 'Campeón de Torneo',  desc: 'Gana un torneo oficial',          unlocked: false },
  { icon: Medal,    name: 'Maestro de Tips',    desc: 'Publica 10 tips',                 unlocked: false },
  { icon: Star,     name: 'Top 10',             desc: 'Alcanza el top 10 del ranking',   unlocked: false },
  { icon: BarChart2,name: 'Estratega',          desc: 'Publica 5 estrategias',           unlocked: false },
];

export default function PerfilPage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats]     = useState<UserStats | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ name: '', biografia: '', riot_id: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');

  useEffect(() => {
    usersService.getMe()
      .then((res) => {
        setProfile(res.user);
        setStats(res.stats);
        setForm({ name: res.user.name, biografia: res.user.biografia || '', riot_id: res.user.riot_id || '' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      const res = await usersService.updateMe({ name: form.name || undefined, biografia: form.biografia || undefined, riot_id: form.riot_id || undefined });
      setProfile(res.user);
      setEditing(false);
      setMsg('Perfil actualizado');
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  };

  const inp: React.CSSProperties = { width: '100%', backgroundColor: '#0D0F17', border: '1px solid #1E2540', borderRadius: '8px', padding: '9px 12px', color: '#E2E8F0', fontSize: '13px' };

  if (loading) return <MainLayout><p style={{ color: '#8892A4', textAlign: 'center', padding: '40px' }}>Cargando perfil...</p></MainLayout>;
  if (!profile) return <MainLayout><p style={{ color: '#F87171', textAlign: 'center', padding: '40px' }}>No se pudo cargar el perfil</p></MainLayout>;

  return (
    <MainLayout>
      {/* Header */}
      <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: '#FFFFFF', border: '3px solid #A78BFA', flexShrink: 0 }}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>{profile.name}</h1>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#A78BFA', backgroundColor: '#7C3AED22', padding: '3px 10px', borderRadius: '20px' }}>
                {profile.role === 'admin' ? 'Admin' : 'Jugador'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#8892A4', margin: 0 }}>{profile.email}</p>
            {profile.riot_id && <p style={{ fontSize: '12px', color: '#A78BFA', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}><Gamepad2 size={12} /> Riot ID: {profile.riot_id}</p>}
            {profile.biografia && <p style={{ fontSize: '12px', color: '#8892A4', margin: '6px 0 0' }}>{profile.biografia}</p>}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setEditing(!editing); setMsg(''); }}
              style={{ padding: '9px 18px', backgroundColor: editing ? 'transparent' : '#7C3AED', border: `1px solid ${editing ? '#1E2540' : '#7C3AED'}`, borderRadius: '8px', color: editing ? '#8892A4' : '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              {editing ? 'Cancelar' : 'Editar Perfil'}
            </button>
            {editing && (
              <button onClick={handleSave} disabled={saving}
                style={{ padding: '9px 18px', backgroundColor: '#059669', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            )}
          </div>
        </div>

        {/* Formulario de edición */}
        {editing && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', paddingTop: '16px', borderTop: '1px solid #1E2540', marginTop: '4px' }}>
            <div><label style={{ display: 'block', fontSize: '11px', color: '#8892A4', marginBottom: '6px' }}>Nombre</label><input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} style={inp} /></div>
            <div><label style={{ display: 'block', fontSize: '11px', color: '#8892A4', marginBottom: '6px' }}>Riot ID</label><input value={form.riot_id} onChange={(e) => setForm(f => ({ ...f, riot_id: e.target.value }))} placeholder="Nombre#TAG" style={inp} /></div>
            <div><label style={{ display: 'block', fontSize: '11px', color: '#8892A4', marginBottom: '6px' }}>Biografía</label><input value={form.biografia} onChange={(e) => setForm(f => ({ ...f, biografia: e.target.value }))} placeholder="Cuéntanos sobre ti..." style={inp} /></div>
          </div>
        )}
        {msg && <p style={{ marginTop: '12px', fontSize: '12px', color: saving ? '#4ADE80' : '#F87171' }}>{msg}</p>}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', paddingTop: '20px', borderTop: '1px solid #1E2540', marginTop: editing ? '16px' : '0' }}>
          {[
            { icon: <Zap size={20} color="#A78BFA" />,      label: 'Partidas Jugadas', value: '—',                        color: '#A78BFA' },
            { icon: <Trophy size={20} color="#4ADE80" />,   label: 'Victorias',        value: '—',                        color: '#4ADE80' },
            { icon: <Target size={20} color="#60A5FA" />,   label: 'Win Rate',         value: '—',                        color: '#60A5FA' },
            { icon: <Calendar size={20} color="#FCD34D" />, label: 'Torneos',          value: stats?.torneos_jugados || '0', color: '#FCD34D' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>{s.icon}</span>
              <p style={{ fontSize: '22px', fontWeight: '800', color: s.color, margin: '0 0 4px' }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: '#8892A4', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Medal size={16} color="#FCD34D" /> Logros</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {achievements.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', backgroundColor: a.unlocked ? '#7C3AED22' : '#161B2E', borderRadius: '10px', border: `1px solid ${a.unlocked ? '#7C3AED44' : '#1E2540'}`, opacity: a.unlocked ? 1 : 0.6 }}>
              <span style={{ opacity: a.unlocked ? 1 : 0.4 }}><a.icon size={24} color={a.unlocked ? '#A78BFA' : '#6B7280'} /></span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{a.name}</p>
                <p style={{ fontSize: '11px', color: '#8892A4', margin: '2px 0 0' }}>{a.desc}</p>
              </div>
              {a.unlocked && <span style={{ fontSize: '11px', color: '#4ADE80', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> Desbloqueado</span>}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}