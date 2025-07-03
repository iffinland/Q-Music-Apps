// src/components/Player.jsx
import React, { useState, useEffect, useRef } from 'react';

// Icons etc.
const PlayIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg> );
const PauseIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" /></svg> );
// ...
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
            setIsPlaying(false);
            
            const { name, identifier } = currentSong.qdnData;
            const audioUrl = `/audio/${encodeURIComponent(name)}/${encodeURIComponent(identifier)}`;
            console.log(`Player: Setting new source to: ${audioUrl}`);

            audioEl.src = audioUrl;
            audioEl.load();
        } else {
            audioEl.pause();
            // Eemaldame atribuudi täielikult, kui laulu pole
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

    const handleCanPlay = () => {
        setIsLoadingSong(false);
        audioRef.current?.play().catch(e => console.warn("Autoplay was blocked by the browser."));
    };
    
    const handleError = () => {
        setIsLoadingSong(false);
        alert("Error: The selected audio could not be loaded.");
    };

    // Nuppude ja liugurite handlerid
    const togglePlayPause = () => { if (!audioRef.current?.src || isLoadingSong) return; const audio = audioRef.current; if (audio.paused) { audio.play().catch(handleError); } else { audio.pause(); }};
    const handleProgressChange = (e) => { if (audioRef.current) audioRef.current.currentTime = e.target.value; };
    const handleVolumeChange = (e) => setVolume(parseFloat(e.target.value));
    const toggleMute = () => { const newVolume = volume > 0 ? 0 : (lastVolume > 0 ? lastVolume : 0.75); if (volume > 0) setLastVolume(volume); setVolume(newVolume); };

    return (
        <div className="player-bar">
            <audio
                ref={audioRef}
                onPlay={handlePlay} onPause={handlePause} onEnded={handlePause} onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata} onCanPlay={handleCanPlay} onError={handleError}
                crossOrigin="anonymous"
            />
            {/* JSX jääb samaks */}
        </div>
    );
}

export default Player;