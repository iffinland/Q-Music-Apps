// src/pages/AddMusicPage.jsx - Lõplik parandus avaldamisele
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* global qortalRequest */

function AddMusicPage({ currentUser }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [songFile, setSongFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === 'audioFile') setSongFile(files[0]);
      if (name === 'imageFile') setImageFile(files[0]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title || !artist || !songFile || !currentUser?.name) {
      alert('Title, artist, and an audio file are required.'); return;
    }
    if (typeof qortalRequest === 'undefined') {
      alert("Qortal API not found."); return;
    }

    setIsUploading(true);

    try {
      // 1. Unikaalne identifikaator, mis kasutab nii nime, pealkirja kui ka ajatemplit. See peab olema unikaalne.
      const safeTitle = title.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
      const identifier = `qmusic_song_${currentUser.name.replace(/ /g, '_')}_${safeTitle}_${Date.now()}`;
      
      const resourcesToPublish = [
        { // Ressurss 1: AUDIO
          name: currentUser.name,
          service: "AUDIO",
          identifier: identifier,
          title: title,
          description: `artist=${artist}`,
          file: songFile
        }
      ];

      // Ressurss 2: THUMBNAIL (kui on valitud)
      if (imageFile) {
        resourcesToPublish.push({
          name: currentUser.name,
          service: "THUMBNAIL",
          identifier: identifier, // SAMA identifier seob pildi lauluga
          file: imageFile,
          title: `${title} Artwork`, // Meta-andmed pildile
          description: `Artwork for the song ${title} by ${artist}`
        });
      }
      
      const requestObject = {
        action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
        resources: resourcesToPublish
      };
      
      console.log('Sending final publish request:', requestObject);
      const result = await qortalRequest(requestObject);

      if (result === true) {
        alert(`Song "${title}" has been published successfully! The library will refresh shortly.`);
        // See laeb lehe uuesti, mis lahendab probleemi 2c ajutiselt.
        // Tulevikus saame siia lisada peenema lahenduse ilma lehe uuesti laadimiseta.
        window.location.reload();
      } else {
        throw new Error(`API returned an unexpected response. This might be a temporary issue.`);
      }

    } catch (error) {
      console.error('Publishing error:', error);
      const errorMessage = typeof error === 'object' ? JSON.stringify(error, null, 2) : error.toString();
      alert(`Failed to publish song. API Error:\n\n${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="form-page-container">
      <p><h4><font color="red">Don't use special symbols or ÄÄÕÜ characters at the moment, they will only cause errors at the moment.</font></h4></p>
      <h2>Upload New Song</h2>
      <p>Publisher: <strong>{currentUser ? currentUser.name : 'Not logged in'}</strong></p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Song Title</label>
          <input name="title" type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isUploading} required />
        </div>
        <div className="form-group">
          <label htmlFor="artist">Artist</label>
          <input name="artist" type="text" id="artist" value={artist} onChange={(e) => setArtist(e.target.value)} disabled={isUploading} required />
        </div>
        <div className="form-group">
          <label htmlFor="audioFile">Select Audio File (Required)</label>
          <input name="audioFile" type="file" id="audioFile" onChange={handleFileChange} accept="audio/*" disabled={isUploading} required />
          {songFile && <p>Audio: {songFile.name}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="imageFile">Select Artwork Image (Optional)</label>
          <input name="imageFile" type="file" id="imageFile" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
          {imageFile && <p>Image: {imageFile.name}</p>}
        </div>
        <button type="submit" disabled={!currentUser || isUploading}>
          {isUploading ? 'Publishing...' : 'Publish to Qortal'}
        </button>
      </form>
    </div>
  );
}
export default AddMusicPage;