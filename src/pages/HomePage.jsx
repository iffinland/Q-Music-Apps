// src/pages/HomePage.jsx - LIHTSUSTATUD JA JÄRJESTIKUSTE PÄRINGUTEGA
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MusicList from '../components/MusicList';

/* global qortalRequest */

// Artwork komponendi jätame alles, see on hea.
const ArtworkImage = ({ src, alt }) => {
    const [isError, setIsError] = useState(false);
    const DefaultArtwork = () => (<div className="default-artwork"><svg width="40" height="40" viewBox="0 0 24 24"><path fill="#888" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg></div>);
    if (isError || !src) return <DefaultArtwork />;
    return <img src={src} alt={alt} onError={() => setIsError(true)} />;
};

function HomePage({ onSongSelect }) {
    const [latestSongs, setLatestSongs] = useState([]);
    const [latestPlaylists, setLatestPlaylists] = useState([]);
    // Üks üldine laadimise olek
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (typeof qortalRequest === 'undefined') {
                setIsLoading(false);
                return;
            }

            try {
                // ---- SAMM 1: PÄRI LAULUD ----
                console.log("HomePage: Pärin laule...");
                const songResults = await qortalRequest({
                    action: "SEARCH_QDN_RESOURCES", service: "AUDIO", includeMetadata: true, limit: 25, reverse: true
                });

                if (Array.isArray(songResults) && songResults.length > 0) {
                    const formattedSongs = songResults.map(item => {
                        let finalArtist = item.name || "Unknown";
                        if (item.metadata?.description?.includes('artist=')) {
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
                
                // ---- SAMM 2: PÄRI PLAYLISTID ----
                console.log("HomePage: Pärin playliste...");
                const playlistResults = await qortalRequest({
                    action: "SEARCH_QDN_RESOURCES", service: "PLAYLIST", identifier: "qmusic_playlist_",
                    prefix: true, includeMetadata: true, limit: 5, reverse: true
                });

                if (Array.isArray(playlistResults) && playlistResults.length > 0) {
                    const playlistsWithDetails = await Promise.all(
                        playlistResults.map(async (p_info) => {
                            try {
                                const jsonString = await qortalRequest({
                                    action: "FETCH_QDN_RESOURCE", name: p_info.name,
                                    service: "PLAYLIST", identifier: p_info.identifier
                                });
                                const data = JSON.parse(jsonString);
                                return {
                                    id: p_info.identifier,
                                    name: data.title || "Untitled Playlist",
                                    description: data.description || "",
                                    owner: p_info.name,
                                    artworkUrl: `/thumbnail/${encodeURIComponent(p_info.name)}/${encodeURIComponent(p_info.identifier)}`
                                };
                            } catch { return null; }
                        })
                    );
                    setLatestPlaylists(playlistsWithDetails.filter(p => p !== null));
                }
                
            } catch (error) {
                console.error("HomePage: Viga andmete pärimisel", error);
                // Võime siia lisada ka eraldi veateate state'i
            } finally {
                // Seame laadimise lõppenuks alles siis, kui MÕLEMAD päringud on tehtud.
                setIsLoading(false);
            }
        };

        fetchData();
    }, []); // Käivitub ainult korra


    return (
        <div className="homepage">
            <section className="horizontal-scroll-section">
                <h2>Popular Songs</h2>
                {isLoading ? <p>Loading data...</p> : (
                  latestSongs.length > 0
                    ? <MusicList songsData={latestSongs} onSongSelect={onSongSelect} listClassName="horizontal-music-list" />
                    : <p>No songs found.</p>
                )}
            </section>
            
            <section className="horizontal-scroll-section">
                <h2>Recent Playlists</h2>
                {isLoading ? <p>Loading data...</p> : (
                    <div className="horizontal-playlist-grid">
                        {latestPlaylists.length > 0 ? latestPlaylists.map(playlist => (
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
                        )) : <p>No Q-Music playlists found yet.</p>}
                    </div>
                )}
            </section>
        </div>
    );
}
export default HomePage;