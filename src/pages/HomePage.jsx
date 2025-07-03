// src/pages/HomePage.jsx - PARANDATUD JA KOOS KIRJELDUSEGA
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MusicList from '../components/MusicList';

/* global qortalRequest */

const ArtworkImage = ({ src, alt }) => {
    const [isError, setIsError] = useState(false);
    const DefaultArtwork = () => (<div className="default-artwork"><svg width="40" height="40" viewBox="0 0 24 24"><path fill="#888" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg></div>);
    if (isError || !src) return <DefaultArtwork />;
    return <img src={src} alt={alt} onError={() => setIsError(true)} />;
};

function HomePage({ onSongSelect }) {
    const [latestSongs, setLatestSongs] = useState([]);
    const [latestPlaylists, setLatestPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            if (typeof qortalRequest === 'undefined') { setIsLoading(false); return; }

            const songPromise = qortalRequest({ action: "SEARCH_QDN_RESOURCES", service: "AUDIO", includeMetadata: true, limit: 25, reverse: true, });
            const playlistPromise = qortalRequest({ action: "SEARCH_QDN_RESOURCES", service: "PLAYLIST", identifier: "qmusic_playlist_", prefix: true, limit: 5, reverse: true });

            const [songResults, playlistResults] = await Promise.allSettled([songPromise, playlistPromise]);
            
            if (songResults.status === 'fulfilled' && Array.isArray(songResults.value)) {
                const formattedSongs = songResults.value.map(item => {
                    let finalArtist = item.name || "Unknown";
                    if(item.metadata?.description?.includes('artist=')) {
                        const artistMatch = item.metadata.description.match(/artist=([^;]+)/);
                        if (artistMatch?.[1]) finalArtist = artistMatch[1].trim();
                    }
                    return {
                        id: item.identifier, title: item.metadata?.title || item.identifier, artist: finalArtist, 
                        qdnData: { name: item.name, service: 'AUDIO', identifier: item.identifier }, 
                        artworkUrl: `/thumbnail/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}`
                    };
                });
                setLatestSongs(formattedSongs);
            }
            
            if (playlistResults.status === 'fulfilled' && Array.isArray(playlistResults.value)) {
                const playlistsWithDetails = await Promise.all(
                    playlistResults.value.map(async (p_info) => {
                        try {
                            const jsonString = await qortalRequest({ action: "FETCH_QDN_RESOURCE", name: p_info.name, service: "PLAYLIST", identifier: p_info.identifier });
                            const data = JSON.parse(jsonString);
                            return {
                                id: p_info.identifier,
                                name: data.title || p_info.identifier,
                                description: data.description || "",
                                owner: p_info.name,
                                artworkUrl: `/thumbnail/${encodeURIComponent(p_info.name)}/${encodeURIComponent(p_info.identifier)}`
                            };
                        } catch { return null; }
                    })
                );
                setLatestPlaylists(playlistsWithDetails.filter(p => p !== null));
            }

            setIsLoading(false);
        };

        fetchData();
    }, []);

    return (
        <div className="homepage">
            <section className="horizontal-scroll-section">
                <h2>Popular Songs</h2>
                {isLoading ? <p>Loading...</p> : <MusicList songsData={latestSongs} onSongSelect={onSongSelect} listClassName="horizontal-music-list" />}
            </section>
            
            <section className="horizontal-scroll-section">
                <h2>Recent Playlists</h2>
                {isLoading ? <p>Loading...</p> : (
                    <div className="horizontal-playlist-grid">
                        {latestPlaylists.map(playlist => (
                            <Link to={`/playlist/${playlist.id}`} key={playlist.id} className="playlist-card">
                                <div className="song-item-artwork">
                                   <ArtworkImage src={playlist.artworkUrl} alt={playlist.name} />
                                </div>
                                <div className="playlist-card-info">
                                    <h4>{playlist.name}</h4>
                                    <p className="playlist-card-description">{playlist.description}</p>
                                </div>
                                <span className="playlist-owner">By: {playlist.owner}</span>
                            </Link>
                        ))}
                        {latestPlaylists.length === 0 && !isLoading && <p>No Q-Music playlists found yet.</p>}
                    </div>
                )}
            </section>
        </div>
    );
}
export default HomePage;