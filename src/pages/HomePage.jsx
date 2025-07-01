// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import MusicList from '../components/MusicList';
/* global qortalRequest */

function HomePage({ onSongSelect }) {
    const [latestSongs, setLatestSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchSongsAndArtworks = async () => {
            setIsLoading(true);
            setError(null);
            if (typeof qortalRequest === 'undefined') {
                setError("Qortal API not found. Please use Qortal in the environment..");
                setIsLoading(false);
                return;
            }

            try {
                const songList = await qortalRequest({
                    action: "SEARCH_QDN_RESOURCES",
                    service: "AUDIO",
                    includeMetadata: true,
                    limit: 25,
                    reverse: true,
                });

                if (!Array.isArray(songList) || songList.length === 0) {
                    setLatestSongs([]);
                } else {
                    const songDataPromises = songList.map(async (item) => {
                        let artworkDataUrl = null;
                        try {
                            const thumbnailData = await qortalRequest({
                                action: "FETCH_QDN_RESOURCE",
                                name: item.name,
                                service: "THUMBNAIL",
                                identifier: item.identifier,
                                encoding: "base64"
                            });
                            if (thumbnailData) {
                                artworkDataUrl = `data:image/jpeg;base64,${thumbnailData}`;
                            }
                        } catch (thumbError) {
                            
                        }
                        
                        let finalArtist = item.name || "Unknown Artist";
                        if (item.metadata?.description?.includes('artist=')) {
                            const artistMatch = item.metadata.description.match(/artist=([^;]+)/);
                            if (artistMatch?.[1]) {
                                finalArtist = artistMatch[1].trim();
                            }
                        }

                        return {
                            id: item.identifier,
                            title: item.metadata?.title || item.identifier,
                            artist: finalArtist,
                            qdnData: { name: item.name, service: 'AUDIO', identifier: item.identifier },
                            artworkUrl: artworkDataUrl,
                        };
                    });
                    const formattedSongs = await Promise.all(songDataPromises);
                    setLatestSongs(formattedSongs);
                }
            } catch (e) {
                console.error("Error retrieving song list:", e);
                setError(`Error loading data: ${e.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSongsAndArtworks();
    }, []);

    const renderSongsSection = () => {
        if (isLoading) return <p>Loading songs from QDN...</p>;
        if (error) return <p style={{ color: 'red' }}>{error}</p>;
        if (latestSongs.length === 0) return <p>No songs found.</p>;
        return ( <MusicList songsData={latestSongs} onSongSelect={onSongSelect} listClassName="horizontal-music-list" /> );
    };

    const mockPlaylists = [ { id: 'pl1', name: 'Summer Hitis', songCount: 12 }, { id: 'pl2', name: 'Training Music', songCount: 25 }, { id: 'pl3', name: 'Peaceful Evenings', songCount: 30 }, ];

    return (
        <div className="homepage">
            <section className="horizontal-scroll-section">
                <h2>Latest 25 songs released</h2>
                {renderSongsSection()}
            </section>
            <section className="horizontal-scroll-section">
                <h2>The latest 25 playlists created</h2>
                <div className="horizontal-playlist-grid">
                    {mockPlaylists.map(playlist => (
                        <div key={playlist.id} className="playlist-card">
                            <h4>{playlist.name}</h4>
                            <p>{playlist.songCount} songs</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
export default HomePage;