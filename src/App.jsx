// src/App.jsx
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';

// Komponendid
import Header from './components/Header';
import Player from './components/Player';
import Sidebar from './components/Sidebar';
import MobileSidebar from './components/MobileSidebar';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import AddMusicForm from './components/AddMusicForm';

// Lehed
import HomePage from './pages/HomePage';
import CreatePlaylistPage from './pages/CreatePlaylistPage';
import MyPlaylistsPage from './pages/MyPlaylistsPage';
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
  const [_recentTracks, setRecentTracks] = useState([]); // Prefixed with _ to avoid unused warning
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // PUNKT 1: Mobile sidebar state
  const [sidebarStats, _setSidebarStats] = useState(null); // Stats sharing tussen sidebar components

  const handleSelectSong = (song) => setSelectedSong(song);

  const handleMusicAdded = (newTrack) => {
    if (newTrack) {
      console.log('Adding new track to UI:', newTrack);
      setRecentTracks(prev => [newTrack, ...prev]);
    } else {
      console.log('Refreshing tracks from QDN...');
      // Siin võiks olla loogika QDN-ist laulude uuesti laadimiseks
    }
  };

  const handleOpenAddToPlaylistModal = (song) => {
    if (!isLoggedIn) {
      alert("Please log in to add songs to playlists.");
      return;
    }
    setSongToAdd(song);
    setIsModalOpen(true);
  };

  const handleSaveToPlaylist = async (song, playlistIdentifier) => {
    if (!song || !playlistIdentifier || !currentUser) return;
    setIsModalOpen(false);

    try {
      const info = await qortalRequest({ 
        action: 'SEARCH_QDN_RESOURCES', 
        service: 'PLAYLIST',
        identifier: playlistIdentifier, 
        limit: 1 
      });
      if (!info?.[0]) throw new Error("Could not find the playlist to update.");

      const publisherName = info[0].name;
      if (publisherName !== currentUser.name) {
        alert("You can only add songs to your own playlists.");
        return;
      }

      const playlistData = await qortalRequest({
        action: "FETCH_QDN_RESOURCE",
        name: publisherName,
        service: "PLAYLIST",
        identifier: playlistIdentifier,
      });

      if (!playlistData || typeof playlistData !== 'object') {
        throw new Error("Invalid playlist data received.");
      }

      // Create proper song entry using correct identifier
      const songIdentifier = song.qdnData?.identifier || song.id;
      const songName = song.qdnData?.name || song.artist || "Unknown";
      
      const newSongEntry = { 
        identifier: songIdentifier, 
        name: songName 
      };

      const songsArray = Array.isArray(playlistData.songs) ? [...playlistData.songs] : [];
      if (songsArray.some(s => s.identifier === newSongEntry.identifier)) {
        alert("Song is already in this playlist.");
        return;
      }

      songsArray.push(newSongEntry);
      playlistData.songs = songsArray;

      const updatedFile = new File(
        [JSON.stringify(playlistData)],
        `${playlistIdentifier}.json`,
        { type: "application/json" }
      );

      const result = await qortalRequest({
        action: "PUBLISH_QDN_RESOURCE",
        name: currentUser.name,
        service: "PLAYLIST",
        identifier: playlistIdentifier,
        file: updatedFile,
        title: playlistData.title || playlistData.name,
        description: playlistData.description || "",
      });

      console.log("Playlist update result:", result);
      
      // Check if result is successful - can be true, transaction object, or array
      const isSuccess = result === true || 
                       (result && typeof result === 'object' && result.signature) ||
                       (Array.isArray(result) && result.length > 0 && result[0].signature);
      
      if (!isSuccess) {
        throw new Error(`API response was: ${JSON.stringify(result)}`);
      }
      
      alert(`Song "${song.title}" added successfully to playlist!`);
    } catch (error) {
      console.error("Add to playlist error:", error);
      alert(`Failed to add song: ${error.message}`);
    }
  };

  const actualSearchHandler = (searchTerm) => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    // PUNKT 2: Eemaldasime logout kinnituse popup
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
        const userName = namesData?.[0]?.name || `User ${accountData.address.slice(0, 6)}...`;
        const userToSet = {
          name: userName,
          address: accountData.address,
          publicKey: accountData.publicKey,
        };
        setIsLoggedIn(true);
        setCurrentUser(userToSet);
        // PUNKT 2: Eemaldasime "Welcome kasutajanimi" popup
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

  // PUNKT 1: Mobile sidebar toggle
  const handleToggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="app-container">
      <Header
        onSearchSubmit={actualSearchHandler}
        onToggleMobileSidebar={handleToggleMobileSidebar}
      />
      
      {/* MOBILE SIDEBAR */}
      <MobileSidebar 
        isOpen={isMobileSidebarOpen}
        onClose={handleCloseMobileSidebar}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLoginClick={handleLogin}
        onLogoutClick={handleLogout}
        onNavigateToAction={handleNavigateToAction}
        stats={sidebarStats}
      />

      <div className="content-wrapper">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage onSongSelect={handleSelectSong} onAddToPlaylistClick={handleOpenAddToPlaylistModal} />} />
            <Route path="/add-music" element={isLoggedIn ? <AddMusicForm currentUser={currentUser} onMusicAdded={handleMusicAdded} /> : <Navigate to="/" />} />
            <Route path="/create-playlist" element={isLoggedIn ? <CreatePlaylistPage currentUser={currentUser} /> : <Navigate to="/" />} />
            <Route path="/my-playlists" element={isLoggedIn ? <MyPlaylistsPage currentUser={currentUser} /> : <Navigate to="/" />} />
            <Route path="/search" element={<SearchResultsPage onSongSelect={handleSelectSong} onAddToPlaylistClick={handleOpenAddToPlaylistModal} />} />
            <Route path="/songs" element={<BrowseSongsPage onSongSelect={handleSelectSong} onAddToPlaylistClick={handleOpenAddToPlaylistModal} />} />
            <Route path="/playlists" element={<BrowsePlaylistsPage />} />
            <Route path="/playlist/:owner/:playlistId/:filename" element={<PlaylistDetailPage onSongSelect={handleSelectSong} onAddToPlaylistClick={handleOpenAddToPlaylistModal} />} />
            <Route path="/song/:name/:identifier" element={<SongDetailPage onSongSelect={handleSelectSong} />} />
            <Route path="*" element={<div><h2>404 Not Found</h2><Link to="/">Go Home</Link></div>} />
            <Route path="/playlist/:playlistId" element={<Navigate to="/" />} /> // ajutine fallback
          </Routes>
        </main>
        
        {/* DESKTOP SIDEBAR */}
        <Sidebar 
          isLoggedIn={isLoggedIn} 
          currentUser={currentUser}
          onLoginClick={handleLogin}
          onLogoutClick={handleLogout}
          onNavigateToAction={handleNavigateToAction}
        />
      </div>
      
      <Player currentSong={selectedSong} />
      
      <AddToPlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        song={songToAdd}
        onSave={handleSaveToPlaylist}
        currentUser={currentUser}
      />
    </div>
  );
}

export default AppWrapper;