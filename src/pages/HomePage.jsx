// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

function HomePage({ onSongSelect, onAddToPlaylistClick }) {
    const [latestSongs, setLatestSongs] = useState([]);
    const [latestPlaylists, setLatestPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    const navigate = useNavigate();
    const location = useLocation();

    
    useEffect(() => {
        if (location.state?.refreshSongs && location.state?.newSong) {
            console.log('Navigation with new song detected:', location.state.newSong);
            setLatestSongs(prev => {
                if (!prev.some(song => song.id === location.state.newSong.id)) {
                    return [location.state.newSong, ...prev];
                }
                return prev;
            });

            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    // Käsitleme songPublished sündmust
    useEffect(() => {
        const handleSongPublished = (event) => {
            console.log('Song published event received:', event.detail);
            // Lisame uue laulu kohe UI-sse
            setLatestSongs(prev => {
                // Kontrolli, et ei lisaks sama laulu mitu korda
                if (!prev.some(song => song.id === event.detail.id)) {
                    return [event.detail, ...prev];
                }
                return prev;
            });
            // Käivitame täieliku värskendamise
            setRefreshTrigger(prev => prev + 1);
        };

        window.addEventListener('songPublished', handleSongPublished);
        return () => {
            window.removeEventListener('songPublished', handleSongPublished);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (typeof qortalRequest === 'undefined') {
                setIsLoading(false);
                return;
            }

            try {
                // Kõige lihtsam otsing - lihtsalt kõik AUDIO ressursid
                const songResults = await qortalRequest({
                    action: "SEARCH_QDN_RESOURCES",
                    service: "AUDIO",
                    identifier: "qmusic_track",
                    default: false,
                    includeStatus: false,
                    includeMetadata: true,
                    followedOnly: false,
                    excludeBlocked: false,
                    limit: 10,
                    offset: 0,
                    reverse: true,
                    names: [],
                    keywords: [],
                    exactMatchNames: true,
                    prefix: false
                });

                console.log('QDN SEARCH RESULTS:', songResults?.length || 0, 'songs found');
                if (Array.isArray(songResults) && songResults.length > 0) {
                    console.log('All identifiers found:', songResults.map(s => s.identifier));
                }

                if (Array.isArray(songResults)) {
                    console.log('Processing songs:', songResults.length);
                    
                                        const formattedSongs = songResults.map(item => {
                        let finalArtist = item.name || "Unknown";
                        
                        return {
                            id: item.identifier,
                            title: item.identifier, 
                            artist: finalArtist,
                            created: item.created || 0, // QDN annab created otse
                            qdnData: {
                                name: item.name,
                                service: 'AUDIO',
                                identifier: item.identifier
                            },
                            artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}`
                        };
                    });

                    // Sort by creation time, newest first
                    formattedSongs.sort((a, b) => b.created - a.created);
                    
                    console.log('SORTED SONGS TOP 5:', formattedSongs.slice(0, 5).map(s => ({ 
                        id: s.id, 
                        title: s.title,
                        created: s.created 
                    })));

                    // Lihtsalt pane laulud esilehele
                    setLatestSongs(formattedSongs);
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
    }, [refreshTrigger]); // Lisa refreshTrigger sõltuvusena, et kutsuda värskendamist

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
                        songsData={latestSongs}
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