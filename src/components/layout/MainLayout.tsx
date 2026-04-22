'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Gamepad2 } from 'lucide-react';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { isLoading } = useProtectedRoute();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D0F17' }}>
        <Gamepad2 size={40} color="#A78BFA" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0D0F17' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        {children}
      </main>
    </div>
  );
}