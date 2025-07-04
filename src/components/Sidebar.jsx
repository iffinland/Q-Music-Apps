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
        <p>ALL QDN audio: {stats.songs}</p>
        <p>Q-Music Songs: 0</p>
        <p>Ear-Bump Songs: {stats.songs}</p>
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

      <section className="stats-section">
        <h5><b>I N F O R M A T I O N</b></h5>
        <p>You can find more detailed information <i>(such as FAQ)</i> about this app by visiting the CHAT called <font color="orange"><b>Q-Music</b></font> and the THREADS section there.</p>
        <p>Click and send <a href="qortal://APP/Q-Mail/to/Q-Music"><b>Q-Mail</b></a></p>
        <p>Suggestions, ideas, problems!?</p>
        <p>visit Q-Music <font color="green"><b>CHAT-THREADS</b></font></p>
      </section>
    </aside>
  );
}

export default Sidebar;