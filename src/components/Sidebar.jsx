// src/components/Sidebar.jsx - NÜÜD PÄRIB ISE OMA ANDMED
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Me ei vaja enam useAuth'i, sest sisselogimise info tuleb propsidena
// import { useAuth } from '../context/AuthContext';

/* global qortalRequest */

// Sidebar saab sisselogimise info endiselt propsidena App.jsx-ist
function Sidebar({ isLoggedIn, currentUser }) {
  // Loome oleku statistika jaoks
  const [stats, setStats] = useState({
    songs: '...', // Alguses näitame laadimise indikaatorit
    playlists: '...',
    publishers: '...'
  });

  // See useEffect käivitub ainult korra, kui komponent laetakse
  useEffect(() => {
    const fetchStats = async () => {
      if (typeof qortalRequest === 'undefined') {
        console.warn("Sidebar: Qortal API not available for stats.");
        // Jätame vaikimisi väärtused, kui API-t pole
        setStats({ songs: 'N/A', playlists: 'N/A', publishers: 'N/A' });
        return;
      }

      try {
        // Pärime laulude arvu
        const songStatsResponse = await qortalRequest({
          action: 'SEARCH_QDN_RESOURCES',
          service: 'AUDIO',
          limit: 0, // Küsime ainult koguarvu
        });
        // API tagastab massiivi, mille pikkus ongi koguarv
        const totalSongs = Array.isArray(songStatsResponse) ? songStatsResponse.length : 0;

        // TODO: Tulevikus pärime siin ka playlistide ja avaldajate arvu
        const totalPlaylists = 0; // Ajutine
        const totalPublishers = 0; // Ajutine

        // Uuendame olekut päris andmetega
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
  }, []); // Tühi sõltuvuste massiiv tagab, et see jookseb ainult korra

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