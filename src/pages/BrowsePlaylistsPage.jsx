// src/pages/BrowsePlaylistsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Pagination from '../components/Pagination';
import PlatformFilter from '../components/PlatformFilter';

/* global qortalRequest */

const ArtworkImage = ({ src, alt }) => {
  const [isError, setIsError] = useState(false);
  const DefaultArtwork = () => (
    <div className="default-artwork">
      <svg width="40" height="40" viewBox="0 0 24 24">
        <path fill="#888" d="M19,9H2V11H19V9M19,5H2V7H19V5M2,15H15V13H2V15M17,13V19L22,16L17,13Z" />
      </svg>
    </div>
  );

  if (isError || !src) return <DefaultArtwork />;
  return <img src={src} alt={alt} onError={() => setIsError(true)} />;
};

function BrowsePlaylistsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPlaylists, setTotalPlaylists] = useState(0);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentPlatform = searchParams.get('platform') || 'all';
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);

      if (typeof qortalRequest === 'undefined') {
        console.warn("Qortal API not available.");
        setIsLoading(false);
        return;
      }

      try {
        // 1. Esmalt hankime koguste info
        const countRequestObject = {
          action: "SEARCH_QDN_RESOURCES",
          service: "PLAYLIST",
          limit: 1000, // Suur number, et saada koguseks võimalikult täpne tulem
        };

        // Platform filter for count
        if (currentPlatform === 'qmusic') {
          countRequestObject.identifier = 'qmusic_';
          countRequestObject.prefix = true;
        } else if (currentPlatform === 'earbump') {
          countRequestObject.identifier = 'earbump_';
          countRequestObject.prefix = true;
        }

        const countResults = await qortalRequest(countRequestObject);

        const totalCount = Array.isArray(countResults) ? countResults.length : 0;
        setTotalPlaylists(totalCount);

        // 2. Siis hankime tegelikud tulemused paginatsiooniga
        const playlistRequestObject = {
          action: "SEARCH_QDN_RESOURCES",
          service: "PLAYLIST",
          includeMetadata: true,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
          reverse: true,
        };

        // Platform filter for actual results
        if (currentPlatform === 'qmusic') {
          playlistRequestObject.identifier = 'qmusic_';
          playlistRequestObject.prefix = true;
        } else if (currentPlatform === 'earbump') {
          playlistRequestObject.identifier = 'earbump_';
          playlistRequestObject.prefix = true;
        }

        const playlistResults = await qortalRequest(playlistRequestObject);

        if (Array.isArray(playlistResults) && playlistResults.length > 0) {
          const formattedPlaylists = playlistResults.map(item => {
            const filename = item.filename || `${item.identifier}.json`; // Fallback kui filename puudub
            const title = item.title || item.metadata?.title || (filename ? filename.replace('.json', '') : item.identifier);
            const description = item.description || item.metadata?.description || '';

            return {
              id: item.identifier,
              name: title,
              owner: item.name,
              filename,
              identifier: item.identifier,
              artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}`,
              description
            };
          });

          setPlaylists(formattedPlaylists);
        } else {
          setPlaylists([]);
        }

      } catch (e) {
        console.error("Error fetching playlists:", e);
        setPlaylists([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, [currentPage, currentPlatform]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1) setSearchParams({ page: newPage.toString(), platform: currentPlatform });
  };

  const handlePlatformChange = (platform) => {
    setSearchParams({ page: '1', platform: platform });
  };

  return (
    <div className="page-container browse-page">
      <h2>Browse All Q-Music Playlists</h2>

      <PlatformFilter 
        currentPlatform={currentPlatform} 
        onPlatformChange={handlePlatformChange} 
      />

      <div className="browse-results">
        {isLoading ? (
          <p>Loading playlists...</p>
        ) : (
          <div className="playlist-grid">
            {playlists.length > 0 ? (
              playlists.map(playlist => (
                <Link
                  to={`/playlist/${encodeURIComponent(playlist.owner)}/${encodeURIComponent(playlist.identifier)}/${encodeURIComponent(playlist.filename)}`}
                  key={playlist.id}
                  className="playlist-card"
                >
                  <div className="song-item-artwork">
                    <ArtworkImage src={playlist.artworkUrl} alt={playlist.name} />
                  </div>
                  <div className="playlist-card-info">
                    <h4>{playlist.name}</h4>
                    <p className="playlist-card-description">{playlist.description}</p>
                    <span className="playlist-owner">By: {playlist.owner}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p>No playlists have been created yet.</p>
            )}
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalPlaylists}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        itemType="playlists"
      />
    </div>
  );
}

export default BrowsePlaylistsPage;