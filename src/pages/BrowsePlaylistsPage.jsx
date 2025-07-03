// src/pages/BrowsePlaylistsPage.jsx - KORREKTNE KAHEASTMELINE PÄRING
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

/* global qortalRequest */

const ArtworkImage = ({ src, alt }) => {
    const [isError, setIsError] = useState(false);
    const DefaultArtwork = () => (<div className="default-artwork"><svg width="40" height="40" viewBox="0 0 24 24"><path fill="#888" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg></div>);
    if (isError || !src) return <DefaultArtwork />;
    return <img src={src} alt={alt} onError={() => setIsError(true)} />;
};

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
        setError("Qortal API not available."); setIsLoading(false); return;
      }

      try {
        const requestObject = {
          action: "SEARCH_QDN_RESOURCES", service: "PLAYLIST", identifier: "qmusic_playlist_",
          prefix: true, limit, offset: (currentPage - 1) * limit, reverse: true,
        };
        const results = await qortalRequest(requestObject);

        if (Array.isArray(results) && results.length > 0) {
          const playlistsWithDetails = await Promise.all(
            results.map(async (p) => {
              try {
                const jsonString = await qortalRequest({ action: "FETCH_QDN_RESOURCE", name: p.name, service: "PLAYLIST", identifier: p.identifier });
                const data = JSON.parse(jsonString);
                return {
                  id: p.identifier, name: data.title || p.identifier, owner: p.name,
                  songCount: data.songs?.length || 0,
                  artworkUrl: `/thumbnail/${encodeURIComponent(p.name)}/${encodeURIComponent(p.identifier)}`,
                };
              } catch { return null; }
            })
          );
          setPlaylists(playlistsWithDetails.filter(Boolean));
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
        {!isLoading && !error && playlists.length === 0 && <p>No Q-Music playlists found.</p>}
        {!isLoading && !error && playlists.length > 0 && (
          <div className="playlist-grid">
            {playlists.map(playlist => (
              <Link to={`/playlist/${playlist.id}`} key={playlist.id} className="playlist-card">
                <div className="song-item-artwork">
                  <ArtworkImage src={playlist.artworkUrl} alt={playlist.name} />
                </div>
                <h4>{playlist.name}</h4>
                <p>{playlist.songCount} laulu</p>
                <span className="playlist-owner">By: {playlist.owner}</span>
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