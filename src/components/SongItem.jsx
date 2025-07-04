// src/components/SongItem.jsx - TÄIELIK JA PARANDATUD
import React, { useState } from 'react';

// Loome ikoonid otse siia
const AddIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
  </svg>
);

const ArtworkImage = ({ src, alt }) => {
    const [isError, setIsError] = useState(false);
    const DefaultArtwork = () => (
      <div className="default-artwork">
        <svg width="40" height="40" viewBox="0 0 24 24"><path fill="#888" d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z" /></svg>
      </div>
    );
    // Kui pilti pole või tekib viga, kuvame vaike-pildi
    if (isError || !src) return <DefaultArtwork />;
    // Muul juhul proovime päris pilti laadida
    return <img src={src} alt={alt} onError={() => setIsError(true)} />;
};

function SongItem({ song, onSelect, onAddToPlaylistClick }) {
  if (!song) return null;

  // See funktsioon takistab laulu enda peale klõpsamist, kui vajutame "+" nuppu
  const handleAddClick = (event) => {
    event.stopPropagation();
    if (onAddToPlaylistClick) {
      onAddToPlaylistClick(song);
    }
  };

  return (
    // See on see ainus ja õige vanem-element
    <div className="song-item">
      {/* Pildi ja loo nime osa on eraldi klikitav konteiner */}
      <div className="song-item-main-clickable" onClick={() => onSelect(song)}>
        <div className="song-item-artwork">
          <ArtworkImage src={song.artworkUrl} alt={song.title} />
        </div>
        <div className="song-item-info">
          <h4>{song.title}</h4>
          <p>{song.artist}</p>
        </div>
      </div>
      
      {/* Nupp playlisti lisamiseks kuvatakse ainult siis, kui vastav funktsioon on olemas */}
      {onAddToPlaylistClick && (
        <button className="add-to-playlist-btn" onClick={handleAddClick} title="Add to playlist">
          <AddIcon />
        </button>
      )}
    </div>
  );
}

export default SongItem;