// src/pages/HomePage.jsx - PÄRIB PÄRIS ANDMEID QDN-ist
import React, { useState, useEffect } from 'react';
import MusicList from '../components/MusicList';

/* global qortalRequest */

function HomePage({ onSongSelect }) {
  const [latestSongs, setLatestSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSongsFromQDN = async () => {
      if (typeof qortalRequest === 'undefined') {
        setError("Qortali API pole kättesaadav.");
        setIsLoading(false);
        return;
      }
      try {
        const requestObject = {
          action: "SEARCH_QDN_RESOURCES",
          service: "AUDIO",
          // identifier: "earbump", // Otsime kõiki, mitte ainult earbump
          // prefix: true,
          includeMetadata: true,
          limit: 25,
          reverse: true,
          excludeBlocked: true,
        };
        const results = await qortalRequest(requestObject);

        if (Array.isArray(results) && results.length > 0) {
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
              qdnData: { name: item.name, service: item.service, identifier: item.identifier }
            };
          });
          setLatestSongs(formatted);
        } else {
          setLatestSongs([]);
        }
      } catch (e) {
        setError(`Viga andmete laadimisel: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSongsFromQDN();
  }, []);

  const renderContent = () => {
    if (isLoading) return <p>Laen lugusid QDN-ist...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (latestSongs.length === 0) return <p>Ei leidnud ühtegi lugu.</p>;
    return <MusicList songsData={latestSongs} onSongSelect={onSongSelect} listClassName="horizontal-music-list" />;
  };

  return (
    <div className="homepage">
      <section className="horizontal-scroll-section">
        <h2>Viimati Lisatud</h2>
        {renderContent()}
      </section>
      <section className="horizontal-scroll-section">
        <h2>Populaarsed Playlistid</h2>
        <p>(Playlistide funktsionaalsus on tulemas...)</p>
      </section>
    </div>
  );
}
export default HomePage;