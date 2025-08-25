// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import SearchBox from './SearchBox';

function Header({
  onSearchSubmit,
  onToggleMobileSidebar
}) {
  return (
    <>
      {/* HAMBURGER MENU MOBILE JAOKS */}
      <button className="hamburger-menu" onClick={onToggleMobileSidebar}>
        ☰
      </button>

      <header className="app-header" aria-label="Main site header">
        <div className="header-main-row">
          <img src="qmusic.png" alt="Q-Music logo" height="60" width="60" className="header-logo" />
          <h1 className="header-title"><Link to="/" className="logo-link">Q-Music</Link></h1>
          
          <nav className="main-nav">
            <Link to="/" className="header-link">Homepage</Link>
            <Link to="/songs" className="header-link">Browse Songs</Link>
            <Link to="/playlists" className="header-link">Browse Playlists</Link>
          </nav>
        </div>

        <div className="header-search-row">
          <SearchBox onActualSearch={onSearchSubmit} />
        </div>
      </header>
    </>
  );
}

export default Header;