// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/* global qortalRequest */

function Sidebar({ isLoggedIn, currentUser }) {
  const [stats, setStats] = useState({
    allSongs: '...',
    qmusicSongs: '...',
    earbumpSongs: '...',
    playlists: '...',
    publishers: '...'
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (typeof qortalRequest === 'undefined') {
        console.warn("Sidebar: Qortal API not available.");
        setStats({
          allSongs: 'N/A', qmusicSongs: 'N/A', earbumpSongs: 'N/A',
          playlists: 'N/A', publishers: 'N/A'
        });
        return;
      }

      try {
        const [
          allAudio,
          qmusicAudio,
          earbumpAudio,
          qmusicPlaylists
        ] = await Promise.all([
          qortalRequest({ action: 'SEARCH_QDN_RESOURCES', service: 'AUDIO', limit: 10000 }),
          qortalRequest({ action: 'SEARCH_QDN_RESOURCES', service: 'AUDIO', identifier: 'qmusic_', prefix: true, limit: 10000 }),
          qortalRequest({ action: 'SEARCH_QDN_RESOURCES', service: 'AUDIO', identifier: 'earbump_', prefix: true, limit: 10000 }),
          qortalRequest({ action: 'SEARCH_QDN_RESOURCES', service: 'PLAYLIST', identifier: 'qmusic_', prefix: true, limit: 10000 })
        ]);

        const publisherSet = new Set(
          qmusicAudio.map(item => item.name)
        );

        setStats({
          allSongs: allAudio.length,
          qmusicSongs: qmusicAudio.length,
          earbumpSongs: earbumpAudio.length,
          playlists: qmusicPlaylists.length,
          publishers: publisherSet.size
        });

      } catch (e) {
        console.error("Sidebar stats fetch error:", e);
        setStats({
          allSongs: 'Error',
          qmusicSongs: 'Error',
          earbumpSongs: 'Error',
          playlists: 'Error',
          publishers: 'Error'
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <aside className="sidebar">
      <section className="stats-section">
        <h5><b>S T A T I S T I C S</b></h5>
        <p>ALL QDN audio: {stats.allSongs}</p>
        <p>Q-Music Songs: {stats.qmusicSongs}</p>
        <p>Ear-Bump Songs: {stats.earbumpSongs}</p>
        <p>Playlists: {stats.playlists}</p>
        <p>Publishers: {stats.publishers}</p>
      </section>

      {isLoggedIn && currentUser && (
        <section className="user-section">
          <div className="user-avatar">
            <img
              src={`https://via.placeholder.com/80/cccccc/000000?text=${currentUser.name.charAt(0).toUpperCase()}`}
              alt="User Avatar"
            />
          </div>
          <p className="user-name">{currentUser.name}</p>
        </section>
      )}

      <section className="stats-section">
        <h5><b>I N F O R M A T I O N</b></h5>
        <p>You can find more detailed information <i>(such as FAQ)</i> about this app by visiting the CHAT called <b style={{ color: 'orange' }}>Q-Music</b> and the THREADS section there.</p>
        <p>Click and send <a href="qortal://APP/Q-Mail/to/Q-Music"><b>Q-Mail</b></a></p>
        <p>Suggestions, ideas, problems!?</p>
        <p>visit Q-Music <b style={{ color: 'green' }}>CHAT-THREADS</b></p>
      </section>
    </aside>
  );
}

export default Sidebar;