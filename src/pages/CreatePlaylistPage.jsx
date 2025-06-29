// src/pages/CreatePlaylistPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import defaultPlaylistImage from '../assets/default-playlist.png'; // Eeldab, et sul on see pilt src/assets kaustas

/* global qortalRequest */

function CreatePlaylistPage({ currentUser }) {
  const navigate = useNavigate();

  // Olekud vormiväljadele
  const [playlistName, setPlaylistName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Pildi eelvaate jaoks
  const [isCreating, setIsCreating] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      // Loome pildi eelvaate
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!playlistName || !currentUser?.name) {
      alert('Playlisti nimi on kohustuslik ja pead olema sisse logitud.');
      return;
    }
    if (typeof qortalRequest === 'undefined') {
      alert("Qortali API-t ei leitud.");
      return;
    }

    setIsCreating(true);

    try {
      // 1. Valmistame ette playlisti andmed (JSON)
      const playlistData = {
        version: 1,
        title: playlistName,
        description: description,
        owner: currentUser.name,
        songs: [] // Alguses on playlist tühi
      };

      // 2. Unikaalne identifikaator
      const safeName = playlistName.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase().slice(0, 20);
      const identifier = `qmusic_playlist_${safeName}_${Date.now()}`;

      // 3. Koostame ressursside massiivi
      const resourcesToPublish = [
        {
          // Esimene ressurss: PLAYLIST andmed
          service: "PLAYLIST",
          identifier: identifier,
          name: currentUser.name, // Nimi on ressursi tasemel
          // Edastame JSON andmed stringina, see on turvaline viis
          data: JSON.stringify(playlistData), 
        }
      ];

      // 4. Kui kasutaja valis pildi, lisame selle teise ressursina
      if (selectedImageFile) {
        const imageAsBase64 = await toBase64(selectedImageFile);
        resourcesToPublish.push({
          service: "THUMBNAIL",
          identifier: identifier, // Sama identifikaator seob pildi playlistiga
          name: currentUser.name,
          data64: imageAsBase64, // Kasutame data64, nagu EAR Bump tegi piltide puhul
        });
      }
      // TODO: Siia võiks lisada 'else' bloki, mis kasutab vaike pilti, aga teeme selle hiljem

      // 5. Koostame lõpliku päringu objekti
      const requestObject = {
        action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
        name: currentUser.name, // Peamine avaldaja nimi
        resources: resourcesToPublish,
      };

      console.log('Saadan Qortalisse playlisti loomise päringu:', requestObject);
      const result = await qortalRequest(requestObject);

      if (result === true) {
         alert(`Playlist "${playlistName}" on edukalt loodud!`);
         navigate('/');
      } else {
         throw new Error(`API ei tagastanud edukat vastust, vaid: ${JSON.stringify(result)}`);
      }

    } catch (error) {
      console.error('Playlisti loomise viga:', error);
      const errorMessage = (typeof error === 'object' && error !== null) ? JSON.stringify(error, null, 2) : error.toString();
      alert(`Playlisti loomise ebaõnnestus. API tagastas vea:\n\n${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="create-playlist-page">
      <h2>Loo Uus Playlist</h2>
      <p>Looja: <strong>{currentUser ? currentUser.name : 'Pole sisse logitud'}</strong></p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="playlistName">Playlisti nimi</label>
          <input type="text" id="playlistName" value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} disabled={isCreating} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Kirjeldus (valikuline)</label>
          <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isCreating} />
        </div>
        <div className="form-group">
          <label htmlFor="imageFile">Vali kaanepilt (valikuline)</label>
          <input type="file" id="imageFile" onChange={handleImageChange} accept="image/*" disabled={isCreating} />
          {imagePreview && (
            <div className="image-preview" style={{ marginTop: '1rem' }}>
              <img src={imagePreview} alt="Playlisti eelvaade" style={{ maxWidth: '150px', maxHeight: '150px' }} />
            </div>
          )}
        </div>
        <button type="submit" disabled={!currentUser || isCreating}>
          {isCreating ? 'Loon...' : 'Loo Playlist'}
        </button>
      </form>
    </div>
  );
}

export default CreatePlaylistPage;