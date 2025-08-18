import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/* global qortalRequest */

// Default artwork component for playlists
const ArtworkImage = ({ src, alt }) => {
  const [isError, setIsError] = useState(false);
  const DefaultArtwork = () => (
    <div className="default-artwork">
      <svg width="40" height="40" viewBox="0 0 24 24">
        <path fill="#888" d="M19,9H2V11H19V9M19,5H2V7H19V5M2,15H15V13H2V15M17,13V19L22,16L17,13Z" />
      </svg>
    </div>
  );

  if (isError || !src) return <DefaultArtwork />;
  return <img src={src} alt={alt} onError={() => setIsError(true)} />;
};

function MyPlaylistsPage({ currentUser }) {
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyPlaylists = async () => {
      if (!currentUser?.name) {
        setError("Please log in to view your playlists.");
        setIsLoading(false);
        return;
      }

      if (typeof qortalRequest === 'undefined') {
        setError("Qortal API not available.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await qortalRequest({
          action: "SEARCH_QDN_RESOURCES",
          service: "PLAYLIST",
          name: currentUser.name, // Only user's own playlists
          identifier: "qmusic_playlist_",
          prefix: true,
          includeMetadata: true,
          limit: 100,
          reverse: true
        });

        if (Array.isArray(results) && results.length > 0) {
          const formattedPlaylists = results.map(item => {
            const filename = item.filename || `${item.identifier}.json`; // Fallback kui filename puudub
            const title = item.title || item.metadata?.title || (filename ? filename.replace('.json', '') : item.identifier);
            const description = item.description || item.metadata?.description || '';

            return {
              id: item.identifier,
              name: title,
              owner: item.name,
              filename,
              identifier: item.identifier,
              description,
              created: item.created || Date.now(),
              artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}`
            };
          });

          setMyPlaylists(formattedPlaylists);
        } else {
          setMyPlaylists([]);
        }
      } catch (e) {
        console.error("MyPlaylistsPage fetch error:", e);
        setError(`Error fetching your playlists: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPlaylists();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="page-container">
        <h2>My Playlists</h2>
        <div className="login-required">
          <p>Please log in to view your playlists.</p>
          <p>Once logged in, you'll see all the playlists you've created here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container my-playlists-page">
      <div className="page-header">
        <h2>My Playlists</h2>
        <div className="page-stats">
          <span className="user-info">👤 {currentUser.name}</span>
          {!isLoading && (
            <span className="playlist-count">
              📋 {myPlaylists.length} playlist{myPlaylists.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="page-actions">
        <Link to="/create-playlist" className="btn btn-primary">
          ➕ Create New Playlist
        </Link>
      </div>

      <div className="my-playlists-content">
        {isLoading ? (
          <div className="loading-state">
            <p>Loading your playlists...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : myPlaylists.length > 0 ? (
          <div className="playlists-grid">
            {myPlaylists.map(playlist => (
              <div key={playlist.id} className="playlist-card my-playlist-card">
                <Link 
                  to={`/playlist/${encodeURIComponent(playlist.owner)}/${encodeURIComponent(playlist.identifier)}/${encodeURIComponent(playlist.filename)}`}
                  className="playlist-card-link"
                >
                  <div className="playlist-artwork">
                    <ArtworkImage
                      src={playlist.artworkUrl}
                      alt={playlist.name}
                    />
                  </div>
                  
                  <div className="playlist-info">
                    <h3 className="playlist-title">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="playlist-description">{playlist.description}</p>
                    )}
                    <div className="playlist-meta">
                      <span className="playlist-owner">By you</span>
                      <span className="playlist-date">
                        {new Date(playlist.created).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
                
                <div className="playlist-actions">
                  <Link 
                    to={`/playlist/${encodeURIComponent(playlist.owner)}/${encodeURIComponent(playlist.identifier)}/${encodeURIComponent(playlist.filename)}`}
                    className="btn btn-sm"
                    title="View Playlist"
                  >
                    👁️ View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Playlists Yet</h3>
            <p>You haven't created any playlists yet.</p>
            <p>Create your first playlist to organize your favorite songs!</p>
            <Link to="/create-playlist" className="btn btn-primary">
              ➕ Create Your First Playlist
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPlaylistsPage;
