// src/pages/BrowseSongsPage.jsx - PARANDATUD
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MusicList from '../components/MusicList';

/* global qortalRequest */

function BrowseSongsPage({ onSongSelect = () => {} }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalSongs, setTotalSongs] = useState(0)
  
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentLetter = searchParams.get('letter') || 'ALL';
  const limit = 50;
  
  useEffect(() => {
    const fetchPaginatedSongs = async () => {
      setIsLoading(true);
      setError(null);
      
      if (typeof qortalRequest === 'undefined') {
        setError("Qortal API is unavailable.");
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
        
        if (currentLetter !== 'ALL') {
          requestObject.name = currentLetter;
          requestObject.prefix = true;
          requestObject.exactMatchNames = false;
        }

        const results = await qortalRequest(requestObject);
        if (Array.isArray(results)) {
          setTotalSongs(results.length)
          const formatted = results.map(item => {
            let finalArtist = item.name || "Unknown Artist";
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
          setSongs(formatted);
        } else {
          setSongs([]);
        }
      } catch (e) {
        setError(`Error loading data: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaginatedSongs();
  }, [currentPage, currentLetter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1) setSearchParams({ page: newPage.toString(), letter: currentLetter });
  };
  const handleLetterChange = (newLetter) => {
    setSearchParams({ page: '1', letter: newLetter });
  };
  
  const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
  
  return (
    <div className="page-container browse-page">
      <h2>Browse all songs</h2>
      <div className="alphabet-filter">
        {alphabet.map(letter => ( <button key={letter} className={currentLetter === letter ? 'active' : ''} onClick={() => handleLetterChange(letter)} disabled={isLoading} >{letter}</button> ))}
      </div>
      <div className="browse-results">
        {isLoading && <p>Loading songs...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!isLoading && !error && songs.length === 0 && <p>No songs found with this criteria, try something else.</p>}
        {!isLoading && !error && songs.length > 0 && ( <MusicList songsData={songs} onSongSelect={onSongSelect} listClassName="song-grid" /> )}
      </div>
      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading}>« Previous</button>
        <span> Page {currentPage} </span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={songs.length < limit || isLoading}>Next »</button>
      </div>
    </div>
  );
}

export default BrowseSongsPage;