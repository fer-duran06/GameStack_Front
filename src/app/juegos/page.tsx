'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { gamesService } from '@/services/games.service';
import { RAWGGame } from '@/types/game.types';

export default function JuegosPage() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<RAWGGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]     = useState('');

  const handleSearch = async () => {
    if (query.trim().length < 2) { setError('Escribe al menos 2 caracteres'); return; }
    setError(''); setLoading(true); setSearched(true);
    try {
      const res = await gamesService.search(query);
      setResults(res.results);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al buscar');
    } finally { setLoading(false); }
  };

  const handleRegister = async (game: RAWGGame) => {
    try {
      await gamesService.create({ name: game.name, image_url: game.image_url, rawg_id: game.rawg_id });
      alert(`✅ "${game.name}" registrado exitosamente`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al registrar');
    }
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Juegos</h1>
          <p style={{ fontSize: '14px', color: '#8892A4' }}>Explora y gestiona todos los juegos disponibles</p>
        </div>
      </div>

      {/* Buscador RAWG */}
      <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: '#8892A4', marginBottom: '12px' }}>
          🔍 Busca un juego en RAWG y regístralo en la plataforma
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar juegos... (ej: League of Legends)"
            style={{ flex: 1, backgroundColor: '#161B2E', border: '1.5px solid #1E2540', borderRadius: '8px', padding: '10px 14px', color: '#E2E8F0', fontSize: '13px' }} />
          <button onClick={handleSearch} disabled={loading}
            style={{ padding: '10px 20px', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        {error && <p style={{ marginTop: '10px', fontSize: '12px', color: '#F87171' }}>{error}</p>}
      </div>

      {/* Resultados */}
      {searched && !loading && results.length === 0 && (
        <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>No se encontraron resultados para "{query}"</p>
      )}

      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {results.map((game) => (
            <div key={game.rawg_id} style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ height: '140px', backgroundImage: game.image_url ? `url(${game.image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#161B2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!game.image_url && <span style={{ fontSize: '36px' }}>🎮</span>}
              </div>
              <div style={{ padding: '14px' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '12px' }}>{game.name}</p>
                <button onClick={() => handleRegister(game)}
                  style={{ width: '100%', padding: '8px 0', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  + Registrar en plataforma
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!searched && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#8892A4' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
          <p style={{ fontSize: '15px' }}>Busca un juego para comenzar</p>
          <p style={{ fontSize: '12px', marginTop: '6px' }}>Powered by RAWG.io</p>
        </div>
      )}
    </MainLayout>
  );
}