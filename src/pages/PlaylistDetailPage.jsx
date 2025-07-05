// src/pages/PlaylistDetailPage.jsx - TÄIELIK JA PARANDATUD
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MusicList from '../components/MusicList';

/* global qortalRequest */

function PlaylistDetailPage({ onSongSelect, onAddToPlaylistClick }) {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!playlistId || typeof qortalRequest === 'undefined') return;
      setIsLoading(true);
      try {
        const infoRes = await qortalRequest({ action: "SEARCH_QDN_RESOURCES", identifier: playlistId, limit: 1 });
        if (!infoRes?.[0]) throw new Error("Playlist not found.");
        
        const playlistInfo = infoRes[0];

        // Päri playlisti sisu (mis on juba objekt)
        const playlistData = await qortalRequest({
          action: "FETCH_QDN_RESOURCE", name: playlistInfo.name, service: "PLAYLIST", identifier: playlistId,
        });
        
        if (typeof playlistData !== 'object' || playlistData === null) {
            throw new Error("Invalid playlist data received.");
        }
        
        // Parsi looja nimi, kuna see ei ole playlisti andmetes sees
        playlistData.owner = playlistInfo.name;
        setPlaylist(playlistData);
        
        if (playlistData.songs?.length > 0) {
          const promises = playlistData.songs.map(ref => 
            qortalRequest({
              action: "SEARCH_QDN_RESOURCES", service: "AUDIO", identifier: ref.identifier,
              name: ref.name, includeMetadata: true, limit: 1
            })
          );
          const results = await Promise.allSettled(promises);
          
          const foundSongs = results.filter(r => r.status === 'fulfilled' && r.value.length > 0).map(r => r.value[0])
            .map(item => ({
              id: item.identifier, title: item.metadata?.title || item.identifier, artist: item.name, 
              qdnData: item, artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}`
            }));
          setSongs(foundSongs);
        }

      } catch (error) {
        console.error("Error fetching playlist details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [playlistId]);

  if (isLoading) return <div className="page-container"><p>Loading playlist...</p></div>;
  if (!playlist) return <div className="page-container"><h2>Playlist Not Found</h2></div>;

  return (
    <div className="page-container playlist-detail-page">
      <div className="playlist-header">
        <h1>{playlist.title}</h1>
        <p>{playlist.description}</p>
        <span>Created by: {playlist.owner} • {songs.length} songs</span>
      </div>
      <div className="playlist-songs">
        {songs.length > 0 ? (
          <MusicList songsData={songs} onSongSelect={onSongSelect} onAddToPlaylistClick={onAddToPlaylistClick} listClassName="vertical-music-list"/>
        ) : (
          <p>This playlist is currently empty. Add some songs!</p>
        )}
      </div>
    </div>
  );
}

export default PlaylistDetailPage;