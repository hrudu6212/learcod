import React, { useState, useEffect } from 'react';
import { synth } from '../utils/audio';
import { Music, Volume2, VolumeX, Sparkles, Cpu, Orbit } from 'lucide-react';

export const AmbientPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'fantasy' | 'cyberpunk' | 'space'>('fantasy');
  const [volume, setVolume] = useState(0.2); // Default comfortable volume (20%)
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Sync initial volume
    synth.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      synth.stop();
    };
  }, []);

  const handlePlayToggle = async () => {
    if (isPlaying) {
      synth.stop();
      setIsPlaying(false);
    } else {
      await synth.start(currentTheme);
      setIsPlaying(true);
    }
  };

  const handleThemeChange = async (theme: 'fantasy' | 'cyberpunk' | 'space') => {
    setCurrentTheme(theme);
    if (isPlaying) {
      await synth.start(theme);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (isMuted) setIsMuted(false);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Music size={18} className={isPlaying ? 'text-cyan' : ''} style={{ color: isPlaying ? '#22d3ee' : '#a78bfa' }} />
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Procedural Ambient Synth</h4>
        </div>
        
        {isPlaying && (
          <div className="audio-visualizer">
            <div className="audio-bar"></div>
            <div className="audio-bar"></div>
            <div className="audio-bar"></div>
            <div className="audio-bar"></div>
          </div>
        )}
      </div>

      {/* Theme buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
        <button
          className={`btn btn-secondary ${currentTheme === 'fantasy' ? 'btn-outline-cyan' : ''}`}
          style={{
            padding: '0.4rem 0.2rem',
            fontSize: '0.75rem',
            background: currentTheme === 'fantasy' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(255,255,255,0.02)',
            borderColor: currentTheme === 'fantasy' ? '#a78bfa' : 'rgba(255,255,255,0.08)'
          }}
          onClick={() => handleThemeChange('fantasy')}
          title="Fantasy Portal: Slow, magical triads"
        >
          <Sparkles size={12} style={{ marginRight: '2px' }} />
          Fantasy
        </button>

        <button
          className={`btn btn-secondary ${currentTheme === 'cyberpunk' ? 'btn-outline-cyan' : ''}`}
          style={{
            padding: '0.4rem 0.2rem',
            fontSize: '0.75rem',
            background: currentTheme === 'cyberpunk' ? 'rgba(34, 211, 238, 0.1)' : 'rgba(255,255,255,0.02)',
            borderColor: currentTheme === 'cyberpunk' ? '#22d3ee' : 'rgba(255,255,255,0.08)'
          }}
          onClick={() => handleThemeChange('cyberpunk')}
          title="Cyber Grid: Pentatonic arpeggios"
        >
          <Cpu size={12} style={{ marginRight: '2px' }} />
          Cyber
        </button>

        <button
          className={`btn btn-secondary ${currentTheme === 'space' ? 'btn-outline-cyan' : ''}`}
          style={{
            padding: '0.4rem 0.2rem',
            fontSize: '0.75rem',
            background: currentTheme === 'space' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(255,255,255,0.02)',
            borderColor: currentTheme === 'space' ? '#ec4899' : 'rgba(255,255,255,0.08)'
          }}
          onClick={() => handleThemeChange('space')}
          title="Cosmic Void: Low frequency space drone"
        >
          <Orbit size={12} style={{ marginRight: '2px' }} />
          Space
        </button>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
        <button
          className="btn"
          onClick={handlePlayToggle}
          style={{
            padding: '0.4rem 1rem',
            fontSize: '0.8rem',
            background: isPlaying ? 'rgba(239, 68, 68, 0.15)' : 'linear-gradient(135deg, #a78bfa, #ec4899)',
            border: 'none',
            color: '#fff',
            flex: 1
          }}
        >
          {isPlaying ? 'Mute Ambient' : 'Play Ambient'}
        </button>

        {/* Volume controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleMuteToggle}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{
              width: '60px',
              height: '4px',
              accentColor: '#22d3ee',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>
    </div>
  );
};
