// src/App.jsx - TÄIELIK
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Player from './components/Player';
import Sidebar from './components/Sidebar';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import HomePage from './pages/HomePage';
import AddMusicPage from './pages/AddMusicPage';
import CreatePlaylistPage from './pages/CreatePlaylistPage';
import SearchResultsPage from './pages/SearchResultsPage';
import BrowseSongsPage from './pages/BrowseSongsPage';
import BrowsePlaylistsPage from './pages/BrowsePlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import SongDetailPage from './pages/SongDetailPage';
import './App.css';
/* global qortalRequest */

function AppWrapper() {
  return <HashRouter><App /></HashRouter>;
}
function App() {
  const navigate = useNavigate();
  const [selectedSong, setSelectedSong] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [songToAdd, setSongToAdd] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSelectSong = (song) => setSelectedSong(song);
  const handleOpenAddToPlaylistModal = (song) => { if (!isLoggedIn) { alert("Please log in."); return; } setSongToAdd(song); setIsModalOpen(true); };
  const handleSaveToPlaylist = async (song, playlistIdentifier) => {
    // Kontrollime, et meil on kõik vajalikud andmed olemas
    if (!song || !playlistIdentifier || !currentUser) {
        alert("Error: Missing data to complete the action.");
        return;
    }
    
    // Sulgeme modaali kohe, et kasutaja teaks, et tegevus algas
    setIsModalOpen(false);
    alert(`Adding "${song.title}" to your playlist. This may take a moment. Please confirm the transaction if prompted.`);

    try {
        // SAMM 1: Pärime playlisti omaniku nime, et olla kindel, et meil on õigus seda muuta
        const infoRes = await qortalRequest({
            action: 'SEARCH_QDN_RESOURCES',
            identifier: playlistIdentifier,
            limit: 1
        });
        if (!infoRes?.[0]?.name) {
            throw new Error("Could not find the playlist's original publisher.");
        }
        const publisherName = infoRes[0].name;

        // Kontrollime, kas sisselogitud kasutaja on selle playlisti omanik
        if (publisherName !== currentUser.name) {
            alert("Sorry, you can only add songs to your own playlists.");
            return;
        }

        // SAMM 2: Pärime olemasoleva playlisti täieliku sisu (JSON objekti)
        const playlistData = await qortalRequest({
            action: "FETCH_QDN_RESOURCE",
            name: publisherName, // Kasutame leitud avaldaja nime
            service: "PLAYLIST",
            identifier: playlistIdentifier,
        });

        // Veendume, et saime korrektse objekti
        if (typeof playlistData !== 'object' || playlistData === null) {
            throw new Error("Could not fetch valid playlist data. It might be corrupted.");
        }
        
        // SAMM 3: Uuendame objekti - lisame uue laulu info
        playlistData.songs = playlistData.songs || []; // Loome 'songs' massiivi, kui seda pole
        const newSongEntry = { identifier: song.id, name: song.qdnData.name };

        // Väldime duplikaatide lisamist
        if (playlistData.songs.some(s => s.identifier === newSongEntry.identifier)) {
            alert(`"${song.title}" is already in this playlist.`);
            return;
        }
        playlistData.songs.push(newSongEntry);

        // SAMM 4: Loome uue virtuaalse faili uuendatud andmetega
        const updatedFile = new File([JSON.stringify(playlistData)], `${playlistIdentifier}.json`, { type: "application/json" });

        // SAMM 5: Avaldame selle faili uuesti sama identifikaatoriga, mis kirjutab vana üle
        const result = await qortalRequest({
            action: "PUBLISH_QDN_RESOURCE",
            name: currentUser.name,
            service: "PLAYLIST",
            identifier: playlistIdentifier,
            file: updatedFile,
            title: playlistData.title, // Anname ka meta-andmed kaasa
            description: playlistData.description
        });

        if (result !== true) {
            throw new Error(`API did not confirm the update. Response: ${JSON.stringify(result)}`);
        }
        
        alert(`Successfully added "${song.title}" to "${playlistData.title}"!`);

    } catch (error) {
        console.error("Error saving to playlist:", error);
        alert(`Failed to add song to playlist. See console for details. Error: ${error.message}`);
    }
};
  const actualSearchHandler = (searchTerm) => { if (searchTerm.trim()) navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`); };
  const handleLogout = () => { setIsLoggedIn(false); setCurrentUser(null); navigate('/'); };
  const handleLogin = async () => {
    if (typeof qortalRequest === 'undefined') {
      alert("Qortal API not found. Please use the app within the Qortal UI.");
      return;
    }
    try {
      console.log("Attempting to get user account...");
      const accountData = await qortalRequest({ action: "GET_USER_ACCOUNT" });

      if (accountData && accountData.address) {
        console.log("Account data received, fetching names...");
        const namesData = await qortalRequest({ action: 'GET_ACCOUNT_NAMES', address: accountData.address });
        
        const userName = (namesData && namesData.length > 0) 
            ? namesData[0].name 
            : `User ${accountData.address.substring(0, 6)}...`;
        
        const userToSet = {
          name: userName,
          address: accountData.address,
          publicKey: accountData.publicKey
        };

        console.log("Setting user:", userToSet);
        setIsLoggedIn(true);
        setCurrentUser(userToSet);
        alert(`Welcome, ${userToSet.name}!`);

      } else {
        throw new Error("User account data could not be retrieved.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert(`Login failed: ${error.message || "An unknown error occurred."}`);
    }
  };
  const handleNavigateToAction = async (targetPath) => { if (isLoggedIn) { navigate(targetPath); } else { alert("Please log in."); await handleLogin(); }};
  
  return (
    <div className="app-container">
      <Header isLoggedIn={isLoggedIn} currentUser={currentUser} onLoginClick={handleLogin} onLogoutClick={handleLogout} onSearchSubmit={actualSearchHandler} onNavigateToAction={handleNavigateToAction}/>
      <div className="content-wrapper">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage onSongSelect={handleSelectSong} onAddToPlaylistClick={handleOpenAddToPlaylistModal} />} />
            <Route path="/add-music" element={isLoggedIn ? <AddMusicPage currentUser={currentUser} /> : <Navigate to="/" />} />
            <Route path="/create-playlist" element={isLoggedIn ? <CreatePlaylistPage currentUser={currentUser} /> : <Navigate to="/" />} />
            <Route path="/search" element={<SearchResultsPage onSongSelect={handleSelectSong} onAddToPlaylistClick={handleOpenAddToPlaylistModal} />} />
            <Route path="/songs" element={<BrowseSongsPage onSongSelect={handleSelectSong} onAddToPlaylistClick={handleOpenAddToPlaylistModal} />} />
            <Route path="/playlists" element={<BrowsePlaylistsPage />} />
            <Route path="/playlist/:playlistId" element={<PlaylistDetailPage onSongSelect={handleSelectSong} onAddToPlaylistClick={handleOpenAddToPlaylistModal} />} />
            <Route path="/song/:name/:identifier" element={<SongDetailPage onSongSelect={handleSelectSong} />} />            
            <Route path="*" element={<div><h2>404 Not Found</h2><Link to="/">Go Home</Link></div>} />
          </Routes>
        </main>
        <Sidebar isLoggedIn={isLoggedIn} currentUser={currentUser} className={showSidebar ? 'open' : 'closed'} />
      </div>
      <Player currentSong={selectedSong} />
      <AddToPlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} song={songToAdd} onSave={handleSaveToPlaylist} currentUser={currentUser}/>
      <button className="sidebar-toggle-btn" onClick={() => setShowSidebar(s => !s)}>☰</button>
    </div>
  );
}

export default AppWrapper;