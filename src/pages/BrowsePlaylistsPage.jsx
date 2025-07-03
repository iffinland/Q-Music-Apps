// src/pages/BrowsePlaylistsPage.jsx - PÄRIB PÄRIS PLAYLISTE
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

/* global qortalRequest */

function BrowsePlaylistsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const limit = 50;

  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      setError(null);
      if (typeof qortalRequest === 'undefined') {
        setError("Qortal API not available.");
        setIsLoading(false);
        return;
      }

      try {
        const offset = (currentPage - 1) * limit;

        const requestObject = {
          action: "SEARCH_QDN_RESOURCES",
          service: "PLAYLIST",
          identifier: "qmusic_playlist_", // Otsime meie rakenduse playliste
          prefix: true, // Oluline, et otsida alguse järgi
          includeMetadata: true,
          limit: limit,
          offset: offset,
          reverse: true, // Uusimad esimesena
        };
        
        const results = await qortalRequest(requestObject);
        console.log("Leitud playlistid:", results);

        if (Array.isArray(results) && results.length > 0) {
          // Siin peame playlisti meta-andmed välja lugema teisiti
          // Kuna me salvestasime need DOCUMENT teenusega. Parandan!
          // Ei, me salvestasime selle PLAYLIST teenusega ja andmed olid 'file' sees.
          // See tähendab, et me peame need uuesti alla laadima.
          const playlistsWithDetails = await Promise.all(
            results.map(async (playlist) => {
              try {
                // Päri iga playlisti JSON sisu
                const playlistJson = await qortalRequest({
                  action: "FETCH_QDN_RESOURCE",
                  name: playlist.name,
                  service: "PLAYLIST",
                  identifier: playlist.identifier,
                });
                
                const playlistData = JSON.parse(playlistJson);
                
                return {
                  id: playlist.identifier,
                  name: playlistData.title || "Tundmatu playlist",
                  description: playlistData.description || "",
                  owner: playlist.name,
                  songCount: playlistData.songs?.length || 0,
                  // Lisame ka thumbnaili URLi
                  artworkUrl: `/thumbnail/${playlist.name}/${playlist.identifier}`,
                };

              } catch (e) {
                console.error(`Could not fetch details for playlist ${playlist.identifier}`, e);
                return null; // Kui detailide pärimine ebaõnnestub, jätame selle vahele
              }
            })
          );
          
          // Eemaldame need, mille detaile ei saanud kätte
          setPlaylists(playlistsWithDetails.filter(p => p !== null));

        } else {
          setPlaylists([]);
        }
      } catch (e) {
        setError(`Error fetching playlists: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlaylists();
  }, [currentPage]);

  const handlePageChange = (newPage) => { if (newPage >= 1) setSearchParams({ page: newPage.toString() }); };

  return (
    <div className="page-container browse-page">
      <h2>Sirvi Playliste</h2>
      <div className="browse-results">
        {isLoading && <p>Loading playlists...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!isLoading && !error && playlists.length === 0 && <p>No playlists found.</p>}
        {!isLoading && !error && playlists.length > 0 && (
          <div className="playlist-grid">
            {playlists.map(playlist => (
              <Link to={`/playlist/${playlist.id}`} key={playlist.id} className="playlist-card">
                <div className="song-item-artwork"> {/* Taaskasutame laulude stiili pildi jaoks */}
                  <img src={playlist.artworkUrl} alt={playlist.name} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} onLoad={(e) => { e.currentTarget.style.display = 'block'; e.currentTarget.nextSibling.style.display = 'none'; }} />
                  <div className="default-artwork"><svg /* ... noodi ikoon ... */></svg></div>
                </div>
                <h4>{playlist.name}</h4>
                <p>{playlist.songCount} laulu</p>
                <span className="playlist-owner">Looja: {playlist.owner}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>« Eelmine</button>
        <span>Leht {currentPage}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={playlists.length < limit}>Järgmine »</button>
      </div>
    </div>
  );
}

export default BrowsePlaylistsPage;