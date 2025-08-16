// src/pages/PlaylistDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MusicList from '../components/MusicList';

/* global qortalRequest */

// Väikekomponent fallback-pildiks
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
        const data = await fetch(
          `/arbitrary/PLAYLIST/${encodeURIComponent(owner)}/${encodeURIComponent(playlistId)}/${encodeURIComponent(filename)}`
        ).then(res => res.json());

        data.owner = decodeURIComponent(owner);
        data.title = data.name || filename.replace('.json', '');
        setPlaylist(data);

        if (Array.isArray(data.songs) && data.songs.length > 0) {
          const songFetches = data.songs.map(ref =>
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
            .filter(r => r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length > 0)
            .map(r => r.value[0])
            .map(item => {
              let artist = item.name;
              const desc = item.metadata?.description || '';
              if (desc.includes('artist=')) {
                const match = desc.match(/artist=([^;]+)/);
                if (match?.[1]) artist = match[1].trim();
              }

              const thumbFile = item.filename?.replace(/\.\w+$/, '.jpg') || 'cover.jpg';

              return {
                id: item.identifier,
                title: item.metadata?.title || item.filename || item.identifier,
                artist,
                qdnData: item,
                artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}/${encodeURIComponent(thumbFile)}`
              };
            });

          setSongs(foundSongs);
        }

      } catch (e) {
        console.error("Failed to load playlist:", e);
        setPlaylist(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [playlistId, owner, filename]);

  if (isLoading) return <div className="page-container"><p>Loading playlist...</p></div>;
  if (!playlist) return <div className="page-container"><h2>Playlist Not Found</h2></div>;

  return (
    <div className="page-container playlist-detail-page">
      <div className="playlist-header">
        <div className="song-item-artwork" style={{ width: '150px', height: '150px' }}>
          <ArtworkImage
            src={`/arbitrary/THUMBNAIL/${encodeURIComponent(owner)}/${encodeURIComponent(playlistId)}/${encodeURIComponent(filename.replace('.json', '.jpg'))}`}
            alt={playlist.title}
          />
        </div>

        <div className="playlist-info">
          <h1>{playlist.title || 'Untitled Playlist'}</h1>
          {playlist.description && <p>{playlist.description}</p>}
          <span>
            Created by: <strong>{playlist.owner}</strong> • {songs.length} songs
          </span>
        </div>
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