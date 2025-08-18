import React from 'react';

function PlatformFilter({ currentPlatform, onPlatformChange }) {
  const platforms = [
    { value: 'all', label: 'All Platforms', emoji: '🌐' },
    { value: 'qmusic', label: 'Q-Music Only', emoji: '🎵' },
    { value: 'earbump', label: 'Ear-Bump Only', emoji: '🎧' }
  ];

  return (
    <div className="platform-filter">
      <div className="platform-filter-label">
        <span>🔍 Filter by Platform:</span>
      </div>
      <div className="platform-filter-buttons">
        {platforms.map(platform => (
          <button
            key={platform.value}
            onClick={() => onPlatformChange(platform.value)}
            className={`platform-btn ${currentPlatform === platform.value ? 'active' : ''}`}
          >
            <span className="platform-emoji">{platform.emoji}</span>
            <span className="platform-label">{platform.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PlatformFilter;
