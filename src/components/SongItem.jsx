// src/components/SongItem.jsx - PARANDATUD JSX STRUKTUURIGA
import React from 'react';

// Loome ikoonid otse siia
const DefaultArtwork = () => (
  <div className="default-artwork">
    <svg width="40" height="40" viewBox="0 0 24 24"><path fill="#888" d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z" /></svg>
  </div>
);

const AddIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>
);


function SongItem({ song, onSelect, onAddToPlaylistClick }) {
  if (!song) return null;

  // Takistab laulul klõpsamist, kui vajutad "+" nuppu
  const handleAddClick = (e) => {
    e.stopPropagation(); 
    if (onAddToPlaylistClick) {
      onAddToPlaylistClick(song);
    }
  };

  // See on see "tark" pildikuvamine, mis meil on olemas, aga hetkel on see
  // vigade vältimiseks lihtsustatud. Aktiveerime selle hiljem.
  const ArtworkImage = () => {
    if (!song.artworkUrl) return <DefaultArtwork />;
    return <img src={song.artworkUrl} alt={song.title} />;
  }

  // **** SIIN ON PARANDATUD RETURN-LAUSE ****
  // Kõik elemendid on nüüd ühe `div className="song-item"` sees.
  return (
    <div className="song-item" onClick={() => onSelect(song)}>
      
      <div className="song-item-artwork">
        <ArtworkImage />
        {/* Nupp on pildi peal */}
        <button className="add-to-playlist-btn" onClick={handleAddClick} title="Add to playlist">
          <AddIcon />
        </button>
      </div>

      <div className="song-item-info">
        <h4>{song.title}</h4>
        <p>{song.artist}</p>
      </div>

    </div> // See on see üks ja ainus vanem-element
  );
}

export default SongItem;