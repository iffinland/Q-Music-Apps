// src/pages/BrowsePlaylistsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Mock-andmed on siin, et vältida probleeme
const allMockPlaylists = Array.from({ length: 40 }, (_, i) => ({
  id: `playlist-${i + 1}`,
  name: `Best songs Vol. ${i + 1}`,
  owner: 'Q-Music Fan',
  songCount: Math.floor(Math.random() * 40) + 10,
}));

function BrowsePlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPlaylists(allMockPlaylists);
      setIsLoading(false);
    }, 100); // Väga lühike viivitus
  }, []);

  return (
    <div className="page-container browse-page">
      <h2>Browse all playlists</h2>
      <p>Discover community-created playlists.</p>
      
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="playlist-grid">
          {playlists.map(playlist => (
            <Link to={`/playlist/${playlist.id}`} key={playlist.id} className="playlist-card">
              <h4>{playlist.name}</h4>
              <p>{playlist.songCount} songs</p>
              <span className="playlist-owner">Created by: {playlist.owner}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrowsePlaylistsPage;