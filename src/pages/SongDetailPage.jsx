// src/pages/SongDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

/* global qortalRequest */

function SongDetailPage({ onSongSelect = () => {} }) {
  const { name, identifier } = useParams(); // ← Uus URL struktuur
  const [song, setSong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSongDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!name || !identifier || typeof qortalRequest === 'undefined') {
          throw new Error("Missing QDN info or API unavailable");
        }

        const result = await qortalRequest({
          action: "SEARCH_QDN_RESOURCES",
          service: "AUDIO",
          identifier,
          name,
          includeMetadata: true,
          limit: 1
        });

        if (!Array.isArray(result) || result.length === 0) {
          throw new Error("Song not found on QDN");
        }

        const metadata = result[0].metadata || {};
        const parsedDescription = Object.fromEntries(
          (metadata.description || '')
            .split(';')
            .map(part => part.split('=').map(s => s.trim()))
            .filter(([k, v]) => k && v)
        );

        const formatted = {
          title: metadata.title || identifier,
          artist: name,
          id: identifier,
          genre: parsedDescription.genre || 'Unknown',
          album: parsedDescription.album || 'Unknown',
          year: parsedDescription.year || 'Unknown',
          publishedBy: name,
          qdnData: { name, identifier, service: "AUDIO" },
          artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(name)}/${encodeURIComponent(identifier)}`
        };

        setSong(formatted);
      } catch (err) {
        console.error("Song detail error:", err);
        setError(err.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongDetails();
  }, [name, identifier]);

  if (isLoading) return <div className="page-container"><p>Loading song info...</p></div>;
  if (error) return <div className="page-container"><h2>Error: {error}</h2></div>;
  if (!song) return <div className="page-container"><h2>Song not found</h2></div>;

  return (
    <div className="page-container song-detail-page">
      <div className="song-detail-header">
        <div className="song-artwork">
          <img
            src={song.artworkUrl}
            alt={`${song.title} artwork`}
            onError={(e) => { e.target.src = `https://via.placeholder.com/150/1DB954/FFFFFF?text=${song.title.substring(0, 1)}`; }}
          />
        </div>
        <div className="song-info">
          <p>Song</p>
          <h1>{song.title}</h1>
          <p>Artist: <strong>{song.artist}</strong> • Album: {song.album} ({song.year})</p>
          <button className="play-button" onClick={() => onSongSelect(song)}>PLAY</button>
        </div>
      </div>

      <div className="song-details-body">
        <p>Genre: {song.genre}</p>
        <p>Publisher: {song.publishedBy}</p>
      </div>
    </div>
  );
}

export default SongDetailPage;