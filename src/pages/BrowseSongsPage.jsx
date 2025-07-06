// src/pages/BrowseSongsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MusicList from '../components/MusicList';
/* global qortalRequest */

function BrowseSongsPage({ onSongSelect, onAddToPlaylistClick }) { // Prop lisatud
  const [searchParams, setSearchParams] = useSearchParams();
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentLetter = searchParams.get('letter') || 'ALL';
  const limit = 50;
  
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
        const requestObject = {
          action: "SEARCH_QDN_RESOURCES", service: "AUDIO", includeMetadata: true,
          limit, offset: (currentPage - 1) * limit, reverse: true,
        };
        if (currentLetter !== 'ALL') {
          requestObject.name = currentLetter;
          requestObject.prefix = true;
          requestObject.exactMatchNames = false;
        }
        const results = await qortalRequest(requestObject);
        if (Array.isArray(results)) {
          const formatted = results.map(item => ({
            id: item.identifier, title: item.metadata?.title || item.identifier, artist: item.name,
            qdnData: item, artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}`
          }));
          setSongs(formatted);
        } else { setSongs([]); }
      } catch (e) {
        setError(`Error fetching songs: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaginatedSongs();
  }, [currentPage, currentLetter]);

  const handlePageChange = (newPage) => { if (newPage >= 1) setSearchParams({ page: newPage.toString(), letter: currentLetter }); };
  const handleLetterChange = (newLetter) => setSearchParams({ page: '1', letter: newLetter });
  
  const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
  
  return (
    <div className="page-container browse-page">
      <h2>Browse All Songs</h2>
      <div className="alphabet-filter">
        {alphabet.map(letter => ( <button key={letter} className={currentLetter === letter ? 'active' : ''} onClick={() => handleLetterChange(letter)} disabled={isLoading} >{letter}</button> ))}
      </div>
      <div className="browse-results">
        {isLoading && <p>Loading songs...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!isLoading && !error && songs.length === 0 && <p>No songs found for this selection.</p>}
        {!isLoading && !error && songs.length > 0 && (
          <MusicList songsData={songs} onSongSelect={onSongSelect} onAddToPlaylistClick={onAddToPlaylistClick} listClassName="song-grid" />
        )}
      </div>
      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading}>« Previous</button>
        <span>Page {currentPage}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={songs.length < limit || isLoading}>Next »</button>
      </div>
    </div>
  );
}

export default BrowseSongsPage;