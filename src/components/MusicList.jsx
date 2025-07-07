// src/components/MusicList.jsx
import React from 'react';
import SongItem from './SongItem';

function MusicList({
  songsData = [],
  onSongSelect = () => {},
  onAddToPlaylistClick = () => {},
  listClassName = "music-list",
  variant = "grid" // "grid" või "list" või muu – visuaalne klass hilisemaks kasutuseks
}) {
  if (!Array.isArray(songsData) || songsData.length === 0) {
    return (
      <div className="empty-music-list">
        <p>No songs to display.</p>
      </div>
    );
  }

  return (
    <section className={`${listClassName} ${variant}`}>
      {songsData.map((song, index) => {
        const uniqueKey = song.id || `${song.title}-${song.artist}-${index}`;

        return (
          <SongItem
            key={uniqueKey}
            song={song}
            onSelect={onSongSelect}
            onAddToPlaylistClick={onAddToPlaylistClick}
          />
        );
      })}
    </section>
  );
}

export default MusicList;