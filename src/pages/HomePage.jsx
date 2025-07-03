// src/pages/HomePage.jsx - KORREKTNE KAHEASTMELINE PÄRING
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

            const songPromise = qortalRequest({ action: "SEARCH_QDN_RESOURCES", service: "AUDIO", includeMetadata: true, limit: 25, reverse: true });
            const playlistPromise = qortalRequest({ action: "SEARCH_QDN_RESOURCES", service: "PLAYLIST", identifier: "qmusic_playlist_", prefix: true, includeMetadata: false, limit: 5, reverse: true });
            
            const [songResults, playlistResults] = await Promise.allSettled([songPromise, playlistPromise]);
            
            if (songResults.status === 'fulfilled' && Array.isArray(songResults.value)) {
                // Lihtne laulude vormindamine ilma piltideta (kiiremaks arenduseks)
                const formattedSongs = songResults.value.map(item => ({ id: item.identifier, title: item.metadata?.title || item.identifier, artist: item.name, qdnData: { name: item.name, service: 'AUDIO', identifier: item.identifier }, artworkUrl: null}));
                setLatestSongs(formattedSongs);
            }
            
            if (playlistResults.status === 'fulfilled' && Array.isArray(playlistResults.value) && playlistResults.value.length > 0) {
                // Kaheastmeline päring playlistide detailide jaoks
                const playlistsWithDetails = await Promise.all(
                    playlistResults.value.map(async (p) => {
                        try {
                            const jsonString = await qortalRequest({ action: "FETCH_QDN_RESOURCE", name: p.name, service: "PLAYLIST", identifier: p.identifier });
                            const data = JSON.parse(jsonString);
                            return { id: p.identifier, name: data.title || p.identifier, owner: p.name, artworkUrl: `/thumbnail/${encodeURIComponent(p.name)}/${encodeURIComponent(p.identifier)}` };
                        } catch { return null; }
                    })
                );
                setLatestPlaylists(playlistsWithDetails.filter(Boolean));
            }

            setIsLoading(false);
        };
        fetchData();
    }, []);

    const renderPlaylistsSection = () => {
        if (isLoading) return <p>Loading playlists...</p>;
        if (latestPlaylists.length === 0) return <p>No Q-Music playlists found yet.</p>;
        return (
            <div className="horizontal-playlist-grid">
                {latestPlaylists.map(playlist => (
                    <Link to={`/playlist/${playlist.id}`} key={playlist.id} className="playlist-card">
                        <div className="song-item-artwork"> <ArtworkImage src={playlist.artworkUrl} alt={playlist.name} /> </div>
                        <h4>{playlist.name}</h4>
                        <span className="playlist-owner">By: {playlist.owner}</span>
                    </Link>
                ))}
            </div>
        );
    };

    return (
        <div className="homepage">
            <section className="horizontal-scroll-section">
                <h2>Popular Songs</h2>
                {isLoading ? <p>Loading songs...</p> : <MusicList songsData={latestSongs} onSongSelect={onSongSelect} listClassName="horizontal-music-list" />}
            </section>
            <section className="horizontal-scroll-section">
                <h2>Recent Playlists</h2>
                {renderPlaylistsSection()}
            </section>
        </div>
    );
}
export default HomePage;