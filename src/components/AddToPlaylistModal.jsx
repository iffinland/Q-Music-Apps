// src/components/AddToPlaylistModal.jsx - ILMA useAuth'ita
import React, { useState, useEffect } from 'react';

/* global qortalRequest */

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{title}</h2>
                  <button onClick={onClose} className="close-modal-btn">×</button>
                </div>
                {children}
            </div>
        </div>
    );
};

// See komponent võtab nüüd currentUser prop'ina
function AddToPlaylistModal({ song, isOpen, onClose, onSave, currentUser }) {
    const [myPlaylists, setMyPlaylists] = useState([]);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Päring käivitub ainult siis, kui aken avatakse ja kasutaja on olemas
        if (isOpen && currentUser) {
            const fetchUserPlaylists = async () => {
                setIsLoading(true);
                setMyPlaylists([]); // Tühjenda eelmine nimekiri
                try {
                    const results = await qortalRequest({
                        action: "SEARCH_QDN_RESOURCES",
                        service: "PLAYLIST", // Kasutasime DOCUMENT teenust playlistide salvestamiseks
                        name: currentUser.name, // Otsime AINULT selle kasutaja playliste
                        identifier: "qmusic_playlist_",
                        prefix: true,
                        includeMetadata: true,
                        limit: 100,
                    });

                    if (Array.isArray(results) && results.length > 0) {
                        setMyPlaylists(results.map(p => ({
                            id: p.identifier,
                            name: p.metadata?.title || p.identifier,
                        })));
                    }
                } catch (error) {
                    console.error("Error fetching user playlists:", error);
                    alert("Could not load your playlists.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUserPlaylists();
        }
    }, [isOpen, currentUser]); // Käivitub uuesti, kui aken avatakse või kasutaja muutub

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
                    <button onClick={handleSave} disabled={!selectedPlaylistId}>Save to Playlist</button>
                </div>
            ) : (
                <p>You haven't created any playlists yet. Go to "Create New Playlist" to start.</p>
            )}
        </Modal>
    );
}

export default AddToPlaylistModal;