'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { gamesService } from '@/services/games.service';
import { RAWGGame } from '@/types/game.types';

interface RegisteredGame {
  id: number;
  name: string;
  image_url: string;
}

export default function JuegosPage() {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState<RAWGGame[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [registeredGames, setRegisteredGames] = useState<RegisteredGame[]>([]);

  // Cargar juegos guardados del localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem('gamecenter_registered_games');
    if (saved) {
      try { setRegisteredGames(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Guardar en localStorage cada vez que cambia la lista
  const saveGames = (games: RegisteredGame[]) => {
    localStorage.setItem('gamecenter_registered_games', JSON.stringify(games));
    setRegisteredGames(games);
  };

  const handleSearch = async () => {
    if (query.trim().length < 2) { setError('Escribe al menos 2 caracteres'); return; }
    setError(''); setLoading(true); setIsSearching(true);
    try {
      const res = await gamesService.search(query);
      setResults(res.results);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al buscar');
    } finally { setLoading(false); }
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
    setError('');
  };

  const handleRegister = async (game: RAWGGame) => {
    try {
      const res = await gamesService.create({ name: game.name, image_url: game.image_url, rawg_id: game.rawg_id });
      const id = res.game?.id || res.gameId;
      if (id) {
        const alreadyExists = registeredGames.find((g) => g.id === id);
        if (!alreadyExists) {
          const updated = [...registeredGames, { id, name: game.name, image_url: game.image_url }];
          saveGames(updated);
        }
        handleClearSearch();
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al registrar');
    }
  };

  const handleRemove = (id: number) => {
    const updated = registeredGames.filter((g) => g.id !== id);
    saveGames(updated);
  };

  const alreadyRegisteredIds = new Set(registeredGames.map((g) => g.id));

  return (
    <MainLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Juegos</h1>
          <p style={{ fontSize: '14px', color: '#8892A4' }}>Explora y gestiona todos los juegos disponibles</p>
        </div>
        {!isSearching && (
          <button onClick={() => setIsSearching(true)}
            style={{ padding: '10px 18px', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            + Registrar Juego
          </button>
        )}
      </div>

      {/* ── MODO BÚSQUEDA ── */}
      {isSearching && (
        <>
          <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', color: '#8892A4', marginBottom: '12px' }}>
              🔍 Busca un juego en RAWG y regístralo en la plataforma
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar juegos... (ej: League of Legends)"
                autoFocus
                style={{ flex: 1, backgroundColor: '#161B2E', border: '1.5px solid #1E2540', borderRadius: '8px', padding: '10px 14px', color: '#E2E8F0', fontSize: '13px' }} />
              <button onClick={handleSearch} disabled={loading}
                style={{ padding: '10px 20px', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
              <button onClick={handleClearSearch}
                style={{ padding: '10px 16px', backgroundColor: 'transparent', border: '1px solid #1E2540', borderRadius: '8px', color: '#8892A4', fontSize: '13px', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
            {error && <p style={{ marginTop: '10px', fontSize: '12px', color: '#F87171' }}>{error}</p>}
          </div>

          {/* Resultados de búsqueda */}
          {loading && <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>Buscando juegos...</p>}

          {!loading && results.length === 0 && query.length >= 2 && (
            <p style={{ color: '#8892A4', textAlign: 'center', padding: '32px' }}>No se encontraron resultados para "{query}"</p>
          )}

          {!loading && results.length === 0 && query.length < 2 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#8892A4' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
              <p style={{ fontSize: '15px' }}>Busca un juego para comenzar</p>
              <p style={{ fontSize: '12px', marginTop: '6px' }}>Powered by RAWG.io</p>
            </div>
          )}

          {results.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {results.map((game) => {
                const already = alreadyRegisteredIds.has(
                  registeredGames.find((g) => g.name === game.name)?.id ?? -1
                );
                return (
                  <div key={game.rawg_id} style={{ backgroundColor: '#0F1424', border: `1px solid ${already ? '#16a34a' : '#1E2540'}`, borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ height: '140px', backgroundImage: game.image_url ? `url(${game.image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#161B2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {!game.image_url && <span style={{ fontSize: '36px' }}>🎮</span>}
                    </div>
                    <div style={{ padding: '14px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '12px' }}>{game.name}</p>
                      {already ? (
                        <div style={{ width: '100%', padding: '8px 0', backgroundColor: '#16a34a22', border: '1px solid #16a34a', borderRadius: '8px', color: '#4ADE80', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>
                          ✓ Ya registrado
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
        </>
      )}

      {/* ── MODO MIS JUEGOS ── */}
      {!isSearching && (
        <>
          {registeredGames.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#8892A4' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎮</div>
              <p style={{ fontSize: '18px', fontWeight: '600', color: '#E2E8F0', marginBottom: '8px' }}>No tienes juegos registrados aún</p>
              <p style={{ fontSize: '14px', marginBottom: '24px' }}>Registra juegos para poder crear partidas y torneos</p>
              <button onClick={() => setIsSearching(true)}
                style={{ padding: '12px 24px', backgroundColor: '#7C3AED', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                + Registrar mi primer juego
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {registeredGames.map((game) => (
                <div key={game.id} style={{ backgroundColor: '#0F1424', border: '1px solid #1E2540', borderRadius: '12px', overflow: 'hidden' }}>
                  {/* Imagen */}
                  <div style={{ height: '140px', backgroundImage: game.image_url ? `url(${game.image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#161B2E', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {!game.image_url && <span style={{ fontSize: '36px' }}>🎮</span>}
                    {/* Badge ID */}
                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#7C3AED', color: '#FFFFFF', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>
                      ID: {game.id}
                    </span>
                  </div>
                  <div style={{ padding: '14px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>{game.name}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#8892A4' }}>Usa ID <span style={{ color: '#A78BFA', fontWeight: '700' }}>{game.id}</span> en partidas y torneos</span>
                      <button onClick={() => handleRemove(game.id)}
                        style={{ background: 'none', border: 'none', color: '#F87171', fontSize: '11px', cursor: 'pointer', padding: '2px 6px' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}