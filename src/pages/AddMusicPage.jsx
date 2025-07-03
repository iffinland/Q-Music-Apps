// src/pages/AddMusicPage.jsx - Mitme ressursi avaldamine
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title || !artist || !selectedFile || !currentUser?.name) {
      alert('All fields are required and you must be logged in..');
      return;
    }
    if (typeof qortalRequest === 'undefined') {
      alert("Qortal API not found.");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Loome unikaalse identifikaatori, mida kasutavad mõlemad ressursid
      const identifier = `qmusic_${currentUser.name.replace(/ /g, '_')}_${Date.now()}`;
      
      // 2. Loome meta-andmete objekti ja stringi
      const metadataObject = { title: title, artist: artist };
      const metadataString = JSON.stringify(metadataObject);
      
      // 3. Koostame ressursside massiivi
      const resourcesToPublish = [
        { // Esimene ressurss: Audiofail ise
          name: currentUser.name,
          service: "AUDIO",
          identifier: identifier,
          file: selectedFile // Anname kaasa päris File objekti
        },
        { // Teine ressurss: Meta-andmed eraldi dokumendina
          name: currentUser.name,
          service: "DOCUMENT", // Kasutame üldist DOCUMENT teenust
          identifier: identifier, // SAMA identifier seob need kokku
          data: metadataString, // Saadame JSON-stringi siin
          // Nimetame selle faili, et see oleks äratuntav
          filename: "metadata.json"
        }
      ];
      // Tulevikus lisame siia ka THUMBNAIL ressursi

      // 4. Koostame lõpliku päringu objekti
      const requestObject = {
        action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
        resources: resourcesToPublish
      };
      
      // Peamine 'name' parameeter ei ole PUBLISH_MULTIPLE... actionil vajalik,
      // kuna see on iga ressursi sees olemas.
      
      console.log('Sending multiple resources to Qortal:', requestObject);
      const result = await qortalRequest(requestObject);
      
      if (result === true) {
        alert(`Song "${title}" has been successfully published!`);
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