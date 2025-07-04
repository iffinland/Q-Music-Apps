// src/components/AddToPlaylistModal.jsx
import React, { useState, useEffect } from 'react';

// See on modaalakna kest
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{title}</h2>
                {children}
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};


function AddToPlaylistModal({ song, isOpen, onClose, onSave }) {
    const [myPlaylists, setMyPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Kui aken avaneb, päri kasutaja playlistid (praegu mock)
            setIsLoading(true);
            console.log("Fetching user's playlists...");
            setTimeout(() => {
                setMyPlaylists([
                    { id: 'playlist-1', name: 'Minu Suve Lood' },
                    { id: 'playlist-2', name: 'Parim Trenniks' }
                ]);
                setIsLoading(false);
            }, 1000);
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!selectedPlaylist) {
            alert("Please select a playlist.");
            return;
        }
        onSave(song, selectedPlaylist); // Saadame laulu ja valitud playlisti ID tagasi
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Add "${song?.title}" to playlist`}>
            {isLoading ? (
                <p>Loading your playlists...</p>
            ) : (
                <div className="playlist-selection">
                    <select value={selectedPlaylist} onChange={e => setSelectedPlaylist(e.target.value)}>
                        <option value="" disabled>Select a playlist</option>
                        {myPlaylists.map(pl => (
                            <option key={pl.id} value={pl.id}>{pl.name}</option>
                        ))}
                    </select>
                    <button onClick={handleSave}>Save</button>
                </div>
            )}
        </Modal>
    );
}
export default AddToPlaylistModal;