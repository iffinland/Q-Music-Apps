// src/pages/HomePage.jsx - TÖÖTAV JA LÕPLIK
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MusicList from '../components/MusicList';

/* global qortalRequest */

// Abikomponent pildi kuvamiseks, et vältida vigase pildi ikooni
const ArtworkImage = ({ src, alt }) => {
    const [isError, setIsError] = useState(false);
    const DefaultArtwork = () => (<div className="default-artwork"><svg width="40" height="40" viewBox="0 0 24 24"><path fill="#888" d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z" /></svg></div>);
    if (isError || !src) return <DefaultArtwork />;
    return <img src={src} alt={alt} onError={() => setIsError(true)} />;
};

function HomePage({ onSongSelect, onAddToPlaylistClick }) {
    // Kustutame ära `songs` prop'i, sest see komponent pärib ise oma laulud. See on puhtam.
    // See oli minu varasem viga.
    
    const [latestSongs, setLatestSongs] = useState([]);
    const [latestPlaylists, setLatestPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        if (typeof qortalRequest === 'undefined') {
            setIsLoading(false);
            return;
        }

        try {
            // Päri laulud (see osa on korras)
            const songResults = await qortalRequest({
                action: "SEARCH_QDN_RESOURCES",
                service: "AUDIO",
                includeMetadata: true,
                limit: 10,
                reverse: true,
            });
            if (Array.isArray(songResults)) {
                const formattedSongs = songResults.map(item => {
                    let finalArtist = item.name || "Unknown";
                    if(item.metadata?.description?.includes('artist=')) {
                        const match = item.metadata.description.match(/artist=([^;]+)/);
                        if (match?.[1]) finalArtist = match[1].trim();
                    }
                    return {
                        id: item.identifier, title: item.metadata?.title || item.identifier, artist: finalArtist,
                        qdnData: { name: item.name, service: 'AUDIO', identifier: item.identifier },
                        artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}`
                    };
                });
                setLatestSongs(formattedSongs);
            }

            console.log("HomePage: Loading playlists...");
            const playlistResults = await qortalRequest({
                action: "SEARCH_QDN_RESOURCES",
                service: "DOCUMENT", // Kasutame õiget teenust
                identifier: "qmusic_playlist_",
                prefix: true,
                includeMetadata: true, // Küsides metaandmeid, saame 'title'
                limit: 5,
                reverse: true
            });

            console.log("All playlists loaded:", playlistResults);

            if (Array.isArray(playlistResults) && playlistResults.length > 0) {
                 setLatestPlaylists(playlistResults.map(p => ({
                     id: p.identifier,
                     name: p.metadata?.title || p.identifier, // Kasutame metaandmete tiitlit
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
}, []);

    return (
        <div className="homepage">
            <section className="horizontal-scroll-section">
                <p><font color="orange"><h4><b>The application is currently in ALPHA status.</b></h4></font></p>
                <h2>Latest uploaded songs</h2>
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
                <h2>Recent Created Playlists</h2>
                {isLoading ? (
                    <p>Loading playlists...</p>
                ) : (
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
                        )) : <p>No playlists found yet.</p>}
                    </div>
                )}
            </section>
        </div>
    );
}

export default HomePage;