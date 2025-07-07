// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ isLoggedIn, currentUser, className = '' }) {
  if (!isLoggedIn || !currentUser) return null;

  return (
    <aside className={`sidebar ${className}`}>
      <h4>Logged in as</h4>
      <p><strong>{currentUser.name}</strong></p>

      <nav>
        <ul>
          <li><Link to="/add-music">➕ Add NEW music</Link></li>
          <li><Link to="/create-playlist">🎶 Create NEW playlist</Link></li>
          <li><Link to="/playlists">📚 Browse Playlists</Link></li>
          <li><Link to="/songs">🎵 Browse Songs</Link></li>
        </ul>
      </nav>

      <hr />

      <div className="sidebar-stats">
        <p><strong>Address:</strong><br />{currentUser.address}</p>
        <p><strong>Public key:</strong><br />{currentUser.publicKey}</p>
        {/* Soovi korral lisa ka muu statistika siia */}
      </div>

      <p style={{ fontSize: '0.8em', color: '#aaa', marginTop: '2rem' }}>
        Q-Music • ALPHA UI
      </p>
    </aside>
  );
}

export default Sidebar;