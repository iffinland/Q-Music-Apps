// src/pages/CreatePlaylistPage.jsx - KOOS PILDI üleslaadimisega
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* global qortalRequest */

function CreatePlaylistPage({ currentUser }) {
  const navigate = useNavigate();
  const [playlistName, setPlaylistName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null); // Uus olek pildifailile
  const [isCreating, setIsCreating] = useState(false);

  const handleImageFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!playlistName || !currentUser?.name) {
      alert('Playlist name and login are required.'); return;
    }
    // Kaanepilt on valikuline, nii et me ei kontrolli seda siin.
    
    if (typeof qortalRequest === 'undefined') {
      alert("Qortal API not found."); return;
    }

    setIsCreating(true);

    try {
      const identifier = `qmusic_playlist_${currentUser.name.replace(/ /g, '_')}_${Date.now()}`;
      
      // Playlisti andmed lähevad eraldi meta-andmete ressursina
      const metadataObject = { title: playlistName, description: description, songs: [] };
      const metadataString = JSON.stringify(metadataObject);
      const metadataFile = new File([metadataString], "metadata.json", { type: "application/json" });
      
      // Koostame ressursside massiivi
      const resourcesToPublish = [
        // RESSURSS 1: Meta-andmed .json failina
        {
          name: currentUser.name,
          service: "PLAYLIST", // Või proovime siin "DOCUMENT"? "PLAYLIST" on loogilisem.
          identifier: identifier,
          file: metadataFile, // Saadame JSONi failina
        }
      ];

      // RESSURSS 2: Pildifail, KUI see on olemas
      if (imageFile) {
        resourcesToPublish.push({
          name: currentUser.name,
          service: "THUMBNAIL",
          identifier: identifier,
          file: imageFile, // Saadame otse pildifaili
        });
      }
      
      const requestObject = {
        action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
        resources: resourcesToPublish,
      };

      console.log('Publishing playlist with image:', requestObject);
      const result = await qortalRequest(requestObject);
      
      if (result === true) {
        alert(`Playlist "${playlistName}" created successfully!`);
        navigate('/playlists');
      } else {
        throw new Error(`API returned an unexpected response: ${JSON.stringify(result)}`);
      }

    } catch (error) {
      console.error('Error creating playlist:', error);
      const errorMessage = (typeof error === 'object' && error !== null) ? JSON.stringify(error, null, 2) : error.toString();
      alert(`Failed to create playlist. API Error:\n\n${errorMessage}`);
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
        
        {/* **** UUS VÄLI PILDI VALIMISEKS **** */}
        <div className="form-group">
          <label htmlFor="imageFile">Cover Image (optional)</label>
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