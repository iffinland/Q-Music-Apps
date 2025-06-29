// src/pages/SearchResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Hook URL-i query parameetrite lugemiseks
// import MusicList from '../components/MusicList'; // Võid seda kasutada tulemuste kuvamiseks
// import PlaylistGrid from '../components/PlaylistGrid';

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q'); // Hangi 'q' parameeter URL-ist

  const [songResults, setSongResults] = useState([]);
  const [playlistResults, setPlaylistResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      console.log(`Otsin tulemusi päringule: "${query}" (API kutse tuleks siia)`);
      // TODO: Siia tuleb API kutse Qortalist otsingutulemuste saamiseks
      // fetchSearchResults(query).then(data => {
      //   setSongResults(data.songs || []);
      //   setPlaylistResults(data.playlists || []);
      //   setIsLoading(false);
      // }).catch(error => {
      //   console.error("Otsingu viga:", error);
      //   setIsLoading(false);
      // });

      // Ajutine mock-tulemused
      setTimeout(() => {
        setSongResults([
          { id: 101, title: `Laul vastega "${query}" 1`, artist: "Otsingu Artist", duration: "3:30" },
          { id: 102, title: `Teine laul "${query}"`, artist: "Teine Artist", duration: "4:00" },
        ]);
        setPlaylistResults([
          { id: 201, name: `Playlist "${query}"`, songCount: 5 },
        ]);
        setIsLoading(false);
      }, 1000);
    }
  }, [query]); // Käivita uuesti, kui 'query' muutub

  if (isLoading) {
    return <p>Otsin tulemusi...</p>;
  }

  if (!query) {
    return <p>Palun sisesta otsingusõna.</p>;
  }

  return (
    <div>
      <h2>Otsingutulemused päringule: "{query}"</h2>

      {songResults.length > 0 && (
        <section>
          <h3>Laulud</h3>
          {/* Võid siin kasutada MusicList komponenti, kui see on sobivaks refaktoreeritud */}
          <ul>
            {songResults.map(song => (
              <li key={song.id}>{song.title} - {song.artist}</li>
            ))}
          </ul>
        </section>
      )}

      {playlistResults.length > 0 && (
        <section style={{marginTop: '2rem'}}>
          <h3>Playlistid</h3>
          <ul>
            {playlistResults.map(pl => (
              <li key={pl.id}>{pl.name} ({pl.songCount} laulu)</li>
            ))}
          </ul>
        </section>
      )}

      {songResults.length === 0 && playlistResults.length === 0 && !isLoading && (
        <p>Ei leidnud tulemusi päringule "{query}".</p>
      )}
    </div>
  );
}

export default SearchResultsPage;