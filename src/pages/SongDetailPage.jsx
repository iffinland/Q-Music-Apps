// src/pages/SongDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Mock-andmed, et simuleerida API kutset
import { songs as allSongs } from '../data/mockSongs';

// Abifunktsioon, mis "leiab" laulu info ID järgi
const findSongDetails = (songId) => {
  // Päris rakenduses teeksime siin qortalRequest({ action: "GET_SONG_DATA", id: songId })
  console.log(`Otsin laulu detailinfot ID-ga: ${songId}`);
  // Leiame laulu mock-andmetest. Eemaldame võimaliku playlisti-spetsiifilise osa ID-st.
  const cleanId = parseInt(songId.replace('song-', '').split('-')[0], 10);
  const foundSong = allSongs.find(song => song.id === cleanId);
  
  if (foundSong) {
    // Lisame mõned väljamõeldud detailid
    return {
      ...foundSong,
      album: "Parimad Lood",
      year: 2024,
      genre: "Electronic",
      publishedBy: "iffi vaba mees"
    };
  }
  return null; // Kui laulu ei leitud
};


function SongDetailPage({ onSongSelect = () => {} }) {
  const { songId } = useParams();
  const [song, setSong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundSong = findSongDetails(songId);
      setSong(foundSong);
      setIsLoading(false);
    }, 300);
  }, [songId]);

  if (isLoading) {
    return <div className="page-container"><p>Loading song info...</p></div>;
  }

  if (!song) {
    return <div className="page-container"><h2>Song not found</h2></div>;
  }

  return (
    <div className="page-container song-detail-page">
      <div className="song-detail-header">
        <div className="song-artwork">
          {/* TODO: Päris kaanepilt */}
          <img src={`https://via.placeholder.com/150/1DB954/FFFFFF?text=${song.title.substring(0,1)}`} alt={`${song.title} artwork`} />
        </div>
        <div className="song-info">
          <p>Song</p>
          <h1>{song.title}</h1>
          <p>Artist: <strong>{song.artist}</strong> • Album: {song.album} ({song.year})</p>
          <button className="play-button" onClick={() => onSongSelect(song)}>PLAY</button>
        </div>
      </div>
      <div className="song-details-body">
        <p>Genr: {song.genre}</p>
        <p>Publisher: {song.publishedBy}</p>
        {/* Siia võiks tulevikus lisada laulusõnad vms */}
      </div>
    </div>
  );
}

export default SongDetailPage;