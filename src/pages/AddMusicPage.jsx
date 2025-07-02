// src/pages/AddMusicPage.jsx - MINIMAALNE PÄRING + BASE64
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* global qortalRequest */

function AddMusicPage({ currentUser }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(''); // Hoiame alles UI jaoks
  const [artist, setArtist] = useState(''); // Hoiame alles UI jaoks
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile || !currentUser?.name) {
      alert('You must be logged in to publish a file..');
      return;
    }
    if (typeof qortalRequest === 'undefined') {
      alert("Qortal API not found.");
      return;
    }

    setIsUploading(true);

    try {
      const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
      });
      
      console.log("Converting a file to Base64...");
      const fileAsBase64 = await toBase64(selectedFile);
      console.log("Conversion successful.");

      const requestObject = {
        action: "PUBLISH_QDN_RESOURCE",
        name: currentUser.name,
        service: "AUDIO",
        data64: fileAsBase64, 
        appFee: 1,
        appFeeRecipient: QTowvz1e89MP4FEFpHvEfZ4x8G3LwMpthz,
      };

      console.log('Sending a request to Qortal (minimal + Base64):', requestObject);
      const result = await qortalRequest(requestObject);
      console.log("Qortal API returned (result):", result);

      if (result === true) {
         alert('The new song has been successfully published to Qortal!');
         navigate('/');
      } else {
         throw new Error(`The API did not return a successful response (true), but: ${JSON.stringify(result)}`);
      }

    } catch (error) {
      console.error('Publishing error:', error);
      const errorMessage = (typeof error === 'object' && error !== null) ? JSON.stringify(error, null, 2) : error.toString();
      alert(`Publishing failed. API returned an error.:\n\n${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    // Vorm jääb samaks
    <div className="add-music-page">
      <h2>Upload a new song</h2>
      <h4><font color="red"><b>This service is currently unavailable.</b></font></h4>
      <p>Publisher: <strong>{currentUser ? currentUser.name : 'Not logged in'}</strong></p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Song title</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isUploading} />
        </div>
        <div className="form-group">
          <label htmlFor="artist">Artist / Band</label>
          <input type="text" id="artist" value={artist} onChange={(e) => setArtist(e.target.value)} disabled={isUploading} />
        </div>
        <div className="form-group">
          <label htmlFor="audioFile">Choose audio file</label>
          <input type="file" id="audioFile" onChange={handleFileChange} accept="audio/*" disabled={isUploading} required />
          {selectedFile && <p>Selected file: {selectedFile.name}</p>}
        </div>
        <button type="submit" disabled={!currentUser || isUploading}>
          {isUploading ? 'Uue loo avaldamine QDN-is...' : 'Publish to Qortal'}
        </button>
      </form>
    </div>
  );
}

export default AddMusicPage;