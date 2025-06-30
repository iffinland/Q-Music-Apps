// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import SearchBox from './SearchBox';

function Header({ isLoggedIn, currentUser, onLoginClick, onLogoutClick, onSearchSubmit, onNavigateToAction }) {
  return (
    <header className="app-header">
      <div className="header-main-row">
        <h1><Link to="/" className="logo-link">Q-Music</Link></h1>
        <nav>
          <Link to="/" className="header-link">Avaleht</Link>
          <Link to="/songs" className="header-link">Sirvi Lugusid</Link>
          <Link to="/playlists" className="header-link">Sirvi Playliste</Link>
        </nav>
        <nav className="header-auth-nav">
          {isLoggedIn && currentUser ? (
            <button onClick={onLogoutClick} className="login-button">Välju ({currentUser.name})</button>
          ) : (
            <button onClick={onLoginClick} className="login-button">Logi sisse Qortaliga</button>
          )}
        </nav>
      </div>
      <div className="header-search-row">
        <SearchBox onActualSearch={onSearchSubmit} />
      </div>
      {isLoggedIn && (
        <div className="header-action-buttons">
          <button onClick={() => onNavigateToAction('/add-music')} className="action-button">Lisa UUT muusikat</button>
          <button onClick={() => onNavigateToAction('/create-playlist')} className="action-button">Lisa UUS playlist</button>
        </div>
      )}
    </header>
  );
}
export default Header;