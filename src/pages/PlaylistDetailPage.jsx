// src/pages/PlaylistDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MusicList from '../components/MusicList';

// Mock-andmed, et simuleerida API kutset
import { songs as allSongs } from '../data/mockSongs';

// Abifunktsioon, mis "leiab" playlisti info ID järgi
const findPlaylistDetails = (playlistId) => {
  console.log(`Looking for playlist details by ID: ${playlistId}`);
  return {
    id: playlistId,
    name: `Best Songs Vol.. ${playlistId.replace('playlist-', '')}`,
    description: "This is a great collection of the best stories.",
    owner: "Q-Music Fan",
    songs: allSongs.slice(0, 10).map(song => ({...song, id: `${song.id}-${playlistId}`})),
  };
};

function PlaylistDetailPage({ onSongSelect = () => {} }) {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundPlaylist = findPlaylistDetails(playlistId);
      setPlaylist(foundPlaylist);
      setIsLoading(false);
    }, 300);
  }, [playlistId]);

  if (isLoading) {
    return <div className="page-container"><p>Loading playlist info...</p></div>;
  }

  if (!playlist) {
    return <div className="page-container"><h2>Playlist not found</h2></div>;
  }

  return (
    <div className="page-container playlist-detail-page">
      <div className="playlist-header">
        <div className="playlist-info">
          <p>Playlist</p>
          <h1>{playlist.name}</h1>
          <p>{playlist.description}</p>
          <span>Created by: {playlist.owner} • {playlist.songs.length} songs</span>
        </div>
      </div>
      <div className="playlist-songs">
        <MusicList songsData={playlist.songs} onSongSelect={onSongSelect} listClassName="vertical-music-list" />
      </div>
    </div>
  );
}

export default PlaylistDetailPage;