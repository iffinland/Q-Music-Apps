// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ isLoggedIn, currentUser }) {
  const stats = {
    songs: 123,
    playlists: 15,
    publishers: 7
  };

  return (
    <aside className="sidebar">
      <section className="stats-section">
        <h4>Statistika</h4>
        <p>Songs: {stats.songs}</p>
        <p>Playlists: {stats.playlists}</p>
        <p>Publishers: {stats.publishers}</p>
      </section>

      {isLoggedIn && currentUser && (
        <section className="user-section">
          <div className="user-avatar">
            <img src={`https://via.placeholder.com/80/cccccc/000000?text=${currentUser.name.substring(0, 1)}`} alt="User Avatar" />
          </div>
          <p className="user-name">{currentUser.name}</p>
        </section>
      )}

      <section className="future-content">
        <p><em>(Siia tuleb hiljem muud põnevat...)</em></p>
      </section>
    </aside>
  );
}
export default Sidebar;