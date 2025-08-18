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
    if (!files?.[0]) return;

    if (name === 'audioFile') setSongFile(files[0]);
    if (name === 'imageFile') setImageFile(files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !artist || !songFile || !currentUser?.name) {
      alert('Title, artist and audio file are required.');
      return;
    }

    setIsUploading(true);
    try {
      // Loome täiesti unikaalse identifikaatori
      const timestamp = Date.now();
      const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const randomCode2 = Math.random().toString(36).substring(2, 8).toUpperCase();
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const identifier = `qmusic_track_${cleanTitle}_${timestamp}_${randomCode}_${randomCode2}`;

      // Koostame ressursid: laul, pilt, kirjeldus
      const resources = [
        {
          name: currentUser.name,
          service: "AUDIO",
          identifier,
          title,
          description: `artist=${artist}`,
          file: songFile,
          filename: songFile.name,
          compress: false
        }
      ];
      if (imageFile) {
        // Kasutame sama cleanTitle + .jpg
        const ext = imageFile.name.split('.').pop();
        resources.push({
          name: currentUser.name,
          service: "THUMBNAIL",
          identifier,
          file: imageFile,
          filename: `${cleanTitle}.${ext}`,
          compress: false
        });
      }

      // Avaldame kõik ressursid ühe requestiga
      const result = await qortalRequest({
        action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
        resources,
        compress: "NONE"  // Explicit keelame ZIP kompressiooni
      });

      // Kontrollime edukust
      const isSuccess = result === true || (Array.isArray(result) && result.length > 0 && result[0].signature);
      if (!isSuccess) {
        throw new Error("API did not confirm success: " + JSON.stringify(result));
      }

      // Loome uue laulu objekti UI jaoks
      const newTrack = {
        id: identifier,
        title,
        artist,
        created: timestamp,
        qdnData: {
          name: currentUser.name,
          service: 'AUDIO',
          identifier
        },
        artworkUrl: imageFile ? `/arbitrary/THUMBNAIL/${encodeURIComponent(currentUser.name)}/${encodeURIComponent(identifier)}/${cleanTitle}.${imageFile.name.split('.').pop()}` : null
      };

      console.log('Created new track object for UI:', newTrack);

      // Lisame uue laulu UI-sse kohe (event + navigeerimine)
      window.dispatchEvent(new CustomEvent('songPublished', { detail: newTrack }));
      navigate('/', { state: { refreshSongs: true, newSong: newTrack } });
    } catch (err) {
      alert("Failed to publish: " + (err.message || "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="warning-message">
        <strong>Note:</strong> Avoid using special characters (Ä, Ö, Õ, Ü, etc.) in file or artist names. These may cause upload issues.
      </div>

      <h2>Upload New Song</h2>
      <p>Logged in as: <strong>{currentUser?.name || 'Unknown User'}</strong></p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Song Title <span style={{ color: 'red' }}>*</span></label>
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="artist">Artist <span style={{ color: 'red' }}>*</span></label>
          <input
            id="artist"
            name="artist"
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            disabled={isUploading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="audioFile">Audio File <span style={{ color: 'red' }}>*</span></label>
          <input
            id="audioFile"
            name="audioFile"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={isUploading}
            required
          />
          {songFile && <p><strong>Selected:</strong> {songFile.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="imageFile">Artwork Image (Optional)</label>
          <input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {imageFile && <p><strong>Selected:</strong> {imageFile.name}</p>}
        </div>

        <button type="submit" disabled={isUploading || !currentUser}>
          {isUploading ? 'Publishing...' : 'Publish to Qortal'}
        </button>
      </form>
    </div>
  );
}

export default AddMusicPage;