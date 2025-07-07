// src/components/SongItem.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Ikonid
const AddIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
  </svg>
);

const ViewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5M12,17C9.24,17 7,14.76 7,12C7,9.24 9.24,7 12,7C14.76,7 17,9.24 17,12C17,14.76 14.76,17 12,17M12,9C10.34,9 9,10.34 9,12C9,13.66 10.34,15 12,15C13.66,15 15,13.66 15,12C15,10.34 13.66,9 12,9Z" />
  </svg>
);

const ArtworkImage = ({ src, alt }) => {
  const [isError, setIsError] = useState(false);
  const DefaultArtwork = () => (
    <div className="default-artwork">
      <svg width="40" height="40" viewBox="0 0 24 24">
        <path fill="#888" d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z" />
      </svg>
    </div>
  );
  return isError || !src
    ? <DefaultArtwork />
    : <img src={src} alt={alt} onError={() => setIsError(true)} />;
};

function SongItem({ song, onSelect, onAddToPlaylistClick }) {
  const navigate = useNavigate();
  if (!song) return null;

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (onAddToPlaylistClick) onAddToPlaylistClick(song);
  };

  const handleViewDetailsClick = (e) => {
    e.stopPropagation();
    // Kasutame QDN-i nimesid ja identifierit
    const { name, identifier } = song.qdnData || {};
    if (name && identifier) {
      navigate(`/song/${name}/${identifier}`);
    } else {
      alert("Missing metadata to open song details.");
    }
  };

  return (
    <div className="song-item">
      <div className="song-item-main-clickable" onClick={() => onSelect(song)}>
        <div className="song-item-artwork">
          <ArtworkImage src={song.artworkUrl} alt={song.title} />
        </div>
        <div className="song-item-info">
          <h4>{song.title}</h4>
          <p>{song.artist}</p>
        </div>
      </div>

      <div className="song-item-actions">
        <button
          className="song-item-btn"
          onClick={handleAddClick}
          title="Add to playlist"
        >
          <AddIcon />
        </button>

        <button
          className="song-item-btn"
          onClick={handleViewDetailsClick}
          title="View song details"
        >
          <ViewIcon />
        </button>
      </div>
    </div>
  );
}

export default SongItem;