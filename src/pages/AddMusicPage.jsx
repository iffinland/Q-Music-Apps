// src/pages/AddMusicPage.jsx - UUS IDENTIFIKAATORI GENEREERIMINE
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

  const handleSongFileChange = (event) => { if (event.target.files && event.target.files[0]) setSongFile(event.target.files[0]); };
  const handleImageFileChange = (event) => { if (event.target.files && event.target.files[0]) setImageFile(event.target.files[0]); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title || !artist || !songFile || !currentUser?.name) {
      alert('Title, artist and audio file are required..'); return;
    }
    if (typeof qortalRequest === 'undefined') {
      alert("Qortal API not found."); return;
    }

    setIsUploading(true);

    try {
      // **** OLULINE PARANDUS SIIN ****
      // Genereerime lühikese, 8-kohalise suvalise stringi ajatempli asemel
      const randomString = Math.random().toString(36).substring(2, 10);
      const safeTitle = title.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase().slice(0, 25);
      const identifier = `qmusic_song_${safeTitle}_${randomString}`;

      const resourcesToPublish = [
        { name: currentUser.name, service: "AUDIO", identifier, title: title, description: `artist=${artist}`, file: songFile }
      ];

      if (imageFile) {
        resourcesToPublish.push({ name: currentUser.name, service: "THUMBNAIL", identifier, file: imageFile });
      }
      
      const requestObject = { action: "PUBLISH_MULTIPLE_QDN_RESOURCES", resources: resourcesToPublish };
      
      const result = await qortalRequest(requestObject);
      
      if (result === true) {
        alert(`New song "${title}" has been successfully published!`);
        navigate('/songs');
      } else {
        throw new Error(`The API did not return a successful response, but: ${JSON.stringify(result)}`);
      }

    } catch (error) {
      console.error('Error publishing song:', error);
      const errorMessage = (typeof error === 'object' && error !== null) ? JSON.stringify(error, null, 2) : error.toString();
      alert(`Failed to publish song. API returned an error.:\n\n${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="form-page-container">
      <h2>Upload New Song</h2>
      <p>Publisher: <strong>{currentUser ? currentUser.name : 'Not logged in'}</strong></p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Song Title</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isUploading} required />
        </div>
        <div className="form-group">
          <label htmlFor="artist">Artist</label>
          <input type="text" id="artist" value={artist} onChange={(e) => setArtist(e.target.value)} disabled={isUploading} required />
        </div>
        <div className="form-group">
          <label htmlFor="audioFile">Select Audio File (Required)</label>
          <input type="file" id="audioFile" onChange={handleSongFileChange} accept="audio/*" disabled={isUploading} required />
          {songFile && <p>Audio: {songFile.name}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="imageFile">Select Artwork Image (Optional)</label>
          <input type="file" id="imageFile" onChange={handleImageFileChange} accept="image/*" disabled={isUploading} />
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