// src/pages/BrowseSongsPage.jsx - PÄRIS ANDMETEGA, PAGINEERIMISE JA FILTRIGA
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MusicList from '../components/MusicList';

/* global qortalRequest */

function BrowseSongsPage({ onSongSelect = () => {} }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Olekud
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Loeme parameetrid URL-ist või kasutame vaikeväärtusi
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentLetter = searchParams.get('letter') || 'ALL';
  const limit = 50; // Mitu laulu lehel

  useEffect(() => {
    const fetchPaginatedSongs = async () => {
      setIsLoading(true);
      setError(null);
      setSongs([]);

      if (typeof qortalRequest === 'undefined') {
        setError("Qortali API pole kättesaadav. See rakendus töötab ainult Qortali keskkonnas.");
        setIsLoading(false);
        return;
      }

      try {
        const offset = (currentPage - 1) * limit;
        
        const requestObject = {
          action: "SEARCH_QDN_RESOURCES",
          service: "AUDIO",
          includeMetadata: true,
          limit: limit,
          offset: offset,
          reverse: true,
          excludeBlocked: true,
        };

        // Lisame tähefiltri parameetrid, kui täht on valitud
        if (currentLetter !== 'ALL') {
          requestObject.name = currentLetter;
          requestObject.prefix = true;
          requestObject.exactMatchNames = false;
        }

        console.log("Saadan QDN-i päringu:", requestObject);
        const results = await qortalRequest(requestObject);
        console.log("Sain QDN-ist vastuseks:", results);

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
          setSongs(formatted);
        } else {
          setSongs([]);
        }
      } catch (e) {
        console.error("Laulude pärimisel tekkis viga:", e);
        setError(`Viga andmete laadimisel: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaginatedSongs();
  }, [currentPage, currentLetter]); // Sõltuvused

  // Navigeerimisfunktsioonid
  const handlePageChange = (newPage) => {
    if (newPage >= 1) {
      setSearchParams({ page: newPage.toString(), letter: currentLetter });
    }
  };
  const handleLetterChange = (newLetter) => {
    setSearchParams({ page: '1', letter: newLetter });
  };

  const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  return (
    <div className="page-container browse-page">
      <h2>Sirvi Kõiki Lugusid</h2>

      <div className="alphabet-filter">
        {alphabet.map(letter => (
          <button
            key={letter}
            className={currentLetter === letter ? 'active' : ''}
            onClick={() => handleLetterChange(letter)}
            disabled={isLoading}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="browse-results">
        {isLoading && <p>Laen lugusid...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!isLoading && !error && songs.length === 0 && <p>Selle valikuga laule ei leitud.</p>}
        {!isLoading && !error && songs.length > 0 && (
          <MusicList songsData={songs} onSongSelect={onSongSelect} listClassName="song-grid" />
        )}
      </div>

      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading}>
          « Eelmine
        </button>
        <span>Leht {currentPage}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={songs.length < limit || isLoading}>
          Järgmine »
        </button>
      </div>
    </div>
  );
}

export default BrowseSongsPage;