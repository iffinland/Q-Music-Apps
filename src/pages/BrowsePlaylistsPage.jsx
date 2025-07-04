// src/pages/BrowsePlaylistsPage.jsx - KASUTADES HomePage TÖÖTAVAT KOODI
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

/* global qortalRequest */

// Artwork abikomponent, nagu HomePage'is
const ArtworkImage = ({ src, alt }) => {
    const [isError, setIsError] = useState(false);
    const DefaultArtwork = () => (<div className="default-artwork"><svg width="40" height="40" viewBox="0 0 24 24"><path fill="#888" d="M19,9H2V11H19V9M19,5H2V7H19V5M2,15H15V13H2V15M17,13V19L22,16L17,13Z" /></svg></div>);
    if (isError || !src) return <DefaultArtwork />;
    return <img src={src} alt={alt} onError={() => setIsError(true)} />;
};

function BrowsePlaylistsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const limit = 50; // Sirvimise lehel on suurem limiit

  useEffect(() => {
    const fetchPlaylists = async () => {
        setIsLoading(true);
        if (typeof qortalRequest === 'undefined') {
            setIsLoading(false);
            return;
        }

        try {
            // See on peaaegu identne töötava HomePage päringuga
            const results = await qortalRequest({
                action: "SEARCH_QDN_RESOURCES",
                service: "PLAYLIST",
                identifier: "qmusic_playlist_",
                prefix: true,
                includeMetadata: true, // Küsides metaandmeid, saame title
                limit: limit,
                offset: (currentPage - 1) * limit,
                reverse: true
            });

            console.log("BrowsePlaylistsPage sai vastuseks:", results);

            if (Array.isArray(results) && results.length > 0) {
                 const formattedPlaylists = results.map(item => ({
                    id: item.identifier,
                    name: item.metadata?.title || item.identifier,
                    owner: item.name,
                    artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}`,
                    description: item.metadata?.description || ""
                 }));
                 setPlaylists(formattedPlaylists);
            } else {
              setPlaylists([]);
            }

        } catch (e) {
            console.error("Error fetching playlists for browse page:", e);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchPlaylists();
  }, [currentPage]); // Sõltuvus ainult lehekülje numbrist

  const handlePageChange = (newPage) => {
    if (newPage >= 1) setSearchParams({ page: newPage.toString() });
  };

  return (
    <div className="page-container browse-page">
      <h2>Browse All Q-Music Playlists</h2>
      
      <div className="browse-results">
        {isLoading ? <p>Loading playlists...</p> : (
          <div className="playlist-grid">
            {playlists.length > 0 ? playlists.map(playlist => (
              <Link to={`/playlist/${playlist.id}`} key={playlist.id} className="playlist-card">
                <div className="song-item-artwork">
                  <ArtworkImage src={playlist.artworkUrl} alt={playlist.name} />
                </div>
                <div className="playlist-card-info">
                  <h4>{playlist.name}</h4>
                </div>
                <span className="playlist-owner">By: {playlist.owner}</span>
              </Link>
            )) : <p>No playlists have been created yet.</p>}
          </div>
        )}
      </div>

      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading}>« Previous</button>
        <span>Page {currentPage}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={playlists.length < limit || isLoading}>Next »</button>
      </div>
    </div>
  );
}
export default BrowsePlaylistsPage;