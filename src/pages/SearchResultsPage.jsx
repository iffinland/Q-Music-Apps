// src/pages/SearchResultsPage.jsx - PÄRIS OTSINGUFUNKTSIONAALSUSEGA
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MusicList from '../components/MusicList'; // Kasutame laulude kuvamiseks

/* global qortalRequest */

// See leht vajab onSongSelect funktsiooni, et playerit uuendada.
// Peame selle App.jsx-ist edasi andma.
function SearchResultsPage({ onSongSelect = () => {} }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q'); // Hangi 'q' parameeter URL-ist

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Käivitame otsingu ainult siis, kui URL-is on otsingusõna
    if (query) {
      const performSearch = async () => {
        setIsLoading(true);
        setError(null);
        setResults([]);

        if (typeof qortalRequest === 'undefined') {
          setError("Qortali API pole kättesaadav.");
          setIsLoading(false);
          return;
        }

        try {
          console.log(`Search QDN: "${query}"`);

          const requestObject = {
            action: "SEARCH_QDN_RESOURCES",
            query: query, // Üldine otsingusõna
            service: "AUDIO",
            includeMetadata: true,
            limit: 50, // Näitame kuni 50 vastet
            reverse: true, // Uusimad esimesena
          };

          const searchResults = await qortalRequest(requestObject);
          console.log("Search API response:", searchResults);

if (Array.isArray(results) && results.length > 0) {
  const formatted = results.map(item => {
    let finalArtist = item.name || "Unknown Artist";
    // ... (sinu olemasolev artisti parsimise loogika) ...

    return {
      id: item.identifier,
      title: item.metadata?.title || item.identifier,
      artist: finalArtist,
      qdnData: { name: item.name, service: item.service, identifier: item.identifier },
      // **** UUS OSA: Loome pildi URL-i ****
      artworkUrl: `/thumbnail/${item.name}/${item.identifier}`
      // See on suhteline URL. Qortali UI keskkond peaks selle muutma
      // täisaadressiks (http://localhost:12391/thumbnail/...).
    };
  });
  setLatestSongs(formatted);
          } else {
            setResults([]); // Tulemusi ei leitud
          }
        } catch (e) {
          console.error("Search error:", e);
          setError(`Search failed: ${e.message}`);
        } finally {
          setIsLoading(false);
        }
      };

      performSearch();
    }
  }, [query]); // Käivita uuesti AINULT siis, kui 'query' URL-is muutub

  return (
    <div className="page-container search-results-page">
      {query ? (
        <>
          <h2>Search results for the query: "{query}"</h2>
          <div className="browse-results">
            {isLoading && <p>Searching...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!isLoading && !error && results.length === 0 && <p>No songs were found with this query..</p>}
            {!isLoading && !error && results.length > 0 && (
              // Kasutame sama song-grid stiili, mis sirvimise lehel
              <MusicList songsData={results} onSongSelect={onSongSelect} listClassName="song-grid" />
            )}
          </div>
        </>
      ) : (
        <h2>Please enter your search term in the search box..</h2>
      )}
    </div>
  );
}

export default SearchResultsPage;