import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MusicList from '../components/MusicList';

/* global qortalRequest */

function SearchResultsPage({ onSongSelect = () => {}, onAddToPlaylistClick = () => {} }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || !query.trim()) return;

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      setResults([]);

      try {
        const requestObject = {
          action: "SEARCH_QDN_RESOURCES",
          service: "AUDIO",
          query: query.trim(),
          includeMetadata: true,
          limit: 50,
          reverse: true,
        };

        const searchResults = await qortalRequest(requestObject);
        console.log("Search API response:", searchResults);

        if (Array.isArray(searchResults) && searchResults.length > 0) {
          const formatted = searchResults.map(item => {
            let artist = item.name || "Unknown";

            if (item.metadata?.description?.includes("artist=")) {
              const match = item.metadata.description.match(/artist=([^;]+)/);
              if (match?.[1]) artist = match[1].trim();
            }

            return {
              id: item.identifier,
              title: item.metadata?.title || item.identifier,
              artist,
              qdnData: {
                name: item.name,
                identifier: item.identifier,
                service: "AUDIO"
              },
              artworkUrl: `/arbitrary/THUMBNAIL/${encodeURIComponent(item.name)}/${encodeURIComponent(item.identifier)}`
            };
          });

          setResults(formatted);
        } else {
          setResults([]);
        }

      } catch (e) {
        console.error("Search error:", e);
        setError(`Search failed: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query]);

  return (
    <div className="page-container search-results-page">
      {query ? (
        <>
          <h2>Search results for: "{query}"</h2>

          {isLoading && <p>Searching...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!isLoading && !error && results.length === 0 && (
            <p>No songs were found matching this query.</p>
          )}

          {!isLoading && results.length > 0 && (
            <MusicList
              songsData={results}
              onSongSelect={onSongSelect}
              onAddToPlaylistClick={onAddToPlaylistClick}
              listClassName="song-grid"
            />
          )}
        </>
      ) : (
        <h2>Please enter a search term in the search box.</h2>
      )}
    </div>
  );
}

export default SearchResultsPage;