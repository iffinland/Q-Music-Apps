// src/pages/CreatePlaylistPage.jsx - PÕHINEB TÖÖTAVAL NÄITEL
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
      // 1. Koostame unikaalse identifikaatori
      const identifier = `qmusic_playlist_${currentUser.name.replace(/ /g, '_')}_${Date.now()}`;
      
      // 2. Loome meta-andmete JSON-objekti
      const metadataObject = {
        title: playlistName,
        description: description,
      };
      
      // 3. Muudame selle stringiks
      const metadataString = JSON.stringify(metadataObject);
      
      // 4. Koostame ressursid päringu jaoks (meie puhul on ainult üks)
      // See ressurss on ise need meta-andmed. Me ei lae eraldi faili, vaid avaldame info.
      const resource = {
        // name: currentUser.name, // Q-Manageri koodis on name iga ressursi sees
        service: "PLAYLIST",
        identifier: identifier,
        data: metadataString, // Saadame JSON-stringi otse 'data' väljal
      };

      // 5. Koostame lõpliku päringu objekti
      const requestObject = {
        action: "PUBLISH_MULTIPLE_QDN_RESOURCE", // Kasutame lihtsamat actionit, kuna meil pole mitut faili
        ...resource // Kopeerime kõik ressursi väljad otse siia
      };

      console.log('Saadan Qortalisse (uus meetod) playlisti loomise päringu:', requestObject);
      const result = await qortalRequest(requestObject);
      
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