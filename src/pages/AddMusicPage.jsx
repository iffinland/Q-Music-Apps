// src/pages/AddMusicPage.jsx - ÜKS ACTION, ÜKS FAIL (BASE64)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* global qortalRequest */

function AddMusicPage({ currentUser }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile || !currentUser?.name) {
      alert('Faili valimine ja sisselogimine on kohustuslikud.'); return;
    }
    if (typeof qortalRequest === 'undefined') {
      alert("Qortali API-t ei leitud."); return;
    }

    setIsUploading(true);

    try {
      console.log("Konverdin faili base64-ks...");
      const fileAsBase64 = await toBase64(selectedFile);
      console.log("Konvertimine õnnestus.");

      const identifier = `qmusic_${currentUser.name.replace(/ /g, '_')}_${Date.now()}`;

      // **** OLULINE MUUDATUS: ÜKS ACTION, ÜKS RESSURSS ****
      const requestObject = {
        action: "PUBLISH_QDN_RESOURCE", // Kasutame lihtsamat actionit
        name: currentUser.name,
        service: "AUDIO",
        identifier: identifier,
        data64: fileAsBase64, // Saadame Base64 andmed
      };

      console.log('Sending a Qortal request (simplified base64):', requestObject);
      const result = await qortalRequest(requestObject);
      
      if (result === true) {
        alert(`File successfully published!`);
        navigate('/songs');
      } else {
        throw new Error(`The API did not return a successful response, but: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error('Song publishing error:', error);
      const errorMessage = (typeof error === 'object' && error !== null) ? JSON.stringify(error, null, 2) : error.toString();
      alert(`Publishing failed. API returned an error.:\n\n${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    // Vormi JSX jääb samaks
<div className="form-page-container">
  <h4><font color="orange">Service still in testing - may not work</font></h4>
  <h2>Publish a new song for the commune</h2>
  <p>Publisher: <strong>{currentUser ? currentUser.name : 'Not logged in'}</strong></p>
  <form onSubmit={handleSubmit}>
    <div className="form-group">
      <label htmlFor="title">Song title</label>
      <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isUploading} required />
    </div>
    <div className="form-group">
      <label htmlFor="artist">Artist</label>
      <input type="text" id="artist" value={artist} onChange={(e) => setArtist(e.target.value)} disabled={isUploading} required />
    </div>
    <div className="form-group">
      <label htmlFor="audioFile">Choose audio file</label>
      <input type="file" id="audioFile" onChange={handleFileChange} accept="audio/*" disabled={isUploading} required />
      {selectedFile && <p>Selected file: {selectedFile.name}</p>}
    </div>
    <button type="submit" disabled={!currentUser || isUploading}>
      {isUploading ? 'Publishing...' : 'Publish to Qortal'}
    </button>
  </form>
</div>
  );
}

export default AddMusicPage;