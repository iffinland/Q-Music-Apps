// src/components/MusicList.jsx
import React from 'react';
import SongItem from './SongItem';

// **** VÕTA PROP VASTU ja anna EDASI ****
function MusicList({ songsData = [], onSongSelect, onAddToPlaylistClick, listClassName = "music-list" }) {
  if (songsData.length === 0) return null;

  return (
    <section className={listClassName}>
      {songsData.map((song) => {
        const uniqueKey = song.id || `${song.title}-${song.artist}`;
        return (
          <SongItem
            key={uniqueKey}
            song={song}
            onSelect={onSongSelect} // Jääb samaks
            // **** SEE ON OLULINE RIDA ****
            onAddToPlaylistClick={onAddToPlaylistClick}
          />
        );
      })}
    </section>
  );
}

export default MusicList;