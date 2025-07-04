// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import SearchBox from './SearchBox';

function Header({ isLoggedIn, currentUser, onLoginClick, onLogoutClick, onSearchSubmit, onNavigateToAction }) {
  return (
    <header className="app-header">
      <div className="header-main-row">
        <img src="q-music.gif" alt="Q-Music" />
        <h1><Link to="/" className="logo-link">Q-Music</Link></h1>
        <nav>
          <Link to="/" className="header-link">Homepage</Link>
          <Link to="/songs" className="header-link">Browse songs</Link>
          <Link to="/playlists" className="header-link">Browse playlists</Link>
        </nav>
        <nav className="header-auth-nav">
          {isLoggedIn && currentUser ? (
            <button onClick={onLogoutClick} className="login-button">Log OUT({currentUser.name})</button>
          ) : (
            <button onClick={onLoginClick} className="login-button">Create NEW content</button>
          )}
        </nav>
      </div>
      <div className="header-search-row">
        <SearchBox onActualSearch={onSearchSubmit} />
      </div>
      {isLoggedIn && (
        <div className="header-action-buttons">
          <button onClick={() => onNavigateToAction('/add-music')} className="action-button">Add NEW music</button>
          <button onClick={() => onNavigateToAction('/create-playlist')} className="action-button">Create NEW playlist</button>
        </div>
      )}
    </header>
  );
}
export default Header;