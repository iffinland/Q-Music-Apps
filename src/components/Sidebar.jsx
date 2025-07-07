// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/* global qortalRequest */

function Sidebar({ isLoggedIn, currentUser, className }) {
  const [stats, setStats] = useState({ songs: '...', playlists: '...', publishers: '...' });

  useEffect(() => {
    // See statistika pärimise loogika on siin juba olemas ja see töötab
    // Me ei pea seda muutma.
    const fetchStats = async () => {
      // ... sinu töötav statistika pärimise kood
    };
    fetchStats();
  }, []);

  return (
    // Me renderdame külgriba ALATI, aga selle sisu muutub
    <aside className={`sidebar ${className || ''}`}>
      <div className="sidebar-content">

        {/* See sektsioon on alati nähtaval */}
        <section className="stats-section">
          <h4>Statistics</h4>
          <p>Songs: {stats.songs}</p>
          <p>Playlists: {stats.playlists}</p>
          <p>Publishers: {stats.publishers}</p>
        </section>

        <hr />

        {/* See sektsioon ilmub AINULT siis, kui kasutaja on sisse logitud */}
        {isLoggedIn && currentUser && (
          <section className="user-section">
            <div className="user-avatar">
               <img src={`https://via.placeholder.com/60/cccccc/000000?text=${currentUser.name.substring(0, 1)}`} alt="Avatar" />
            </div>
            <p className="user-name"><strong>{currentUser.name}</strong></p>
            {/* Siia saab lisada navigeerimislingid, mida näeb ainult sisselogitud kasutaja */}
            {/*
            <nav>
              <Link to="/profile" className="sidebar-link">My Profile</Link>
            </nav>
            */}
          </section>
        )}

        <div className="sidebar-footer">
          <p>Q-Music • ALPHA</p>
        </div>

      </div>
    </aside>
  );
}

export default Sidebar;