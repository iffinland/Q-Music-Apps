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
      alert('Playlist name and login are required.'); return;
    }
    if (typeof qortalRequest === 'undefined') {
      alert("Qortal API not found."); return;
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

      console.log('Sending a request to create a playlist in Qortal (new method):', requestObject);
      const result = await qortalRequest(requestObject);
      
      if (result === true) {
        alert(`Playlist "${playlistName}" created successfully!`);
        navigate('/playlists');
      } else {
        throw new Error(`The API did not return a successful response (true), but: ${JSON.stringify(result)}`);
      }

    } catch (error) {
      console.error('Playlist creation error:', error);
      const errorMessage = (typeof error === 'object' && error !== null) ? JSON.stringify(error, null, 2) : error.toString();
      alert(`Playlist creation failed. API returned an error.:\n\n${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="form-page-container">
      <h4><font color="orange">Service still in testing - may not work</font></h4>
      <h2>Create a New Playlist</h2>
      <p>Publisher: <strong>{currentUser ? currentUser.name : 'Not loged IN'}</strong></p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="playlistName">Playlist name</label>
          <input type="text" id="playlistName" value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} disabled={isCreating} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description(optional)</label>
          <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isCreating} />
        </div>
        <button type="submit" disabled={!currentUser || isCreating}>
          {isCreating ? 'Creating playlist...' : 'Create playlist'}
        </button>
      </form>
    </div>
  );
}

export default CreatePlaylistPage;