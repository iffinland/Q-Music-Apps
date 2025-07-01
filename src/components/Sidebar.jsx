// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/* global qortalRequest */

function Sidebar({ isLoggedIn, currentUser }) {
  const [stats, setStats] = useState({
    songs: '...', 
    playlists: '...',
    publishers: '...'
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (typeof qortalRequest === 'undefined') {
        console.warn("Sidebar: Qortal API not available for stats.");
        setStats({ songs: 'N/A', playlists: 'N/A', publishers: 'N/A' });
        return;
      }

      try {
        const songStatsResponse = await qortalRequest({
          action: 'SEARCH_QDN_RESOURCES',
          service: 'AUDIO',
          limit: 0, // We only ask for the total number
        });
        const totalSongs = Array.isArray(songStatsResponse) ? songStatsResponse.length : 0;

        // TODO: In the future, we will also request the number of playlists and publishers here.
        const totalPlaylists = 0;
        const totalPublishers = 0;

        setStats({
          songs: totalSongs,
          playlists: totalPlaylists,
          publishers: totalPublishers
        });

      } catch (error) {
        console.error("Statistika pärimise viga:", error);
        setStats({ songs: 'Viga', playlists: 'Viga', publishers: 'Viga' });
      }
    };

    fetchStats();
  }, []); 

  return (
    <aside className="sidebar">
      <section className="stats-section">
        <h5><b>S T A T I S T I C S</b></h5>
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
    </aside>
  );
}

export default Sidebar;