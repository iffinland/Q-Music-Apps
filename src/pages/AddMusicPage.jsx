// src/pages/AddMusicPage.jsx
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
    if (files?.[0]) {
      if (name === 'audioFile') setSongFile(files[0]);
      if (name === 'imageFile') setImageFile(files[0]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title || !artist || !songFile || !currentUser?.name) {
      alert('Title, artist, and an audio file are required.'); return;
    }
    setIsUploading(true);
    try {
      const identifier = `qmusic_song_${currentUser.name.replace(/ /g, '_')}_${Date.now()}`;
      
      const resourcesToPublish = [
        {
          name: currentUser.name,
          service: "AUDIO",
          identifier: identifier,
          title: title,
          description: `artist=${artist}`,
          file: songFile,
          filename: songFile.name, // **** KOHUSTUSLIK PARAMEETER LISATUD ****
        }
      ];

      if (imageFile) {
        resourcesToPublish.push({
          name: currentUser.name,
          service: "THUMBNAIL",
          identifier: identifier,
          file: imageFile,
          filename: imageFile.name, // **** KOHUSTUSLIK PARAMEETER LISATUD ****
        });
      }
      
      const requestObject = {
        action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
        resources: resourcesToPublish,
        // Name on nüüd iga ressursi sees, mitte peatasemel
      };
      
      const result = await qortalRequest(requestObject);
      
      if (result !== true) throw new Error(`API did not confirm success. Response: ${JSON.stringify(result)}`);
      
      alert('Song published successfully! Refreshing list...');
      // Lehe uuesti laadimine, et näha uut sisu
      setTimeout(() => window.location.reload(), 500);

    } catch (error) {
      alert(`Failed to publish song: ${error.message || 'Unknown error'}`);
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