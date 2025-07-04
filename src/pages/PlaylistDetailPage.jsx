// src/pages/PlaylistDetailPage.jsx
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
      if (!playlistId || typeof qortalRequest === 'undefined') {
        setIsLoading(false); return;
      }
      setIsLoading(true);
      
      try {
        // SAMM 1: PÄRI PLAYLISTI INFO. Meil on vaja nime ja identifikaatorit.
        // Kõigepealt otsime selle ressursi üles, et saada avaldaja nimi.
        const playlistInfoResult = await qortalRequest({
          action: "SEARCH_QDN_RESOURCES",
          identifier: playlistId,
          limit: 1
        });
        
        if (!playlistInfoResult || playlistInfoResult.length === 0) throw new Error("Playlist not found.");

        const playlistInfo = playlistInfoResult[0];

        // Nüüd päri sisu, kasutades korrektset nime ja teenust
        const jsonString = await qortalRequest({
          action: "FETCH_QDN_RESOURCE",
          name: playlistInfo.name,
          service: "PLAYLIST", // Kasutame õiget teenust
          identifier: playlistId,
        });
        
        const data = JSON.parse(jsonString);
        setPlaylist(data);

        // SAMM 2: PÄRI IGA LAULU DETAILINFO
        if (data.songs && data.songs.length > 0) {
          const songDetailsPromises = data.songs.map(songRef => 
            qortalRequest({
              action: "SEARCH_QDN_RESOURCES",
              service: "AUDIO",
              identifier: songRef.identifier,
              name: songRef.name, // Kasutame playlistis olevat nime!
              includeMetadata: true,
              limit: 1
            })
          );
          const songResultsArrays = await Promise.allSettled(songDetailsPromises);
          
          const foundSongs = songResultsArrays
            .filter(res => res.status === 'fulfilled' && res.value.length > 0)
            .map(res => {
                const item = res.value[0];
                // Andmete vormindamine
                return { id: item.identifier, title: item.metadata?.title || item.identifier, artist: item.name, qdnData: item, artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}`};
            });
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
        <span>Created by: {playlist.owner || 'Unknown'} • {songs.length} songs</span>
      </div>
      <div className="playlist-songs">
        <h3>Songs in this playlist:</h3>
        {songs.length > 0 ? (
          <MusicList songsData={songs} onSongSelect={onSongSelect} onAddToPlaylistClick={onAddToPlaylistClick} listClassName="vertical-music-list"/>
        ) : (
          <p>This playlist is empty.</p>
        )}
      </div>
    </div>
  );
}
export default PlaylistDetailPage;