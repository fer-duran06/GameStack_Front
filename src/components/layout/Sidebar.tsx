'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Home, Gamepad2, Swords, Trophy, Lightbulb, BarChart2, User } from 'lucide-react';

const navItems = [
  { href: '/dashboard',  label: 'Inicio',            icon: Home },
  { href: '/juegos',     label: 'Juegos',             icon: Gamepad2 },
  { href: '/partidas',   label: 'Partidas',           icon: Swords },
  { href: '/torneos',    label: 'Torneos',            icon: Trophy },
  { href: '/tips',       label: 'Tips & Estrategias', icon: Lightbulb },
  { href: '/rankings',   label: 'Rankings',           icon: BarChart2 },
  { href: '/perfil',     label: 'Perfil',             icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside style={{ width: '240px', minHeight: '100vh', backgroundColor: '#0F1218', borderRight: '1px solid #1E2540', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1E2540' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Gamepad2 size={24} color="#A78BFA" />
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF' }}>GameCenter</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '11px 20px', margin: '2px 10px', borderRadius: '8px',
              textDecoration: 'none', fontSize: '14px',
              fontWeight: isActive ? '600' : '400',
              color: isActive ? '#FFFFFF' : '#8892A4',
              backgroundColor: isActive ? '#7C3AED' : 'transparent',
              transition: 'all 0.15s ease',
            }}>
              <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1E2540', padding: '16px 20px' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#FFFFFF', flexShrink: 0 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
              <p style={{ fontSize: '11px', color: '#8892A4', margin: 0 }}>{user.role === 'admin' ? 'Admin' : 'Jugador'}</p>
            </div>
          </div>
        )}

        <Link href="/partidas/nueva" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px 0', backgroundColor: '#7C3AED', borderRadius: '8px', textDecoration: 'none', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
          + Crear Partida
        </Link>

        <button onClick={handleLogout} style={{ width: '100%', padding: '8px 0', backgroundColor: 'transparent', border: '1px solid #1E2540', borderRadius: '8px', color: '#8892A4', fontSize: '13px', cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}