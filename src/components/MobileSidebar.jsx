// src/components/MobileSidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function MobileSidebar({ 
  isOpen, 
  onClose, 
  isLoggedIn, 
  currentUser, 
  onLoginClick, 
  onLogoutClick,
  onNavigateToAction,
  stats 
}) {
  return (
    <>
      {/* BACKDROP */}
      <div 
        className={`mobile-sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      ></div>

      {/* MOBILE SIDEBAR */}
      <aside className={`mobile-sidebar ${isOpen ? 'open' : ''}`}>
        {/* SULGEMISE NUPP */}
        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {/* LOGIN SEKTSIOON */}
        <section className="auth-section">
          {isLoggedIn && currentUser ? (
            <button onClick={onLogoutClick} className="sidebar-login-button logout">
              Log OUT ({currentUser.name})
            </button>
          ) : (
            <button onClick={onLoginClick} className="sidebar-login-button login">
              Log IN
            </button>
          )}
        </section>

        {/* STATISTIKA */}
        <section className="stats-section">
          <h5><b>S T A T I S T I C S</b></h5>
          <p>ALL QDN audio: {stats?.allSongs || '...'}</p>
          <p>Q-Music Songs: {stats?.qmusicSongs || '...'}</p>
          <p>Ear-Bump Songs: {stats?.earbumpSongs || '...'}</p>
          <p>Playlists: {stats?.playlists || '...'}</p>
          <p>Publishers: {stats?.publishers || '...'}</p>
        </section>

        {/* KASUTAJA SEKTSIOON */}
        {isLoggedIn && currentUser && (
          <section className="user-section">
            <div className="user-avatar">
              <img
                src={`https://via.placeholder.com/80/cccccc/000000?text=${currentUser.name.charAt(0).toUpperCase()}`}
                alt="User Avatar"
              />
            </div>
            <p className="user-name">{currentUser.name}</p>

            <div className="user-actions">
              <button 
                className="sidebar-action-btn"
                onClick={() => {
                  onNavigateToAction('/add-music');
                  onClose();
                }}
              >
                Add NEW Music
              </button>
              <button 
                className="sidebar-action-btn"
                onClick={() => {
                  onNavigateToAction('/create-playlist');
                  onClose();
                }}
              >
                Create NEW Playlist
              </button>
              <button 
                className="sidebar-action-btn"
                onClick={() => {
                  onNavigateToAction('/my-playlists');
                  onClose();
                }}
              >
                My Playlists
              </button>
              <button className="sidebar-action-btn disabled">My Favorite Playlist</button>
            </div>
          </section>
        )}

        {/* INFORMATSIOON */}
        <section className="stats-section">
          <h5><b>I N F O R M A T I O N</b></h5>
          <p>You can find more detailed information <i>(such as FAQ)</i> about this app by visiting the CHAT called <b style={{ color: 'orange' }}>Q-Music</b> and the THREADS section there.</p>
          <p>Click and send <a href="qortal://APP/Q-Mail/to/Q-Music"><b>Q-Mail</b></a></p>
          <p>Suggestions, ideas, problems!?</p>
          <p>visit Q-Music <b style={{ color: 'green' }}>CHAT-THREADS</b></p>
        </section>
      </aside>
    </>
  );
}

export default MobileSidebar;
