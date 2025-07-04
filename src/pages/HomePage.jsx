// src/pages/HomePage.jsx - PARANDATUD FUNKTSIOONI SIGANTUURIGA
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MusicList from '../components/MusicList';

/* global qortalRequest */

const ArtworkImage = ({ src, alt }) => {
    const [isError, setIsError] = useState(false);
    const DefaultArtwork = () => (<div className="default-artwork"><svg width="40" height="40" viewBox="0 0 24 24"><path fill="#888" d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z" /></svg></div>);
    if (isError || !src) return <DefaultArtwork />;
    return <img src={src} alt={alt} onError={() => setIsError(true)} />;
};

// **** SIIN ON PARANDATUD FUNKTSIOONI SIGANTUUR ****
function HomePage({ songs, onSongSelect, onAddToPlaylistClick }) {
    const [latestPlaylists, setLatestPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // See useEffect pärib ainult playliste. Laulud tulevad propsidena App.jsx-ist
    useEffect(() => {
        setIsLoading(true); // Seame laadimise alguse

        const fetchPlaylists = async () => {
            if (typeof qortalRequest === 'undefined') {
                setIsLoading(false);
                return;
            }
            try {
                const results = await qortalRequest({ action: "SEARCH_QDN_RESOURCES", service: "DOCUMENT", identifier: "qmusic_playlist_", prefix: true, includeMetadata: true, limit: 5, reverse: true });
                if (Array.isArray(results) && results.length > 0) {
                     const playlistsWithDetails = await Promise.all(
                        results.map(async p => { 
                            try { 
                                const json = await qortalRequest({ action: "FETCH_QDN_RESOURCE", name: p.name, service: "DOCUMENT", identifier: p.identifier });
                                const data = JSON.parse(json);
                                return { id: p.identifier, name: data.title || p.identifier, owner: p.name, description: data.description || "", artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(p.name)}/${encodeURIComponent(p.identifier)}`};
                            } catch { return null; }
                        })
                     );
                     setLatestPlaylists(playlistsWithDetails.filter(p => p !== null));
                }
            } catch (e) {
                console.error("Error fetching playlists for homepage:", e);
            } finally {
                // Kuigi laulud on juba olemas, näitame laadimist, kuni playlistid on ka laetud
                setIsLoading(false);
            }
        };

        fetchPlaylists();
        // Kuna laulud tulevad propsidena, siis me ei pea neid siin uuesti pärima
        // see teeb komponendi kiiremaks ja loogilisemaks. App.jsx hoolitseb laulude eest.
    }, []);


    return (
        <div className="homepage">
            <section className="horizontal-scroll-section">
                <h2>Popular Songs</h2>
                {/* Me ei vaja siin laulude laadimise indikaatorit, sest nad on juba olemas propsides */}
                <MusicList
                    songsData={songs} // Kasutame App.jsx-ist saadud laule
                    onSongSelect={onSongSelect}
                    onAddToPlaylistClick={onAddToPlaylistClick}
                    listClassName="horizontal-music-list"
                />
            </section>
            
            <section className="horizontal-scroll-section">
                <h2>Recent Playlists</h2>
                {isLoading ? <p>Loading playlists...</p> : (
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