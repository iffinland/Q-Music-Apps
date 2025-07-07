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
  const handleSaveToPlaylist = async (song, playlistId) => { /* ... */ };
  const actualSearchHandler = (searchTerm) => { if (searchTerm.trim()) navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`); };
  const handleLogout = () => { setIsLoggedIn(false); setCurrentUser(null); navigate('/'); };
  const handleLogin = async () => { /* ... */ };
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