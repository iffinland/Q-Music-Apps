// src/components/Player.jsx
import React, { useState, useEffect, useRef } from 'react';

// Icons & Helpers
const PlayIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg> );
const PauseIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" /></svg> );
const VolumeHighIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" /></svg> );
const VolumeMuteIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.19,21.19L2.81,2.81L1.39,4.22L7.22,10.05L7,10H3V14H7L12,19V13.22L16.2,17.42C15.75,17.72 15.27,17.96 14.77,18.11L14.76,18.12L14,18.7V20.77C15.06,20.44 16.03,19.83 16.85,19.03L19.97,22.15L21.39,20.73L21.19,21.19V21.19M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,15 21,13.57 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M14,7.97V10.18L15.48,11.66C15.5,11.78 15.5,11.89 15.5,12C15.5,13.76 14.5,15.29 13.03,16.04L14,17.01V16V7.97Z" /></svg> );
const DefaultArtworkIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#888" d="M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z" /></svg> );
const formatTime = (time) => { if (isNaN(time) || !isFinite(time)) return '0:00'; const minutes = Math.floor(time / 60); const seconds = Math.floor(time % 60).toString().padStart(2, '0'); return `${minutes}:${seconds}`; };

function Player({ currentSong }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoadingSong, setIsLoadingSong] = useState(false);
    const [volume, setVolume] = useState(0.75);
    const [lastVolume, setLastVolume] = useState(0.75);

    useEffect(() => {
        const audioEl = audioRef.current;
        if (!audioEl) return;

        if (currentSong && currentSong.qdnData?.name && currentSong.qdnData?.identifier) {
            setIsLoadingSong(true);
            const { name, identifier } = currentSong.qdnData;
            
            // KORREKTNE URL-i ehitamine
            const audioUrl = `/arbitrary/AUDIO/${encodeURIComponent(name)}/${encodeURIComponent(identifier)}`;
            
            // Väldime sama URL-i uuesti laadimist
            if (audioEl.src.endsWith(audioUrl)) {
                if(audioEl.paused) audioEl.play().catch(e => console.warn("Autoplay blocked"));
                setIsLoadingSong(false);
                return;
            }
            
            console.log(`Player: Setting new audio source to: ${audioUrl}`);
            audioEl.src = audioUrl;
            audioEl.load();
        } else {
            audioEl.pause();
            if (audioEl.hasAttribute('src')) {
                audioEl.removeAttribute('src');
                audioEl.load();
            }
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
        }
    }, [currentSong]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);
    
    // HTML <audio> sündmuste käsitlejad
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => audioRef.current && setCurrentTime(audioRef.current.currentTime);
    const handleLoadedMetadata = () => audioRef.current && setDuration(audioRef.current.duration);
    const handleCanPlay = () => { setIsLoadingSong(false); audioRef.current?.play().catch(e => console.warn("Autoplay was blocked.")); };
    const handleError = (e) => { setIsLoadingSong(false); console.error("Player error:", e); alert("Error: Could not load or play the selected audio."); };
    const togglePlayPause = () => { if (!audioRef.current?.src || isLoadingSong) return; const audio = audioRef.current; if (audio.paused) { audio.play().catch(handleError); } else { audio.pause(); }};
    const handleProgressChange = (e) => { if (audioRef.current) audioRef.current.currentTime = e.target.value; };
    const handleVolumeChange = (e) => setVolume(parseFloat(e.target.value));
    const toggleMute = () => { const newVolume = volume > 0 ? 0 : (lastVolume > 0 ? lastVolume : 0.75); if (volume > 0) setLastVolume(volume); setVolume(newVolume); };

    return (
        <div className="player-bar">
            <audio ref={audioRef} onPlay={handlePlay} onPause={handlePause} onEnded={handlePause} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onCanPlay={handleCanPlay} onError={handleError} crossOrigin="anonymous"/>
            <div className="player-song-info">
                 <div className="player-artwork">{currentSong?.artworkUrl ? (<img src={currentSong.artworkUrl} alt={currentSong.title} />) : (<div className="default-artwork-player"><DefaultArtworkIcon /></div>)}</div>
                 <div className="player-song-details">{currentSong ? ( <><strong>{currentSong.title}</strong><p>{currentSong.artist}</p></> ) : ( <p>Select a song to play</p> )}</div>
            </div>
            <div className="player-controls">
                <button onClick={togglePlayPause} disabled={!currentSong} className="play-pause-btn">{isLoadingSong ? 'Loading...' : (isPlaying ? <PauseIcon /> : <PlayIcon />)}</button>
                <div className="progress-container"><span>{formatTime(currentTime)}</span><input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleProgressChange} className="progress-bar" disabled={!currentSong} /><span>{formatTime(duration)}</span></div>
            </div>
            <div className="player-volume-controls">
                <button onClick={toggleMute} className="volume-btn">{volume === 0 ? <VolumeMuteIcon /> : <VolumeHighIcon />}</button>
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="volume-slider" />
            </div>
        </div>
    );
}
export default Player;