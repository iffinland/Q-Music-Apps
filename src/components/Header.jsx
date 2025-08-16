// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import SearchBox from './SearchBox';

function Header({
  isLoggedIn,
  currentUser,
  onLoginClick,
  onLogoutClick,
  onSearchSubmit,
  onNavigateToAction
}) {
  return (
    <header className="app-header" aria-label="Main site header">
      <div className="header-main-row">
        <img src="/qmusic.png" alt="Q-Music logo" height="60" width="60" />
        <h1><Link to="/" className="logo-link">Q-Music</Link></h1>
        
        <nav className="main-nav">
          <Link to="/" className="header-link">Homepage</Link>
          <Link to="/songs" className="header-link">Browse Songs</Link>
          <Link to="/playlists" className="header-link">Browse Playlists</Link>
        </nav>

        <div className="auth-controls">
          {isLoggedIn && currentUser ? (
            <button onClick={onLogoutClick} className="login-button">
              Log OUT ({currentUser.name})
            </button>
          ) : (
            <button onClick={onLoginClick} className="login-button">
              Log IN
            </button>
          )}
        </div>
      </div>

      <div className="header-search-row">
        <SearchBox onActualSearch={onSearchSubmit} />
      </div>

      {isLoggedIn && (
        <div className="header-action-buttons">
          <button onClick={() => onNavigateToAction('/add-music')} className="action-button">
            Add NEW Music
          </button>
          <button onClick={() => onNavigateToAction('/create-playlist')} className="action-button">
            Create NEW Playlist
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;