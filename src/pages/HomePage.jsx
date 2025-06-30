// src/pages/HomePage.jsx - LÕPLIK PARANDUS
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
                setError("Qortali API-t ei leitud. Palun kasuta Qortali keskkonnas.");
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
                            // Kui thumbnaili pärimine ebaõnnestub, lihtsalt jätkame ilma selleta
                        }
                        
                        let finalArtist = item.name || "Tundmatu Esitaja";
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
                console.error("Viga laulude nimekirja pärimisel:", e);
                setError(`Viga andmete laadimisel: ${e.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSongsAndArtworks();
    }, []);

    const renderSongsSection = () => {
        if (isLoading) return <p>Laen lugusid QDN-ist...</p>;
        if (error) return <p style={{ color: 'red' }}>{error}</p>;
        if (latestSongs.length === 0) return <p>Lugusid ei leitud.</p>;
        return ( <MusicList songsData={latestSongs} onSongSelect={onSongSelect} listClassName="horizontal-music-list" /> );
    };

    const mockPlaylists = [ { id: 'pl1', name: 'Suve Hitis', songCount: 12 }, { id: 'pl2', name: 'Treni Muusika', songCount: 25 }, { id: 'pl3', name: 'Rahulikud Õhtud', songCount: 30 }, ];

    // **** SIIN ON PARANDUS ****
    return (
        <div className="homepage">
            <section className="horizontal-scroll-section">
                <h2>Populaarsed Lood</h2>
                {renderSongsSection()}
            </section>
            <section className="horizontal-scroll-section">
                <h2>Populaarsed Playlistid</h2>
                <div className="horizontal-playlist-grid">
                    {mockPlaylists.map(playlist => (
                        <div key={playlist.id} className="playlist-card">
                            <h4>{playlist.name}</h4>
                            <p>{playlist.songCount} laulu</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
export default HomePage;