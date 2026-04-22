'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { gamesService } from '@/services/games.service';
import { RAWGGame } from '@/types/game.types';

export default function JuegosPage() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<RAWGGame[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]       = useState('');
  const [registeredGames, setRegisteredGames] = useState<{ name: string; id: number }[]>([]);

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
      const res = await gamesService.create({ name: game.name, image_url: game.image_url, rawg_id: game.rawg_id });
      const id = res.game?.id || res.gameId;
      if (id) {
        setRegisteredGames((prev) => [...prev, { name: game.name, id }]);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al registrar');
    }
  };

  return (
    <MainLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Juegos</h1>
        <p style={{ fontSize: '14px', color: '#8892A4' }}>Explora y gestiona todos los juegos disponibles</p>
      </div>

      {/* Juegos registrados en esta sesión */}
      {registeredGames.length > 0 && (
        <div style={{ backgroundColor: '#052e16', border: '1px solid #16a34a', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#4ADE80', marginBottom: '10px' }}>
            ✅ Juegos registrados — guarda estos IDs para crear partidas y torneos
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {registeredGames.map((g, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0a3d20', borderRadius: '8px', padding: '8px 14px' }}>
                <span style={{ fontSize: '12px', color: '#E2E8F0' }}>{g.name}</span>
                <span style={{ marginLeft: 'auto', backgroundColor: '#7C3AED', color: '#FFFFFF', fontSize: '12px', fontWeight: '700', padding: '3px 12px', borderRadius: '20px' }}>
                  ID: {g.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buscador RAWG */}
      <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: '#8892A4', marginBottom: '12px' }}>
          🔍 Busca un juego en RAWG y regístralo en la plataforma
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar juegos... (ej: League of Legends)"
            style={{ flex: 1, backgroundColor: '#161B2E', border: '1.5px solid #1E2540', borderRadius: '8px', padding: '10px 14px', color: '#E2E8F0', fontSize: '13px' }} />
          <button onClick={handleSearch} disabled={loading}
            style={{ padding: '10px 20px', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        {error && <p style={{ marginTop: '10px', fontSize: '12px', color: '#F87171' }}>{error}</p>}
      </div>

      {/* Sin resultados */}
      {searched && !loading && results.length === 0 && (
        <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>
          No se encontraron resultados para "{query}"
        </p>
      )}

      {/* Resultados */}
      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {results.map((game) => {
            const alreadyRegistered = registeredGames.find((g) => g.name === game.name);
            return (
              <div key={game.rawg_id} style={{ backgroundColor: '#0F1424', border: `1px solid ${alreadyRegistered ? '#16a34a' : '#1E2540'}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '140px', backgroundImage: game.image_url ? `url(${game.image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#161B2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!game.image_url && <span style={{ fontSize: '36px' }}>🎮</span>}
                </div>
                <div style={{ padding: '14px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '12px' }}>{game.name}</p>
                  {alreadyRegistered ? (
                    <div style={{ width: '100%', padding: '8px 0', backgroundColor: '#16a34a22', border: '1px solid #16a34a', borderRadius: '8px', color: '#4ADE80', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>
                      ✓ Registrado — ID: {alreadyRegistered.id}
                    </div>
                  ) : (
                    <button onClick={() => handleRegister(game)}
                      style={{ width: '100%', padding: '8px 0', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                      + Registrar en plataforma
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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