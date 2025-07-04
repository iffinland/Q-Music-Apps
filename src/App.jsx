// src/App.jsx - TÄIELIK JA LÕPLIK
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';

// Komponentide ja lehtede impordid
import Header from './components/Header';
import Player from './components/Player';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import AddMusicPage from './pages/AddMusicPage';
import CreatePlaylistPage from './pages/CreatePlaylistPage';
import SearchResultsPage from './pages/SearchResultsPage';
import BrowseSongsPage from './pages/BrowseSongsPage';
import BrowsePlaylistsPage from './pages/BrowsePlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import SongDetailPage from './pages/SongDetailPage';
import AddToPlaylistModal from './components/AddToPlaylistModal';

// Andmete ja stiilide impordid
import { songs as initialMockSongs } from "./data/mockSongs";
import './App.css';

/* global qortalRequest */

function AppWrapper() {
  return ( <HashRouter> <App /> </HashRouter> );
}

function App() {
  const navigate = useNavigate();
  // Rakenduse põhiline olek
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Modaalakna olekud
  const [songToAdd, setSongToAdd] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Efektid
  useEffect(() => { setSongs(initialMockSongs); }, []);

  // Handler-funktsioonid
  const handleSelectSong = (song) => setSelectedSong(song);

  const handleOpenAddToPlaylistModal = (song) => {
    if (!isLoggedIn) {
      alert("Please log in to add songs to playlists.");
      return;
    }
    setSongToAdd(song);
    setIsModalOpen(true);
  };
  
  const handleSaveToPlaylist = (song, playlistId) => {
    console.log(`Saving song "${song.title}" to playlist with ID: ${playlistId}`);
    alert(`(Simulated) Saved ${song.title} to playlist!`);
    setIsModalOpen(false);
  };

  const actualSearchHandler = (searchTerm) => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    alert("You have been logged out.");
    navigate('/');
  };
  
  const handleLogin = async () => {
    if (typeof qortalRequest === 'undefined') {
      alert("Qortal API not found. Please use the app within the Qortal UI.");
      return;
    }
    try {
      const accountData = await qortalRequest({ action: "GET_USER_ACCOUNT" });
      if (accountData?.address) {
        const namesData = await qortalRequest({ action: 'GET_ACCOUNT_NAMES', address: accountData.address });
        const userName = namesData?.[0]?.name || `User ${accountData.address.substring(0, 6)}...`;
        const userToSet = { name: userName, address: accountData.address, publicKey: accountData.publicKey };
        setIsLoggedIn(true);
        setCurrentUser(userToSet);
        alert(`Welcome, ${userToSet.name}!`);
      } else {
        throw new Error("User account data could not be retrieved.");
      }
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  };
  
  const handleNavigateToAction = async (targetPath) => {
    if (isLoggedIn) {
      navigate(targetPath);
    } else {
      alert("You need to be logged in for this action. Attempting to log you in...");
      await handleLogin();
    }
  };
  
  return (
    <div className="app-container">
      <Header
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLoginClick={handleLogin}
        onLogoutClick={handleLogout}
        onSearchSubmit={actualSearchHandler}
        onNavigateToAction={handleNavigateToAction}
      />
      <div className="content-wrapper">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage songs={songs.slice(0, 25)} onSongSelect={handleSelectSong} onAddToPlaylistClick={handleOpenAddToPlaylistModal} />} />
            <Route path="/add-music" element={isLoggedIn ? <AddMusicPage currentUser={currentUser} /> : <Navigate to="/" />} />
            <Route path="/create-playlist" element={isLoggedIn ? <CreatePlaylistPage currentUser={currentUser} /> : <Navigate to="/" />} />
            <Route path="/search" element={<SearchResultsPage onSongSelect={handleSelectSong} onAddToPlaylistClick={handleOpenAddToPlaylistModal} />} />
            <Route path="/songs" element={<BrowseSongsPage onSongSelect={handleSelectSong} onAddToPlaylistClick={handleOpenAddToPlaylistModal} />} />
            <Route path="/playlists" element={<BrowsePlaylistsPage />} />
            <Route path="/playlist/:playlistId" element={<PlaylistDetailPage onSongSelect={handleSelectSong} onAddToPlaylistClick={handleOpenAddToPlaylistModal} />} />
            <Route path="/song/:songId" element={<SongDetailPage onSongSelect={handleSelectSong} />} />
            <Route path="*" element={<div><h2>404 Not Found</h2><Link to="/">Go Home</Link></div>} />
          </Routes>
        </main>
        <Sidebar isLoggedIn={isLoggedIn} currentUser={currentUser} />
      </div>
      <Player currentSong={selectedSong} />
      <AddToPlaylistModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        song={songToAdd}
        onSave={handleSaveToPlaylist}
      />
    </div>
  );
}

export default AppWrapper;