// src/pages/CreatePlaylistPage.jsx
import React, { useState, useEffect } from 'react';

/* global qortalRequest */

// Fallback pildi jaoks
const ArtworkImage = ({ src, alt }) => {
  const [isError, setIsError] = useState(false);
  const DefaultArtwork = () => (
    <div className="default-artwork">
      <svg width="40" height="40" viewBox="0 0 24 24">
        <path fill="#888" d="M19,9H2V11H19V9M19,5H2V7H19V5M2,15H15V13H2V15M17,13V19L22,16L17,13Z" />
      </svg>
    </div>
  );
  if (isError || !src) return <DefaultArtwork />;
  return <img src={src} alt={alt} onError={() => setIsError(true)} />;
};

function CreatePlaylistPage({ currentUser }) {
  const [playlistName, setPlaylistName] = useState('');
  const [userSongs, setUserSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);

  useEffect(() => {
    if (!currentUser?.name) return;

    const fetchResources = async () => {
      try {
        const resources = await qortalRequest({
          action: "LIST_QDN_RESOURCES",
          name: currentUser.name,
        });

        const songs = resources.filter(r => r.service === "AUDIO" && r.identifier.startsWith("qmusic_song_"));
        const playlists = resources.filter(r => r.service === "PLAYLIST");

        setUserSongs(songs);
        setUserPlaylists(playlists);
      } catch (e) {
        console.error("Failed loading QDN resources", e);
      }
    };

    fetchResources();
  }, [currentUser]);

  const toggleSongSelection = (song) => {
    setSelectedSongs(prev =>
      prev.some(s => s.identifier === song.identifier)
        ? prev.filter(s => s.identifier !== song.identifier)
        : [...prev, song]
    );
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName) {
      alert('Enter playlist name.');
      return;
    }

    try {
      // Create identifier EXACTLY like songs: qmusic_playlist_title_randomcode
      const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase(); // 8 characters like DsNWg4N9  
      const cleanTitle = playlistName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const identifier = `qmusic_playlist_${cleanTitle}_${randomCode}`;

      // Prepare playlist data like in GitHub version
      const playlistData = {
        title: playlistName,
        description: `Playlist created by ${currentUser.name} at ${new Date().toISOString()}`,
        songs: selectedSongs.map(song => ({
          name: song.name,
          identifier: song.identifier,
          service: 'AUDIO'
        })),
        createdAt: new Date().toISOString(),
        uniqueId: identifier  // Add unique ID to data as well
      };

      // Prepare resources array EXACTLY like songs do in publishService.js
      const resources = [
        {
          name: currentUser.name, // User name stays same  
          service: "PLAYLIST",
          identifier, // Unique identifier for each playlist
          title: playlistName,
          description: `Playlist created by ${currentUser.name}`,
          data64: btoa(JSON.stringify(playlistData)),
          filename: `${cleanTitle}.json`
        }
      ];

      console.log('Publishing playlist with data:', {
        identifier,
        playlistData,
        resources
      });

      const result = await qortalRequest({
        action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
        resources: resources,
        encrypt: false
      });

      console.log("Publish result:", result);

      // Check if result is an array of transaction objects (successful case)
      if (Array.isArray(result) && result.length > 0 && result[0].signature) {
        alert("Playlist created!");
        setPlaylistName('');
        setSelectedSongs([]);
        setUserPlaylists(prev => [...prev, { identifier, filename: `${identifier}.json` }]);
      } else if (result === true) {
        // If result is exactly true (also successful)
        alert("Playlist created!");
        setPlaylistName('');
        setSelectedSongs([]);
        setUserPlaylists(prev => [...prev, { identifier, filename: `${identifier}.json` }]);
      } else {
        console.error("Unexpected result format:", result);
        throw new Error("Failed: " + JSON.stringify(result));
      }
    } catch (err) {
      console.error("Playlist creation error:", err);
      alert("Creation failed: " + err.message);
    }
  };

  return (
    <div className="form-page-container">
      <h2>Create New Playlist</h2>

      <div className="form-group">
        <label>Playlist Name</label>
        <input
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          placeholder="e.g. My Summer Hits"
        />
      </div>

      <h3>Select Your Songs (Optional)</h3>
      {userSongs.length === 0 ? (
        <p>You haven't published any songs yet. You can still create an empty playlist.</p>
      ) : (
        <div className="song-selection-list">
          {userSongs.map((song) => (
            <label key={song.identifier} className="song-checkbox-item">
              <input
                type="checkbox"
                checked={selectedSongs.some(s => s.identifier === song.identifier)}
                onChange={() => toggleSongSelection(song)}
              />
              {song.title || song.filename}
            </label>
          ))}
        </div>
      )}

      <button onClick={handleCreatePlaylist} disabled={!playlistName}>
        Create Playlist ({selectedSongs.length} songs selected)
      </button>

      <hr />

      <h2>Your Playlists</h2>
      {userPlaylists.length === 0 && <p>No playlists created yet.</p>}

      <div className="playlist-preview-list">
        {userPlaylists.map((playlist, index) => (
          <PlaylistSongsRenderer key={index} playlist={playlist} />
        ))}
      </div>
    </div>
  );
}

// 🎧 Loob eelvaate iga playlisti lauludest
function PlaylistSongsRenderer({ playlist }) {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch(`/arbitrary/PLAYLIST/${playlist.name}/${playlist.identifier}/${playlist.filename}`);
        const data = await res.json();
        setSongs(data?.songs || []);
      } catch (err) {
        console.error("Failed loading playlist preview", err);
      }
    };

    fetchSongs();
  }, [playlist]);

  const getQdnUrl = (s) =>
    `/arbitrary/AUDIO/${encodeURIComponent(s.name)}/${encodeURIComponent(s.identifier)}/${encodeURIComponent(s.filename)}`;

  return (
    <div className="playlist-preview">
      <h4>{playlist.filename.replace('.json', '')}</h4>
      <ul>
        {songs.map((s, idx) => (
          <li key={idx}>
            <strong>{s.title || s.filename}</strong>
            <audio controls style={{ width: '100%' }}>
              <source src={getQdnUrl(s)} type="audio/mpeg" />
            </audio>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CreatePlaylistPage;