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
                const playlistInfoResult = await qortalRequest({
                    action: "SEARCH_QDN_RESOURCES",
                    identifier: playlistId,
                    limit: 1
                });
                if (!playlistInfoResult?.[0]) throw new Error("Playlist not found.");
                const playlistInfo = playlistInfoResult[0];

                const playlistData = await qortalRequest({
                    action: "FETCH_QDN_RESOURCE",
                    name: playlistInfo.name,
                    service: "PLAYLIST",
                    identifier: playlistId,
                });
                
                // Kontrollime, kas vastus on objekt. Kui on, kasutame seda otse.
                if (typeof playlistData === 'object' && playlistData !== null) {
                    setPlaylist(playlistData);
                    
                    if (playlistData.songs && playlistData.songs.length > 0) {
                        const songDetailsPromises = playlistData.songs.map(songRef =>
                            qortalRequest({
                                action: "SEARCH_QDN_RESOURCES", service: "AUDIO",
                                identifier: songRef.identifier, name: songRef.name,
                                includeMetadata: true, limit: 1
                            })
                        );
                        const songResultsArrays = await Promise.allSettled(songDetailsPromises);
                        
                        const foundSongs = songResultsArrays
                            .filter(res => res.status === 'fulfilled' && res.value.length > 0)
                            .map(res => {
                                const item = res.value[0];
                                return { id: item.identifier, title: item.metadata?.title || item.identifier, artist: item.name, qdnData: item, artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}` };
                            });
                        setSongs(foundSongs);
                    }
                } else {
                    throw new Error("Playlist data is not a valid object.");
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
                    <MusicList songsData={songs} onSongSelect={onSongSelect} onAddToPlaylistClick={onAddToPlaylistClick} listClassName="vertical-music-list" />
                ) : (
                    <p>This playlist is empty. Add some songs!</p>
                )}
            </div>
        </div>
    );
}
export default PlaylistDetailPage;