import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* global qortalRequest */

function CreatePlaylistPage({ currentUser }) {
  const navigate = useNavigate();
  
  // Form state
  const [playlistName, setPlaylistName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Selection state
  const [userSongs, setUserSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  
  // UI state
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser?.name) return;

    const fetchUserSongs = async () => {
      try {
        const resources = await qortalRequest({
          action: "SEARCH_QDN_RESOURCES",
          service: "AUDIO",
          name: currentUser.name,
          identifier: "qmusic_track_",
          prefix: true,
          includeMetadata: true,
          limit: 100
        });

        if (Array.isArray(resources)) {
          const formattedSongs = resources.map(item => ({
            identifier: item.identifier,
            name: item.name,
            title: item.metadata?.title || item.identifier,
            filename: item.filename
          }));
          setUserSongs(formattedSongs);
        }
      } catch (e) {
        console.error("Failed loading user songs:", e);
      }
    };

    fetchUserSongs();
  }, [currentUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image file too large. Maximum size is 5MB');
        return;
      }
      
      setCoverImage(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setCoverImage(null);
      setImagePreview(null);
    }
  };

  const toggleSongSelection = (song) => {
    setSelectedSongs(prev =>
      prev.some(s => s.identifier === song.identifier)
        ? prev.filter(s => s.identifier !== song.identifier)
        : [...prev, song]
    );
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      setError('Please enter a playlist name');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      // TÄIELIKULT GARANTEERITUD UNIKAALNE ID
      const timestamp = Date.now();
      const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase(); // 8 characters like DsNWg4N9
      const cleanTitle = playlistName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const identifier = `qmusic_playlist_${cleanTitle}_${timestamp}_${randomCode}`;
      
      console.log('=== PLAYLIST CREATION DEBUG ===');
      console.log('User:', currentUser.name);
      console.log('Playlist name:', playlistName);
      console.log('Generated identifier:', identifier);
      console.log('Timestamp:', timestamp);
      console.log('Random code:', randomCode);
      console.log('Clean title:', cleanTitle);
      console.log('==================================');

      // Prepare playlist data
      const playlistData = {
        name: playlistName,
        title: playlistName,
        description: description || `Playlist created by ${currentUser.name}`,
        songs: selectedSongs.map(song => ({
          name: song.name,
          identifier: song.identifier
        })),
        createdAt: new Date().toISOString(),
        creator: currentUser.name
      };

      // Prepare resources array - create JSON as actual file like songs do
      const playlistJsonContent = JSON.stringify(playlistData, null, 2);
      const playlistBlob = new Blob([playlistJsonContent], { type: 'application/json' });
      const playlistFile = new File([playlistBlob], `${identifier}.json`, { type: 'application/json' });

      const resources = [
        {
          name: currentUser.name,
          service: "PLAYLIST",
          identifier,
          title: playlistName,
          description: description || `Playlist created by ${currentUser.name}`,
          file: playlistFile,
          filename: `${identifier}.json`
        }
      ];

      // Add cover image if provided
      if (coverImage) {
        resources.push({
          name: currentUser.name,
          service: "THUMBNAIL",
          identifier,
          file: coverImage,
          filename: `${identifier}.${coverImage.name.split('.').pop()}`
        });
      }

      console.log('Creating playlist:', { identifier, resources });

      const result = await qortalRequest({
        action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
        resources
      });

      console.log('Playlist creation result:', result);

      // Check success
      const isSuccess = result === true || 
                       (result && typeof result === 'object' && result.signature) ||
                       (Array.isArray(result) && result.length > 0 && result[0].signature);

      if (!isSuccess) {
        throw new Error(`Creation failed: ${JSON.stringify(result)}`);
      }

      setSuccess(true);
      setError(null);

      // Loome uue playlist objekti, mis saadetakse UI-sse
      const newPlaylist = {
        id: identifier,
        name: playlistName,
        description: description || `Playlist created by ${currentUser.name}`,
        owner: currentUser.name,
        identifier: identifier,
        artworkUrl: coverImage ? `/arbitrary/THUMBNAIL/${encodeURIComponent(currentUser.name)}/${encodeURIComponent(identifier)}` : null
      };

      // Saadame kohe sündmuse
      window.dispatchEvent(new CustomEvent('playlistCreated', { detail: newPlaylist }));

      // Reset form
      setPlaylistName('');
      setDescription('');
      setCoverImage(null);
      setImagePreview(null);
      setSelectedSongs([]);

      // Navigate to home after delay
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error('Failed to create playlist:', err);
      setError(`Failed to create playlist: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="form-page-container">
      <h2>Create New Playlist</h2>
      
      {/* Success notification */}
      {success && (
        <div className="notification success">
          Playlist created successfully! Redirecting to home...
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="notification error">
          {error}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Basic Info Section */}
        <div className="form-group">
          <label htmlFor="playlistName">Playlist Name <span style={{ color: 'red' }}>*</span></label>
          <input
            id="playlistName"
            type="text"
            placeholder="Enter playlist name..."
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            disabled={isCreating}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Add a description for your playlist..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea"
            rows="3"
            disabled={isCreating}
          />
        </div>

        <div className="form-group">
          <label htmlFor="coverImage">Cover Image</label>
          <input
            id="coverImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isCreating}
          />
          {coverImage && <p className="file-info"><strong>Selected:</strong> {coverImage.name}</p>}
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Cover preview" />
            </div>
          )}
          <small className="file-hint">Supported: JPG, PNG, GIF (max 5MB)</small>
        </div>

        {/* Song Selection Section */}
        <div className="form-group">
          <h3>Select Songs (Optional) - ({selectedSongs.length}/{userSongs.length} selected)</h3>
          {userSongs.length === 0 ? (
            <div className="empty-state">
              <p>No songs found. You can still create an empty playlist and add songs later.</p>
            </div>
          ) : (
            <div className="song-selection-list">
              {userSongs.map(song => (
                <label key={song.identifier} className="song-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedSongs.some(s => s.identifier === song.identifier)}
                    onChange={() => !isCreating && toggleSongSelection(song)}
                    disabled={isCreating}
                  />
                  <div className="song-checkbox-info">
                    <div className="song-title">{song.title}</div>
                    <div className="song-artist">{song.name}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="button"
          onClick={handleCreatePlaylist}
          disabled={!playlistName.trim() || isCreating}
        >
          {isCreating ? 'Creating Playlist...' : 'Create Playlist'}
        </button>
      </form>
    </div>
  );
}

export default CreatePlaylistPage;