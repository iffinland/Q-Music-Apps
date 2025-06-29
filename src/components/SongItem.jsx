// src/components/SongItem.jsx
import React from 'react';

// Võta vastu onSelect prop
function SongItem({ song, onSelect }) {
  if (!song) {
    return null;
  }

  return (
    // Lisame onClick sündmuse, mis kutsub välja onSelect funktsiooni
    <div
      className="song-item"
      style={{ border: '1px solid #eee', margin: '10px', padding: '10px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
      onClick={onSelect} // Kutsu onSelect funktsiooni, kui laulul klikitakse
    >
      <img src={song.artworkUrl} alt={song.title} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
      <div>
        <h3>{song.title}</h3>
        <p>{song.artist} - {song.album}</p>
        <p>Kestus: {song.duration}</p>
      </div>
    </div>
  );
}

export default SongItem;