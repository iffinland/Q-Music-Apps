// src/pages/CreatePlaylistPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* global qortalRequest */

function CreatePlaylistPage({ currentUser }) {
  const navigate = useNavigate();
  const [playlistName, setPlaylistName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null); // Lisatud kaanepildi jaoks
  const [isCreating, setIsCreating] = useState(false);

  const handleImageFileChange = (e) => {
    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!playlistName || !currentUser?.name) {
      alert('Playlist name and login are required.'); return;
    }
    setIsCreating(true);
    try {
      const identifier = `qmusic_playlist_${currentUser.name.replace(/ /g, '_')}_${Date.now()}`;
      const metadataObject = { title: playlistName, description, songs: [] };
      const metadataFile = new File([JSON.stringify(metadataObject)], `${identifier}.json`, { type: "application/json" });

      const resourcesToPublish = [
        {
          name: currentUser.name,
          service: "PLAYLIST",
          identifier: identifier,
          file: metadataFile, // Metaandmed on nüüd ise fail
          filename: metadataFile.name, // **** KOHUSTUSLIK PARAMEETER ****
        }
      ];

      if (imageFile) {
        resourcesToPublish.push({
          name: currentUser.name,
          service: "THUMBNAIL",
          identifier: identifier,
          file: imageFile,
          filename: imageFile.name, // **** KOHUSTUSLIK PARAMEETER ****
        });
      }

      const requestObject = {
        action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
        resources: resourcesToPublish,
      };

      const result = await qortalRequest(requestObject);

      if (result !== true) throw new Error(`API did not confirm success. Response: ${JSON.stringify(result)}`);
      
      alert(`Playlist "${playlistName}" created successfully!`);
      // Värskendame lehe, et näha uut sisu
      navigate('/playlists');
      setTimeout(() => window.location.reload(), 500);

    } catch (error) {
      alert(`Failed to create playlist: ${error.message || 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="form-page-container">
      <p><h4><font color="red">Don't use special symbols or ÄÄÕÜ characters at the moment, they will only cause errors at the moment.</font></h4></p>
      <h2>Create New Playlist</h2>
      <p>Creator: <strong>{currentUser ? currentUser.name : 'Not logged in'}</strong></p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="playlistName">Playlist Name</label>
          <input type="text" id="playlistName" value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} disabled={isCreating} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isCreating} />
        </div>
        <div className="form-group">
          <label htmlFor="imageFile">Cover Image (Optional)</label>
          <input type="file" id="imageFile" onChange={handleImageFileChange} accept="image/*" disabled={isCreating} />
          {imageFile && <p>Image: {imageFile.name}</p>}
        </div>
        <button type="submit" disabled={!currentUser || isCreating}>
          {isCreating ? 'Creating...' : 'Create Playlist'}
        </button>
      </form>
    </div>
  );
}

export default CreatePlaylistPage;