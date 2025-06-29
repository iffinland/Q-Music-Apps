// src/pages/HomePage.jsx - ROBUSTNE JA LIHTSUSTATUD API KUTSEGA
import React, { useState, useEffect } from 'react';
import MusicList from '../components/MusicList';

/* global qortalRequest */

function HomePage({ onSongSelect }) {
  const [latestSongs, setLatestSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Lisame eraldi veateate oleku

  useEffect(() => {
    // Eraldame asünkroonse loogika eraldi funktsiooni, see on hea praktika
    const fetchSongsFromQDN = async () => {
      // Veendume, et meil on API olemas enne jätkamist
      if (typeof qortalRequest === 'undefined') {
        setError("Qortali API pole kättesaadav. See rakendus töötab ainult Qortali keskkonnas.");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Alustan lugude pärimist QDN-ist...");
        
        const requestObject = {
          action: "SEARCH_QDN_RESOURCES",
          service: "AUDIO",
          identifier: "earbump",
          prefix: true, 
          includeMetadata: true,
          limit: 25,
          reverse: true,
        };
        
        const results = await qortalRequest(requestObject);
        console.log("QDN API vastus:", results);

        if (!Array.isArray(results)) {
          console.warn("API vastus ei olnud massiiv:", results);
          throw new Error("API tagastas ootamatu formaadiga andmed.");
        }

        if (results.length === 0) {
          console.log("Ei leidnud ühtegi vastet kriteeriumitele.");
          setLatestSongs([]);
        } else {
          // Turvaline andmete vormindamine
          const formatted = results.map(item => {
            // Kontrollime hoolikalt, kas kõik väljad on olemas
            const defaultArtist = item.name || "Tundmatu Esitaja";
            const defaultTitle = item.metadata?.title || item.identifier || "Tundmatu Lugu";

            let finalArtist = defaultArtist;
            // Turvaline viis artisti leidmiseks kirjeldusest
            if (item.metadata?.description && typeof item.metadata.description === 'string') {
              const artistMatch = item.metadata.description.match(/artist=([^;]+)/);
              if (artistMatch && artistMatch[1]) {
                finalArtist = artistMatch[1].trim();
              }
            }
            
            return {
              id: item.identifier,
              title: defaultTitle,
              artist: finalArtist,
              qdnData: { // Salvestame ainult vajaliku info
                name: item.name,
                service: item.service,
                identifier: item.identifier
              }
            };
          }).filter(Boolean); // Eemaldab võimalikud tühjad väärtused

          console.log("Vormindatud laulud:", formatted);
          setLatestSongs(formatted);
        }
      } catch (e) {
        console.error("Lugude pärimisel tekkis viga:", e);
        setError(`Viga andmete laadimisel: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongsFromQDN();
  }, []); // Käivitub ainult korra, kui komponent laetakse

  // Renderdamise loogika
  const renderContent = () => {
    if (isLoading) {
      return <p>Laen lugusid QDN-ist...</p>;
    }
    if (error) {
      return <p style={{ color: 'red' }}>{error}</p>; // Kuvame vea otse kasutajale
    }
    if (latestSongs.length === 0) {
      return <p>Ei leidnud ühtegi lugu. Proovi hiljem uuesti.</p>;
    }
    return (
      <MusicList
        songsData={latestSongs}
        onSongSelect={onSongSelect}
        listClassName="horizontal-music-list"
      />
    );
  };

  return (
    <div className="homepage">
      <section className="horizontal-scroll-section">
        <h2>Populaarsed Lood</h2>
        {renderContent()}
      </section>
      
      {/* Hoiame playlistide osa lihtsana, et välistada siit tulevaid vigu */}
      <section className="horizontal-scroll-section">
        <h2>Populaarsed Playlistid</h2>
        <p>(Playlistide funktsionaalsus on tulemas...)</p>
      </section>
    </div>
  );
}

export default HomePage;