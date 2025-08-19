// src/components/Player.jsx
import React, { useState, useEffect, useRef } from 'react';

// Ikonid ja formaadid
const PlayIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>);
const PauseIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" /></svg>);
const VolumeHighIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="..." /></svg>);
const VolumeMuteIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="..." /></svg>);
const DefaultArtworkIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#888" d="..." /></svg>);
const formatTime = (time) => isNaN(time) || !isFinite(time) ? '0:00' : `${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, '0')}`;

function Player({ currentSong }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoadingSong, setIsLoadingSong] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [lastVolume, setLastVolume] = useState(0.75);
  const [loadProgress, setLoadProgress] = useState(0); // ← UUS

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (currentSong?.qdnData?.name && currentSong?.qdnData?.identifier) {
      setIsLoadingSong(true);
      setLoadProgress(0);
      const { name, identifier } = currentSong.qdnData;
      const audioUrl = `/arbitrary/AUDIO/${encodeURIComponent(name)}/${encodeURIComponent(identifier)}`;
      
      // Väldime tarbetut uuesti laadimist
      if (audioEl.src.endsWith(audioUrl)) {
        if (audioEl.paused) audioEl.play().catch(() => console.warn("Autoplay blocked"));
        setIsLoadingSong(false);
        return;
      }

      audioEl.src = audioUrl;
      audioEl.load();
    } else {
      audioEl.pause();
      audioEl.removeAttribute('src');
      audioEl.load();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleTimeUpdate = () => setCurrentTime(audioRef.current?.currentTime || 0);
  const handleLoadedMetadata = () => setDuration(audioRef.current?.duration || 0);
  const handleCanPlay = () => {
    setIsLoadingSong(false);
    setLoadProgress(100);
    audioRef.current?.play().catch(() => {});
  };
  const handleError = (e) => {
    setIsLoadingSong(false);
    setLoadProgress(0);
    console.error("Audio load error:", e);
    alert("Error: Could not load or play this song.");
  };

  const handleProgress = () => {
    const audio = audioRef.current;
    if (!audio || !audio.buffered?.length) return;

    try {
      const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
      const percent = (bufferedEnd / (audio.duration || 1)) * 100;
      setLoadProgress(Math.min(Math.floor(percent), 100));
    } catch {
      setLoadProgress(0);
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio?.src || isLoadingSong) return;
    audio.paused ? audio.play().catch(handleError) : audio.pause();
  };

  const handleProgressChange = (e) => { audioRef.current.currentTime = e.target.value; };
  const handleVolumeChange = (e) => setVolume(parseFloat(e.target.value));
  const toggleMute = () => {
    const newVol = volume > 0 ? 0 : (lastVolume > 0 ? lastVolume : 0.75);
    if (volume > 0) setLastVolume(volume);
    setVolume(newVol);
  };

  return (
    <div className="player-bar">
      <audio
        ref={audioRef}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onProgress={handleProgress}
        crossOrigin="anonymous"
      />

      <div className="player-song-info">
        <div className="player-artwork">
          {currentSong?.artworkUrl ? (
            <img src={currentSong.artworkUrl} alt={currentSong.title} />
          ) : (
            <div className="default-artwork-player"><DefaultArtworkIcon /></div>
          )}
        </div>
        <div className="player-song-details">
          {currentSong ? (
            <>
              <strong>{currentSong.title}</strong>
              <p>{currentSong.artist}</p>
            </>
          ) : (
            <p>Select a song to play</p>
          )}
        </div>
      </div>

      <div className="player-controls">
        <button onClick={togglePlayPause} disabled={!currentSong} className="play-pause-btn">
          {isLoadingSong ? `Loading... ${loadProgress}%` : (isPlaying ? <PauseIcon /> : <PlayIcon />)}
        </button>

        <div className="progress-container">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="progress-bar"
            disabled={!currentSong}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-volume-controls">
        <button onClick={toggleMute} className="volume-btn">
          {volume === 0 ? <VolumeMuteIcon /> : <VolumeHighIcon />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>
    </div>
  );
}

export default Player;