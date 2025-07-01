// src/components/SongItem.jsx
import React from 'react';

const DefaultArtwork = () => (
  <div className="default-artwork">
    <svg width="40" height="40" viewBox="0 0 24 24"><path fill="#888" d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z" /></svg>
  </div>
);

function SongItem({ song, onSelect }) {
  if (!song) return null;

  return (
    <div className="song-item" onClick={() => onSelect(song)}>
      <div className="song-item-artwork">
        {/* We display the real image if it exists, otherwise the default image */}
        <img src={song.artworkUrl} alt={song.title} 
             onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
             onLoad={(e) => { e.currentTarget.style.display = 'block'; e.currentTarget.nextSibling.style.display = 'none'; }}
        />
        <DefaultArtwork />
      </div>
      <div className="song-item-info">
        <h4>{song.title}</h4>
        <p>{song.artist}</p>
      </div>
    </div>
  );
}

export default SongItem;