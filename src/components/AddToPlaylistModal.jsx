// src/components/AddToPlaylistModal.jsx
import React, { useState, useEffect, useCallback } from 'react';

/* global qortalRequest */

// Taaskasutatav modaal-komponent
const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-modal-btn" aria-label="Close modal">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

function AddToPlaylistModal({ song, isOpen, onClose, onSave, currentUser }) {
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserPlaylists = useCallback(async () => {
    if (!currentUser?.name) return;

    setIsLoading(true);
    setMyPlaylists([]);

    try {
      const results = await qortalRequest({
        action: "SEARCH_QDN_RESOURCES",
        service: "PLAYLIST",
        name: currentUser.name,
        identifier: "qmusic_playlist_",
        prefix: true,
        includeMetadata: true,
        limit: 100,
      });

      if (Array.isArray(results)) {
        const formatted = results.map(p => ({
          id: p.identifier,
          name: p.metadata?.title || p.identifier,
        }));
        setMyPlaylists(formatted);
      }
    } catch (error) {
      console.error("Error fetching user playlists:", error);
      alert("Could not load your playlists.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchUserPlaylists();
    }
  }, [isOpen, currentUser, fetchUserPlaylists]);

  const handleSave = () => {
    if (!selectedPlaylistId) {
      alert("Please select a playlist.");
      return;
    }
    onSave(song, selectedPlaylistId);
  };

  if (!isOpen || !song) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add "${song.title}" to playlist`}>
      {isLoading ? (
        <p>Loading your playlists...</p>
      ) : myPlaylists.length > 0 ? (
        <div className="playlist-selection">
          <p>Select one of your playlists:</p>
          <div className="playlist-list-box">
            {myPlaylists.map(pl => (
              <div
                key={pl.id}
                className={`playlist-option ${selectedPlaylistId === pl.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlaylistId(pl.id)}
              >
                {pl.name}
              </div>
            ))}
          </div>
<button 
  className="btn btn-wide" 
  onClick={handleSave} 
  disabled={!selectedPlaylistId}
>
  Save to Playlist
</button>   
<button className="btn btn-icon" onClick={onClose} title="Close">
  ×
</button>     
</div>
      ) : (
        <p>You haven't created any playlists yet. Go to <strong>"Create New Playlist"</strong> to start.</p>
      )}
    </Modal>
  );
}

export default AddToPlaylistModal;