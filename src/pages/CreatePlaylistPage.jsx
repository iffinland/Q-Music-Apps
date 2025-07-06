// src/pages/CreatePlaylistPage.jsx
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

/* global qortalRequest */

function CreatePlaylistPage({ currentUser }) {
  const [playlistName, setPlaylistName] = useState('');
  const [userSongs, setUserSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);

  // ⏬ Lae kasutaja enda laulud (AUDIO)
  const loadUserSongs = async () => {
    if (!currentUser?.name) return;

    try {
      const result = await qortalRequest({
        action: "LIST_QDN_RESOURCES",
        name: currentUser.name,
      });

      const songs = result.filter(
        (r) => r.service === "AUDIO" && r.identifier.startsWith("qmusic_song_")
      );

      setUserSongs(songs);
    } catch (error) {
      console.error('Failed to load songs', error);
    }
  };

  // ⏬ Lae kasutaja playlistid (teenus PLAYLIST)
  const loadUserPlaylists = async () => {
    if (!currentUser?.name) return;

    try {
      const result = await qortalRequest({
        action: "LIST_QDN_RESOURCES",
        name: currentUser.name,
      });

      const playlists = result.filter((r) => r.service === "PLAYLIST");
      setUserPlaylists(playlists);
    } catch (error) {
      console.error('Failed to load playlists', error);
    }
  };

  useEffect(() => {
    loadUserSongs();
    loadUserPlaylists();
  }, [currentUser]);

  const toggleSongSelection = (song) => {
    setSelectedSongs((prev) => {
      const exists = prev.find((s) => s.identifier === song.identifier);
      return exists
        ? prev.filter((s) => s.identifier !== song.identifier)
        : [...prev, song];
    });
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName || selectedSongs.length === 0) {
      alert('Enter a playlist name and select at least one song.');
      return;
    }

    const identifier = `playlist_${currentUser.name}_${uuidv4()}`;
    const filename = `${playlistName.replace(/ /g, '_')}.json`;

    const playlistData = {
      name: playlistName,
      createdBy: currentUser.name,
      songs: selectedSongs,
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await qortalRequest({
        action: "PUBLISH_QDN_RESOURCE",
        name: currentUser.name,
        service: "PLAYLIST",
        identifier,
        data: playlistData,
        filename,
      });

      if (result === true) {
        alert("Playlist created!");
        setPlaylistName('');
        setSelectedSongs([]);
        await loadUserPlaylists();
      } else {
        throw new Error(JSON.stringify(result));
      }
    } catch (error) {
      alert("Failed to create playlist: " + error.message);
    }
  };

  const getQdnUrl = (resource) => {
    return `/arbitrary/AUDIO/${resource.name}/${resource.identifier}/${resource.filename}`;
  };

  const getPlaylistContent = async (playlist) => {
    const url = `/arbitrary/PLAYLIST/${playlist.name}/${playlist.identifier}/${playlist.filename}`;
    try {
      const response = await fetch(url);
      const json = await response.json();
      return json.songs || [];
    } catch (err) {
      console.error("Failed to load playlist content", err);
      return [];
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
        />
      </div>
      <h3>Select Songs:</h3>
      <ul>
        {userSongs.map((song) => (
          <li key={song.identifier}>
            <label>
              <input
                type="checkbox"
                checked={selectedSongs.some((s) => s.identifier === song.identifier)}
                onChange={() => toggleSongSelection(song)}
              />
              {song.title || song.filename}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleCreatePlaylist}>Create Playlist</button>

      <hr />
      <h2>Your Playlists</h2>
      {userPlaylists.length === 0 && <p>No playlists created yet.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {userPlaylists.map((playlist, idx) => (
          <div key={idx} style={{ border: '1px solid #ccc', padding: '10px' }}>
            <h4>{playlist.filename.replace('.json', '')}</h4>
            <PlaylistSongsRenderer playlist={playlist} getQdnUrl={getQdnUrl} getPlaylistContent={getPlaylistContent} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaylistSongsRenderer({ playlist, getQdnUrl, getPlaylistContent }) {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    (async () => {
      const content = await getPlaylistContent(playlist);
      setSongs(content);
    })();
  }, [playlist]);

  return (
    <ul>
      {songs.map((song, idx) => (
        <li key={idx}>
          <p><strong>{song.title || song.filename}</strong></p>
          <audio controls style={{ width: '100%' }}>
            <source src={getQdnUrl(song)} type="audio/mpeg" />
            Your browser does not support audio playback.
          </audio>
        </li>
      ))}
    </ul>
  );
}

export default CreatePlaylistPage;