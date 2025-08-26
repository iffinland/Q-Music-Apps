import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publishAudio } from '../services/publishService';

const AddMusicForm = ({ currentUser, onMusicAdded }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser?.name) {
      setError('Please log in to publish music');
      return;
    }

    if (!file || !artist.trim() || !title.trim()) {
      setError('Please fill in all fields and select a file');
      return;
    }

    try {
      setIsPublishing(true);
      setError(null);
      setSuccess(false);

      const publishResult = await publishAudio(file, {
        artist: artist.trim(),
        title: title.trim()
      }, currentUser, imageFile);

      if (!publishResult.success || !publishResult.identifier) {
        throw new Error("Publishing failed or did not return a unique identifier.");
      }

      // Create the new track object to add immediately to UI
      const newTrack = {
        id: publishResult.identifier, // Use the exact identifier from the service
        name: currentUser.name,
        service: 'AUDIO',
        identifier: publishResult.identifier,
        title: title.trim(),
        artist: artist.trim(),
        // Add properties needed for immediate display
        artworkUrl: imagePreview, // Use local preview for optimistic update
        qdnData: { name: currentUser.name, service: 'AUDIO', identifier: publishResult.identifier },
        created: Date.now(),
      };

      console.log('🎵 Created new track object:', newTrack);

      // Clear form
      setFile(null);
      setImageFile(null);
      setImagePreview(null);
      setArtist('');
      setTitle('');
      setSuccess(true);
      
      // Add the new track immediately to UI and refresh after delay
      if (onMusicAdded) {
        // Anname uue laulu info edasi koheseks (optimistlikuks) kuvamiseks
        onMusicAdded(newTrack);
        // Redirect to home after a short delay to show the success message
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error publishing:', error);
      setError(error.message || 'Failed to publish. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="add-music-container">
      <h1>Publish New Song</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Song published successfully! Redirecting to home...</div>}
      
      <form onSubmit={handleSubmit} className="add-music-form">
        <div className="form-group">
          <label htmlFor="artist">Artist Name:</label>
          <input
            type="text"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            disabled={isPublishing}
            placeholder="Enter artist name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="title">Song Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPublishing}
            placeholder="Enter song title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="file">Audio File:</label>
          <input
            type="file"
            id="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={isPublishing}
          />
          {file && (
            <div className="file-info">
              Selected file: {file.name} ({Math.round(file.size / 1024 / 1024 * 100) / 100} MB)
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="image">Cover Image (Optional):</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isPublishing}
          />
          {imageFile && (
            <div className="file-info">
              Selected: {imageFile.name}
            </div>
          )}
          
          {imagePreview && (
            <div className="image-preview">
              <img 
                src={imagePreview} 
                alt="Cover preview" 
                style={{
                  width: '150px',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginTop: '10px',
                  border: '2px solid #3d4557'
                }}
              />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="publish-button" 
          disabled={isPublishing || !file || !artist.trim() || !title.trim()}
        >
          {isPublishing ? 'Publishing...' : 'Publish Song'}
        </button>
      </form>
    </div>
  );
};

export default AddMusicForm;
