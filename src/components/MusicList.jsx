// src/components/MusicList.jsx
import React from 'react';
import SongItem from './SongItem';

// Anname ka siin propsidele vaikimisi väärtused
function MusicList({ songsData = [], onSongSelect = () => {}, listClassName = "music-list" }) {
  // Muutsime kontrolli lihtsamaks, kuna vaikimisi väärtus on alati olemas
  if (songsData.length === 0) {
    return <p>No songs found!</p>;
  }

  return (
    <section className={listClassName}>
      {songsData.map(song => (
        <SongItem
          key={song.id}
          song={song}
          onSelect={() => onSongSelect(song)} // Lihtsustatud, kuna onSongSelect on alati funktsioon
        />
      ))}
    </section>
  );
}
export default MusicList;