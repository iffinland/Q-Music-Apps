// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MusicList from '../components/MusicList';

/* global qortalRequest */

const ArtworkImage = ({ src, alt }) => {
    const [isError, setIsError] = useState(false);
    const DefaultArtwork = () => (
        <div className="default-artwork">
            <svg width="40" height="40" viewBox="0 0 24 24">
                <path fill="#888" d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z" />
            </svg>
        </div>
    );
    return isError || !src
        ? <DefaultArtwork />
        : <img src={src} alt={alt} onError={() => setIsError(true)} />;
};

function HomePage({ onSongSelect, onAddToPlaylistClick, refreshKey, optimisticSongs = [] }) {
    const [fetchedSongs, setFetchedSongs] = useState([]);
    const [latestPlaylists, setLatestPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [displayedSongs, setDisplayedSongs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (typeof qortalRequest === 'undefined') {
                setIsLoading(false);
                return;
            }

            try {
                const songResults = await qortalRequest({
                    action: "SEARCH_QDN_RESOURCES",
                    service: "AUDIO",
                    identifier: "qmusic_track_", // <-- OLULINE PARANDUS: Otsime ainult Q-Music laule
                    prefix: true,             // <-- OLULINE PARANDUS: Kasutame prefiksiga otsingut
                    includeMetadata: true,
                    limit: 15,
                    reverse: true,
                });

                if (Array.isArray(songResults)) {
                    const formattedSongs = songResults.map(item => {
                        let finalArtist = item.name || "Unknown";
                        if (item.metadata?.description?.includes('artist=')) {
                            const match = item.metadata.description.match(/artist=([^;]+)/);
                            if (match?.[1]) finalArtist = match[1].trim();
                        }
                        return {
                            id: item.identifier,
                            title: item.metadata?.title || item.identifier,
                            artist: finalArtist,
                            qdnData: {
                                name: item.name,
                                service: 'AUDIO',
                                identifier: item.identifier
                            },
                            artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}`
                        };
                    });

                    setFetchedSongs(formattedSongs);
                }

                // Use EXACT same search pattern as songs - no specific query filter
                const playlistResults = await qortalRequest({
                    action: "SEARCH_QDN_RESOURCES",
                    service: "PLAYLIST",
                    includeMetadata: true,
                    limit: 15,
                    reverse: true
                });

                if (Array.isArray(playlistResults) && playlistResults.length > 0) {
                    setLatestPlaylists(playlistResults.map(p => ({
                        id: p.identifier,
                        name: p.title || p.metadata?.title || p.identifier,
                        description: p.description || p.metadata?.description || '',
                        owner: p.name,
                        artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(p.name)}/${encodeURIComponent(p.identifier)}`
                    })));
                } else {
                    setLatestPlaylists([]);
                }

            } catch (e) {
                console.error("Data fetching error on HomePage:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [refreshKey]);

    // See efekt kombineerib koheselt lisatud laulud ja võrgust laetud laulud
    useEffect(() => {
        const combined = [...optimisticSongs, ...fetchedSongs];
        // Eemaldame duplikaadid, et vältida topeltkuvamist pärast sünkroniseerimist
        const unique = combined.reduce((acc, current) => {
            if (!acc.find(item => item.id === current.id)) {
                acc.push(current);
            }
            return acc;
        }, []);
        setDisplayedSongs(unique);
    }, [optimisticSongs, fetchedSongs]);

    return (
        <div className="homepage">
            <div className="alpha-status-banner">
                <h4>APP is currently in <span className="highlight-alpha">ALPHA</span> status and is not currently optimized for mobile.</h4>
            </div>

            <section className="horizontal-scroll-section">
                <h2>Recently published songs</h2>
                {isLoading ? (
                    <p>Loading songs...</p>
                ) : (
                    <MusicList
                        songsData={displayedSongs}
                        onSongSelect={onSongSelect}
                        onAddToPlaylistClick={onAddToPlaylistClick}
                        listClassName="horizontal-music-list"
                    />
                )}
            </section>

            <section className="horizontal-scroll-section">
                <h2>Recently Created Playlists</h2>
                {isLoading ? (
                    <p>Loading playlists...</p>
                ) : (
                    <div className="horizontal-playlist-grid">
                        {latestPlaylists.length > 0 ? latestPlaylists.map(playlist => (
                            <Link
                                key={playlist.id}
                                to={`/playlist/${playlist.owner}/${playlist.id}/index.json`}
                                className="playlist-card"
                            >
                                <div className="song-item-artwork">
                                    <ArtworkImage src={playlist.artworkUrl} alt={playlist.name} />
                                </div>
                                <div className="playlist-card-info">
                                    <h4>{playlist.name}</h4>
                                    <p className="playlist-card-description">{playlist.description}</p>
                                </div>
                                <span className="playlist-owner">By: {playlist.owner}</span>
                            </Link>
                        )) : <p>No playlists found yet.</p>}
                    </div>
                )}
            </section>
        </div>
    );
}

export default HomePage;