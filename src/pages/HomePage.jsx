// src/pages/HomePage.jsx
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

function HomePage({ onSongSelect }) {
    const [latestSongs, setLatestSongs] = useState([]);
    const [latestPlaylists, setLatestPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            if (typeof qortalRequest === 'undefined') { setIsLoading(false); return; }
            setIsLoading(true);

            const songPromise = qortalRequest({ action: "SEARCH_QDN_RESOURCES", service: "AUDIO", includeMetadata: true, limit: 25, reverse: true, });
            const playlistPromise = qortalRequest({ action: "SEARCH_QDN_RESOURCES", service: "PLAYLIST", identifier: "qmusic_playlist_", prefix: true, includeMetadata: true, limit: 5, reverse: true });
            
            const [songResults, playlistResults] = await Promise.allSettled([songPromise, playlistPromise]);
            
            if (songResults.status === 'fulfilled' && Array.isArray(songResults.value)) {
                const formattedSongs = songResults.value.map(item => {
                    let finalArtist = item.name || "Unknown";
                    if(item.metadata?.description?.includes('artist=')) {
                        const artistMatch = item.metadata.description.match(/artist=([^;]+)/);
                        if (artistMatch?.[1]) finalArtist = artistMatch[1].trim();
                    }
                    return { id: item.identifier, title: item.metadata?.title || item.identifier, artist: finalArtist, qdnData: { name: item.name, service: 'AUDIO', identifier: item.identifier }, artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}`};
                });
                setLatestSongs(formattedSongs);
            }
            
            if (playlistResults.status === 'fulfilled' && Array.isArray(playlistResults.value)) {
                setLatestPlaylists(playlistResults.value.map(item => ({
                    id: item.identifier,
                    name: item.metadata?.title || item.identifier,
                    owner: item.name,
                    artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}`,
                    description: item.metadata?.description || ""
                })));
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="homepage">
            <section className="horizontal-scroll-section">
                <h2>Popular Songs</h2>
                {isLoading ? <p>Loading songs...</p> : <MusicList songsData={latestSongs} onSongSelect={onSongSelect} listClassName="horizontal-music-list" />}
            </section>
            <section className="horizontal-scroll-section">
                <h2>Recent Playlists</h2>
                <div className="horizontal-playlist-grid">
                    {isLoading ? <p>Loading playlists...</p> : (
                      latestPlaylists.length > 0 ? latestPlaylists.map(playlist => (
                          <Link to={`/playlist/${playlist.id}`} key={playlist.id} className="playlist-card">
                              <div className="song-item-artwork">
                                 <ArtworkImage src={playlist.artworkUrl} alt={playlist.name} />
                              </div>
                              <div className="playlist-card-info">
                                  <h4>{playlist.name}</h4>
                              </div>
                              <span className="playlist-owner">By: {playlist.owner}</span>
                          </Link>
                      )) : <p>No playlists found yet.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
export default HomePage;