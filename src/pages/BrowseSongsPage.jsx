// src/pages/BrowseSongsPage.jsx - UUS JA LIHTNE VERSIOON
import React from 'react';
import MusicList from '../components/MusicList'; // Taaskasutame oma head MusicList komponenti

function BrowseSongsPage({ songs, onSongSelect }) {
  return (
    <div className="page-container browse-page">
      <h2>Kõik Lood</h2>
      <p>Siin on nimekiri kõikidest saadaolevatest lugudest.</p>
      
      {/* Kasutame MusicList komponenti, aga anname talle klassinime, et muuta paigutust */}
      <MusicList
        songsData={songs}
        onSongSelect={onSongSelect}
        listClassName="song-grid" // See klass teeb sellest ruudustiku
      />
    </div>
  );
}

export default BrowseSongsPage;