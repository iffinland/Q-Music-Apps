// src/pages/CreatePlaylistPage.jsx - TÄPSELT NAGU EAR-BUMP TEHING
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* global qortalRequest */

function CreatePlaylistPage({ currentUser }) {
  const navigate = useNavigate();
  const [playlistName, setPlaylistName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!playlistName || !currentUser?.name) {
      alert('Playlisti nimi ja sisselogimine on kohustuslikud.'); return;
    }
    if (typeof qortalRequest === 'undefined') {
      alert("Qortali API-t ei leitud."); return;
    }

    setIsCreating(true);

    try {
      // 1. Koostame JSON objekti ja muudame selle stringiks
      const playlistDataObject = { title: playlistName, description, songs: [] };
      const playlistDataAsString = JSON.stringify(playlistDataObject);

      // 2. Loome unikaalse identifikaatori ja failinime
      const safeName = playlistName.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase().slice(0, 20);
      const identifier = `qmusic_playlist_${safeName}_${Date.now()}`;
      const filename = `${identifier}.json`; // Loome unikaalse .json failinime

      // 3. Pakime JSON-stringi File objekti sisse, nagu EAR-Bump tehing näitab
      const playlistFile = new File([playlistDataAsString], filename, {
        type: "application/json;charset=utf-8",
      });

      // 4. Koostame päringu objekti, mis vastab kõigele, mida oleme õppinud
      const requestObject = {
        action: "PUBLISH_QDN_RESOURCE",
        name: currentUser.name,       // Teame, et see on kohustuslik
        service: "PLAYLIST",          // Teame, et see on õige
        identifier: identifier,       // Loome unikaalse identifikaatori
        file: playlistFile,           // Edastame andmed .json failina
      };

      console.log('Saadan Qortalisse (uusim katse):', requestObject);
      const result = await qortalRequest(requestObject);
      console.log("Qortal API tagastas:", result);

      if (result === true) {
        alert(`Playlist "${playlistName}" on edukalt loodud!`);
        navigate('/playlists');
      } else {
        throw new Error(`API ei tagastanud edukat vastust (true), vaid: ${JSON.stringify(result)}`);
      }

    } catch (error) {
      console.error('Playlisti loomise viga:', error);
      const errorMessage = (typeof error === 'object' && error !== null) ? JSON.stringify(error, null, 2) : error.toString();
      alert(`Playlisti loomise ebaõnnestus. API tagastas vea:\n\n${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    // Vormi JSX jääb samaks
    <div className="form-page-container">
      <h2>Loo Uus Playlist</h2>
      <p>Looja: <strong>{currentUser ? currentUser.name : 'Sisselogimata'}</strong></p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="playlistName">Playlisti nimi</label>
          <input type="text" id="playlistName" value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} disabled={isCreating} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Kirjeldus (valikuline)</label>
          <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isCreating} />
        </div>
        <button type="submit" disabled={!currentUser || isCreating}>
          {isCreating ? 'Loon...' : 'Loo Playlist'}
        </button>
      </form>
    </div>
  );
}

export default CreatePlaylistPage;