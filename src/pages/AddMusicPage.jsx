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
      alert('Faili valimine ja sisselogimine on kohustuslikud.');
      return;
    }
    if (typeof qortalRequest === 'undefined') {
      alert("Qortali API-t ei leitud.");
      return;
    }

    setIsUploading(true);

    try {
      // Funktsioon faili konverteerimiseks Base64-ks
      const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
      });
      
      console.log("Konverdin faili Base64-ks...");
      const fileAsBase64 = await toBase64(selectedFile);
      console.log("Konvertimine õnnestus.");

      // **** OLULINE MUUDATUS: Koostame päringu, mis sisaldab ainult Base64 andmeid ****
      const requestObject = {
        action: "PUBLISH_QDN_RESOURCE",
        name: currentUser.name, // Kohustuslik väli
        service: "AUDIO",
        // Kasutame 'data64' võtit, mis on levinud Base64 andmete jaoks
        data64: fileAsBase64, 
        // Me ei saada 'file', 'filename', 'title', 'description', 'identifier'
        // Laseme Qortalil ise otsustada, mida teha minimaalse infoga.
      };

      console.log('Saadan Qortalisse (minimaalne + Base64) päringu:', requestObject);
      const result = await qortalRequest(requestObject);
      console.log("Qortal API tagastas (result):", result);

      if (result === true) {
         alert('Lugu on edukalt avaldatud Qortalisse!');
         navigate('/');
      } else {
         throw new Error(`API ei tagastanud edukat vastust (true), vaid: ${JSON.stringify(result)}`);
      }

    } catch (error) {
      console.error('Avaldamise viga:', error);
      const errorMessage = (typeof error === 'object' && error !== null) ? JSON.stringify(error, null, 2) : error.toString();
      alert(`Avaldamine ebaõnnestus. API tagastas vea:\n\n${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    // Vorm jääb samaks
    <div className="add-music-page">
      <h2>Lae Üles Uus Lugu</h2>
      <p>Avaldaja: <strong>{currentUser ? currentUser.name : 'Pole sisse logitud'}</strong></p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Loo pealkiri (hetkel ei kasutata päringus)</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isUploading} />
        </div>
        <div className="form-group">
          <label htmlFor="artist">Esitaja (hetkel ei kasutata päringus)</label>
          <input type="text" id="artist" value={artist} onChange={(e) => setArtist(e.target.value)} disabled={isUploading} />
        </div>
        <div className="form-group">
          <label htmlFor="audioFile">Vali audiofail (nt .mp3)</label>
          <input type="file" id="audioFile" onChange={handleFileChange} accept="audio/*" disabled={isUploading} required />
          {selectedFile && <p>Valitud fail: {selectedFile.name}</p>}
        </div>
        <button type="submit" disabled={!currentUser || isUploading}>
          {isUploading ? 'Avaldan...' : 'Avalda Qortalisse'}
        </button>
      </form>
    </div>
  );
}

export default AddMusicPage;