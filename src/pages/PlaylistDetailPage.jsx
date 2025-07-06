// src/pages/PlaylistDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MusicList from '../components/MusicList';

/* global qortalRequest */

function PlaylistDetailPage({ onSongSelect, onAddToPlaylistClick }) {
  const { playlistId, owner, filename } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!playlistId || !owner || !filename || typeof qortalRequest === 'undefined') return;
      setIsLoading(true);

      try {
        const resourceData = await fetch(
          `/arbitrary/PLAYLIST/${encodeURIComponent(owner)}/${encodeURIComponent(playlistId)}/${encodeURIComponent(filename)}`
        ).then(res => res.json());

        resourceData.owner = decodeURIComponent(owner);
        resourceData.title = resourceData.name || filename.replace('.json', '');
        setPlaylist(resourceData);

        if (Array.isArray(resourceData.songs) && resourceData.songs.length > 0) {
          const songFetches = resourceData.songs.map((ref) =>
            qortalRequest({
              action: "SEARCH_QDN_RESOURCES",
              service: "AUDIO",
              name: ref.name,
              identifier: ref.identifier,
              includeMetadata: true,
              limit: 1
            })
          );

          const results = await Promise.allSettled(songFetches);

          const foundSongs = results
            .filter((r) => r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length > 0)
            .map((r) => r.value[0])
            .map((item) => ({
              id: item.identifier,
              title: item.metadata?.title || item.filename || item.identifier,
              artist: item.metadata?.description?.split('artist=')[1] || item.name,
              qdnData: item,
              artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}/${encodeURIComponent(item.filename?.replace(/\.\w+$/, '.jpg') || 'cover.jpg')}`,
            }));

          setSongs(foundSongs);
        }

      } catch (error) {
        console.error("Failed to load playlist:", error);
        setPlaylist(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [playlistId, owner, filename]);

  if (isLoading) {
    return <div className="page-container"><p>Loading playlist...</p></div>;
  }

  if (!playlist) {
    return <div className="page-container"><h2>Playlist Not Found</h2></div>;
  }

  return (
    <div className="page-container playlist-detail-page">
      <div className="playlist-header">
        <h1>{playlist.title || 'Untitled Playlist'}</h1>
        <p>{playlist.description || 'No description provided.'}</p>
        <span>
          Created by: <strong>{playlist.owner}</strong> • {songs.length} songs
        </span>
      </div>

      <div className="playlist-songs">
        {songs.length > 0 ? (
          <MusicList
            songsData={songs}
            onSongSelect={onSongSelect}
            onAddToPlaylistClick={onAddToPlaylistClick}
            listClassName="vertical-music-list"
          />
        ) : (
          <p>This playlist is empty. Nothing to show.</p>
        )}
      </div>
    </div>
  );
}

export default PlaylistDetailPage;