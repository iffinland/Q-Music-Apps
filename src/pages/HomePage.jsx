// src/pages/HomePage.jsx - PARANDATUD JA PUHASTATUD
import React, { useState, useEffect } from 'react';
import MusicList from '../components/MusicList';

/* global qortalRequest */

function HomePage({ onSongSelect }) {
  const [latestSongs, setLatestSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Eraldasime asünkroonse loogika, aga hoiame selle useEffecti sees
    // See on tavaline ja korrektne muster
    async function fetchSongs() {
      setIsLoading(true);
      setError(null);

      if (typeof qortalRequest === 'undefined') {
        setError("Qortali API-t ei leitud.");
        setIsLoading(false);
        return;
      }

      try {
        const results = await qortalRequest({
          action: "SEARCH_QDN_RESOURCES",
          service: "AUDIO",
          includeMetadata: true,
          limit: 25,
          reverse: true,
          excludeBlocked: true
        });

        if (Array.isArray(results)) {
          const formatted = results.map(item => {
            let finalArtist = item.name || "Tundmatu Esitaja";
            if (item.metadata?.description?.includes('artist=')) {
              const artistMatch = item.metadata.description.match(/artist=([^;]+)/);
              if (artistMatch?.[1]) finalArtist = artistMatch[1].trim();
            }
            return {
              id: item.identifier,
              title: item.metadata?.title || item.identifier,
              artist: finalArtist,
              qdnData: { name: item.name, service: item.service, identifier: item.identifier },
              artworkUrl: `/thumbnail/${item.name}/${item.identifier}`
            };
          });
          setLatestSongs(formatted); // Nüüd on see korrektne
        } else {
          setLatestSongs([]);
        }

      } catch (e) {
        setError(`Viga andmete laadimisel: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSongs();
  }, []); // useEffecti sõltuvuste massiiv on tühi, see jookseb ainult korra

  const mockPlaylists = [
    { id: 'pl1', name: 'Suve Hitis', songCount: 12 },
    // ...
  ];

  return (
    <div className="homepage">
      <section className="horizontal-scroll-section">
        <h2>Populaarsed Lood (QDN)</h2>
        {isLoading && <p>Laen lugusid...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!isLoading && !error && latestSongs.length === 0 && <p>Lugusid ei leitud.</p>}
        {!isLoading && !error && latestSongs.length > 0 && (
          <MusicList
            songsData={latestSongs}
            onSongSelect={onSongSelect}
            listClassName="horizontal-music-list"
          />
        )}
      </section>
      
      <section className="horizontal-scroll-section">
        <h2>Populaarsed Playlistid</h2>
        {/* ... playlistide osa ... */}
      </section>
    </div>
  );
}
export default HomePage;