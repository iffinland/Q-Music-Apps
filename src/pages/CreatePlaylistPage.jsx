// src/pages/CreatePlaylistPage.jsx
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
      alert('You must be logged in to create a playlist..'); return;
    }
    if (typeof qortalRequest === 'undefined') {
      alert("Qortal API not found."); return;
    }

    setIsCreating(true);

    try {
      const playlistDataObject = { title: playlistName, description, songs: [] };
      const playlistDataAsString = JSON.stringify(playlistDataObject);

      const safeName = playlistName.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase().slice(0, 20);
      const identifier = `qmusic_playlist_${safeName}_${Date.now()}`;
      const filename = `${identifier}.json`; 

      const playlistFile = new File([playlistDataAsString], filename, {
        type: "application/json;charset=utf-8",
      });

      const requestObject = {
        action: "PUBLISH_QDN_RESOURCE",
        name: currentUser.name,
        service: "PLAYLIST",
        identifier: identifier,
        file: playlistFile,
        appFee: 1,
        appFeeRecipient: QTowvz1e89MP4FEFpHvEfZ4x8G3LwMpthz,
      };

      console.log('Sending Qortal (latest attempt):', requestObject);
      const result = await qortalRequest(requestObject);
      console.log("Qortal API returned:", result);

      if (result === true) {
        alert(`Playlist "${playlistName}" has been successfully created!`);
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
      <h2>Create a New Playlist</h2>
      <h4><font color="red"><b>This service is currently unavailable.</b></font></h4>
      <p>Created by: <strong>{currentUser ? currentUser.name : 'Not logged in'}</strong></p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="playlistName">Playlisti nimi</label>
          <input type="text" id="playlistName" value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} disabled={isCreating} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isCreating} />
        </div>
        <button type="submit" disabled={!currentUser || isCreating}>
          {isCreating ? 'Creating a playlist...' : 'Create playlist'}
        </button>
      </form>
    </div>
  );
}

export default CreatePlaylistPage;