import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MusicList from '../components/MusicList';
import Pagination from '../components/Pagination';
import PlatformFilter from '../components/PlatformFilter';

/* global qortalRequest */

function BrowseSongsPage({ onSongSelect, onAddToPlaylistClick }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalSongs, setTotalSongs] = useState(0);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentLetter = searchParams.get('letter') || 'ALL';
  const currentPlatform = searchParams.get('platform') || 'all';
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchPaginatedSongs = async () => {
      setIsLoading(true);
      setError(null);

      if (typeof qortalRequest === 'undefined') {
        setError("Qortal API not available.");
        setIsLoading(false);
        return;
      }

      try {
        // 1. Esmalt hankime koguste info (ilma offset/limit'ta)
        const countRequestObject = {
          action: "SEARCH_QDN_RESOURCES",
          service: "AUDIO",
          limit: 1000, // Suur number, et saada koguarvuks võimalikult täpne tulem
        };

        if (currentLetter !== 'ALL') {
          countRequestObject.name = currentLetter;
          countRequestObject.prefix = true;
          countRequestObject.exactMatchNames = false;
        }

        // Platform filter for count
        if (currentPlatform === 'qmusic') {
          // Otsime nii qmusic_song_ kui ka qmusic_track_ (praegu kasutame qmusic_track_)
          countRequestObject.identifier = 'qmusic_';
          countRequestObject.prefix = true;
        } else if (currentPlatform === 'earbump') {
          countRequestObject.identifier = 'earbump_';
          countRequestObject.prefix = true;
        }

        const countResults = await qortalRequest(countRequestObject);
        const totalCount = Array.isArray(countResults) ? countResults.length : 0;
        setTotalSongs(totalCount);

        // 2. Siis hankime tegelikud tulemused paginatsiooniga
        const requestObject = {
          action: "SEARCH_QDN_RESOURCES",
          service: "AUDIO",
          includeMetadata: true,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
          reverse: true
        };

        if (currentLetter !== 'ALL') {
          requestObject.name = currentLetter;
          requestObject.prefix = true;
          requestObject.exactMatchNames = false;
        }

        // Platform filter for actual results
        if (currentPlatform === 'qmusic') {
          requestObject.identifier = 'qmusic_';
          requestObject.prefix = true;
        } else if (currentPlatform === 'earbump') {
          requestObject.identifier = 'earbump_';
          requestObject.prefix = true;
        }

        const results = await qortalRequest(requestObject);

        if (Array.isArray(results)) {
          const formatted = results.map(item => {
            let artist = item.name || "Unknown";
            const description = item.metadata?.description;

            if (description?.includes("artist=")) {
              const match = description.match(/artist=([^;]+)/);
              if (match?.[1]) artist = match[1].trim();
            }

            return {
              id: item.identifier,
              title: item.metadata?.title || item.identifier,
              artist,
              qdnData: {
                name: item.name,
                identifier: item.identifier,
                service: "AUDIO"
              },
              artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}`
            };
          });

          setSongs(formatted);
        } else {
          setSongs([]);
        }
      } catch (e) {
        console.error("BrowseSongsPage fetch error:", e);
        setError(`Error fetching songs: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaginatedSongs();
  }, [currentPage, currentLetter, currentPlatform]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1) {
      setSearchParams({ page: newPage.toString(), letter: currentLetter, platform: currentPlatform });
    }
  };

  const handleLetterChange = (newLetter) => {
    setSearchParams({ page: '1', letter: newLetter, platform: currentPlatform });
  };

  const handlePlatformChange = (platform) => {
    setSearchParams({ page: '1', letter: currentLetter, platform: platform });
  };

  const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  return (
    <div className="page-container browse-page">
      <h2>Browse All Songs</h2>

      <PlatformFilter 
        currentPlatform={currentPlatform} 
        onPlatformChange={handlePlatformChange} 
      />

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
        {isLoading && <p>Loading songs...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!isLoading && !error && songs.length === 0 && (
          <p>No songs found for this selection.</p>
        )}
        {!isLoading && !error && songs.length > 0 && (
          <MusicList
            songsData={songs}
            onSongSelect={onSongSelect}
            onAddToPlaylistClick={onAddToPlaylistClick}
            listClassName="song-grid"
          />
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalSongs}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        itemType="songs"
      />
    </div>
  );
}

export default BrowseSongsPage;