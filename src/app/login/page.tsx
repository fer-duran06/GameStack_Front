'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { Gamepad2, Swords, Trophy, Lightbulb, BarChart2, User, Mail, Lock } from 'lucide-react';

type Tab = 'login' | 'register';

export default function LoginPage() {
  const [tab, setTab]         = useState<Tab>('login');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const router     = useRouter();

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Completa todos los campos'); return; }
    if (tab === 'register' && !name) { setError('El nombre es obligatorio'); return; }
    setLoading(true);
    try {
      const res = tab === 'login'
        ? await authService.login({ email, password })
        : await authService.register({ name, email, password });
      login(res.token, res.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  const inp: React.CSSProperties = { flex: 1, background: 'transparent', border: 'none', color: '#E2E8F0', fontSize: '13px' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0D0F17' }}>

      {/* ── Formulario ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}><Gamepad2 size={48} color="#A78BFA" /></div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 6px' }}>GameCenter</h1>
          <p style={{ fontSize: '14px', color: '#8892A4' }}>Partidas · Torneos · Comunidad</p>
        </div>

        <div style={{ width: '100%', maxWidth: '360px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', backgroundColor: '#161B2E', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
            {(['login', 'register'] as Tab[]).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                style={{ flex: 1, padding: '9px 0', borderRadius: '8px', border: 'none', backgroundColor: tab === t ? '#7C3AED' : 'transparent', color: tab === t ? '#FFFFFF' : '#8892A4', fontSize: '13px', fontWeight: tab === t ? '600' : '400', cursor: 'pointer' }}>
                {t === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {/* Campos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {tab === 'register' && <Field label="Nombre" icon={<User size={15} color="#8892A4" />} type="text"     value={name}     onChange={setName}  placeholder="Tu nombre" inp={inp} />}
            <Field label="Correo electrónico"  icon={<Mail size={15} color="#8892A4" />} type="email"    value={email}    onChange={setEmail} placeholder="tu@email.com" inp={inp} />
            <Field label="Contraseña"          icon={<Lock size={15} color="#8892A4" />} type="password" value={password} onChange={setPass}  placeholder="••••••••"     inp={inp} onEnter={handleSubmit} />
          </div>

          {error && <p style={{ marginTop: '12px', fontSize: '12px', color: '#F87171', textAlign: 'center' }}>{error}</p>}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', marginTop: '20px', padding: '13px 0', backgroundColor: loading ? '#4C1D95' : '#7C3AED', border: 'none', borderRadius: '10px', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Cargando...' : tab === 'login' ? 'Iniciar Sesión' : 'Crear cuenta'}
          </button>

        </div>
      </div>

      {/* ── Panel decorativo ── */}
      <div style={{ width: '380px', backgroundColor: '#0F1424', borderLeft: '1px solid #1E2540', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', marginBottom: '28px' }}>¿Por qué GameCenter?</h2>
        {[
          { icon: <Swords size={22} color="#A78BFA" />,    title: 'Partidas organizadas',   desc: 'Crea y únete a partidas de cualquier juego' },
          { icon: <Trophy size={22} color="#FCD34D" />,    title: 'Torneos competitivos',   desc: 'Brackets generados automáticamente' },
          { icon: <Lightbulb size={22} color="#4ADE80" />, title: 'Tips y builds',          desc: 'Comparte estrategias con la comunidad' },
          { icon: <BarChart2 size={22} color="#60A5FA" />, title: 'Rankings dinámicos',     desc: 'Clasificaciones quincenales y mensuales' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '20px', alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#E2E8F0', marginBottom: '3px' }}>{item.title}</p>
              <p style={{ fontSize: '12px', color: '#8892A4', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

function Field({ label, icon, type, value, onChange, placeholder, inp, onEnter }: {
  label: string; icon: React.ReactNode; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  inp: React.CSSProperties; onEnter?: () => void;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8892A4', marginBottom: '6px' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#161B2E', border: '1.5px solid #1E2540', borderRadius: '8px', padding: '10px 14px' }}>
        {icon}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && onEnter?.()} style={inp} />
      </div>
    </div>
  );
}