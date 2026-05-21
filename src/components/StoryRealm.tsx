import React, { useState, useEffect } from 'react';
import { CodeStory } from '../types';
import { synth } from '../utils/audio';
import { 
  BookOpen, ChevronRight, Volume2, VolumeX, 
  Sparkles, BookMarked, Eye, BrainCircuit, Lock, CheckCircle2, XCircle, RotateCcw
} from 'lucide-react';

interface StoryRealmProps {
  story: CodeStory;
  fullCode: string;
  onExit: () => void;
}

export const StoryRealm: React.FC<StoryRealmProps> = ({ story, fullCode, onExit }) => {
  const [activeLevelIndex, setActiveLevelIndex] = useState(0);
  const [unlockedLevelIndex, setUnlockedLevelIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [panelTab, setPanelTab] = useState<'lore' | 'grimoire' | 'trial'>('lore');

  const activeLevel = story.chapters[activeLevelIndex];
  const codeLines = fullCode.split('\n');

  // Cancel speech synthesis when changing levels or unmounting
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsNarrating(false);
    
    // Reset challenge state for the new active level if it's not cleared yet
    setSelectedOption(null);
    setIsAnswered(activeLevelIndex < unlockedLevelIndex);
    setPanelTab('lore');
  }, [activeLevelIndex, unlockedLevelIndex]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Text-to-Speech Narration
  const handleNarrate = () => {
    if (!activeLevel) return;
    
    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }

    const narrativeText = activeLevel.narrative;
    const utterance = new SpeechSynthesisUtterance(narrativeText);
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || 
                        voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsNarrating(false);
    };

    utterance.onerror = () => {
      setIsNarrating(false);
    };

    setIsNarrating(true);
    window.speechSynthesis.speak(utterance);
  };

  // Helper to determine if a full code line matches the active level's code snippet
  const isLineHighlighted = (lineText: string) => {
    if (!activeLevel || !activeLevel.codeSnippet) return false;
    
    const cleanLine = lineText.trim().replace(/\s+/g, '');
    if (!cleanLine || cleanLine.length < 3) return false;
    
    if (hoveredWord) {
      const escapedWord = hoveredWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedWord}\\b`);
      if (regex.test(lineText)) return true;
    }

    const cleanSnippet = activeLevel.codeSnippet.trim().replace(/\s+/g, '');
    return cleanSnippet.includes(cleanLine);
  };

  const getCharacterEmoji = (role: string, name: string) => {
    const text = `${role} ${name}`.toLowerCase();
    if (text.includes('guard') || text.includes('gate') || text.includes('check') || text.includes('swapped')) return '🛡️';
    if (text.includes('wizard') || text.includes('mage') || text.includes('spell') || text.includes('algorithm')) return '🧙‍♂️';
    if (text.includes('key') || text.includes('lock') || text.includes('index') || text.includes('pointer')) return '🗝️';
    if (text.includes('messenger') || text.includes('fetch') || text.includes('response') || text.includes('fetcher')) return '🕊️';
    if (text.includes('loop') || text.includes('wheel') || text.includes('cycle') || text.includes('iteration')) return '🔄';
    if (text.includes('dragon') || text.includes('beast') || text.includes('boss') || text.includes('error')) return '🐉';
    if (text.includes('gold') || text.includes('treasure') || text.includes('loot') || text.includes('data')) return '💰';
    if (text.includes('sword') || text.includes('knight') || text.includes('warrior')) return '⚔️';
    if (text.includes('merge') || text.includes('join') || text.includes('marriage') || text.includes('union')) return '💍';
    if (text.includes('chamber') || text.includes('mid') || text.includes('portal')) return '🌀';
    return '👤';
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleCastAnswer = () => {
    if (selectedOption === null || isAnswered || !activeLevel) return;

    const isCorrect = selectedOption === activeLevel.challenge.answerIndex;
    setIsAnswered(true);

    if (isCorrect) {
      // Play success audio cue
      synth.playSuccessSound();
      
      const nextLevel = activeLevelIndex + 1;
      setUnlockedLevelIndex((prev) => Math.max(prev, nextLevel));
    }
  };

  const handleNextLevel = () => {
    const nextIdx = activeLevelIndex + 1;
    if (nextIdx < story.chapters.length) {
      setActiveLevelIndex(nextIdx);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestartQuest = () => {
    setActiveLevelIndex(0);
    setUnlockedLevelIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCompleted(false);
  };

  const totalLevels = story.chapters.length;

  if (isCompleted) {
    return (
      <div className="story-realm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px', textAlign: 'center', padding: '3rem 2rem' }}>
        <div className="welcome-screen glass-panel glow-ambient-violet" style={{ padding: '3rem 2rem', maxWidth: '600px' }}>
          <div className="welcome-sphere" style={{ animationDuration: '3s' }}>🏆</div>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '1rem' }}>Quest Cleared!</h2>
          <span style={{ fontSize: '0.85rem', color: '#22d3ee', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Title Unlocked: Grand Magus of Code
          </span>

          <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6, margin: '1rem 0' }}>
            Congratulations! You have successfully crossed all logic chambers in &ldquo;{story.title}&rdquo;. The code variables and runtime flows are no longer dry tokens, but legends in your archive.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'left', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', display: 'block' }}>Chambers Cracked</span>
              <strong style={{ fontSize: '1.2rem', color: '#10b981' }}>{totalLevels} / {totalLevels}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', display: 'block' }}>Difficulty</span>
              <strong style={{ fontSize: '1.2rem', color: '#a78bfa' }}>Mastered</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button className="btn btn-secondary" onClick={handleRestartQuest} style={{ flex: 1 }}>
              <RotateCcw size={14} />
              Replay Quest
            </button>
            <button className="btn btn-primary" onClick={onExit} style={{ flex: 1 }}>
              Choose New Spell
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="story-realm">
      
      {/* Quest Navigation Map */}
      <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(13, 20, 26, 0.65)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Logical Quest Map
          </h4>
          <button className="btn" onClick={onExit} style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
            Exit Quest
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0' }}>
          {story.chapters.map((_, idx) => {
            const isCleared = idx < unlockedLevelIndex;
            const isActive = idx === activeLevelIndex;
            const isLocked = idx > unlockedLevelIndex;

            return (
              <React.Fragment key={idx}>
                {/* Node Button */}
                <button
                  onClick={() => !isLocked && setActiveLevelIndex(idx)}
                  disabled={isLocked}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    minWidth: '70px',
                    opacity: isLocked ? 0.45 : 1,
                    position: 'relative',
                    zIndex: 2,
                    outline: 'none'
                  }}
                  title={isLocked ? "Level is locked. Complete the challenge of the active level first!" : `Go to Level ${idx + 1}`}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isCleared 
                        ? 'rgba(16, 185, 129, 0.12)' 
                        : isActive 
                        ? 'rgba(13, 148, 136, 0.25)' 
                        : 'rgba(255, 255, 255, 0.02)',
                      border: `2px solid ${
                        isCleared 
                          ? '#10b981' 
                          : isActive 
                          ? '#0d9488' 
                          : 'rgba(255, 255, 255, 0.08)'
                      }`,
                      boxShadow: isActive ? '0 0 15px rgba(13, 148, 136, 0.5)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: isCleared ? '#10b981' : isActive ? '#fff' : '#6b7280',
                      transition: 'all 0.3s',
                    }}
                  >
                    {isCleared ? '✓' : isLocked ? <Lock size={12} style={{ color: '#4b5563' }} /> : idx + 1}
                  </div>
                  <span style={{
                    fontSize: '0.62rem',
                    color: isActive ? '#eab308' : isCleared ? '#10b981' : '#9ca3af',
                    marginTop: '0.35rem',
                    fontWeight: isActive ? 700 : 500,
                    textAlign: 'center',
                  }}>
                    Level {idx + 1}
                  </span>
                </button>

                {/* Connecting Path Line */}
                {idx < totalLevels - 1 && (
                  <div 
                    style={{
                      flex: '1 0 30px',
                      height: '2px',
                      background: idx < unlockedLevelIndex 
                        ? 'linear-gradient(90deg, #10b981, #0d9488)' 
                        : 'rgba(255, 255, 255, 0.06)',
                      marginTop: '-16px',
                      zIndex: 1,
                      transition: 'all 0.3s'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Story Setting Sub-banner */}
      <div className="glass-panel glow-ambient-teal" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.75rem', fontSize: '2rem', opacity: 0.1 }}>
          📖
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Sparkles size={14} style={{ color: '#0d9488' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            QUEST REALM: {story.title}
          </span>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.8rem', lineHeight: 1.4, fontStyle: 'italic' }}>
          &ldquo;{story.setting}&rdquo;
        </p>
      </div>

      {/* Sorcerer Level Status Panel */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', background: 'rgba(255, 255, 255, 0.015)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            🧙‍♂️ Spellcaster Status Rank
          </span>
          <span className="category-badge" style={{ fontSize: '0.65rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', borderColor: '#10b981' }}>
            Rank: {unlockedLevelIndex === totalLevels ? "Archmage 🔮" : unlockedLevelIndex > 1 ? "Spell Weaver ⚡" : "Novice 🧪"}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '0.25rem' }}>
              <span>Sorcerer Progression XP</span>
              <span>{Math.round((unlockedLevelIndex / totalLevels) * 100)}%</span>
            </div>
            <div className="mana-bar-container">
              <div className="mana-bar-fill" style={{ width: `${(unlockedLevelIndex / totalLevels) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#9ca3af', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.4rem', marginTop: '0.25rem' }}>
          <span>Cleared Chambers: <strong>{unlockedLevelIndex} / {totalLevels}</strong></span>
          <span>Current Focus: <strong>Level {activeLevelIndex + 1}</strong></span>
        </div>
      </div>

      {/* Collapsible Spellbook of Thoughts (Reasoning Block) */}
      {story.rawThinking && (
        <div className="spellbook-thought">
          <div className="spellbook-header" onClick={() => setShowThinking(!showThinking)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BrainCircuit size={16} />
              <span>Spellbook of Thoughts (AI Reasoning)</span>
            </div>
            <span style={{ fontSize: '0.75rem' }}>{showThinking ? '[Close Spellbook]' : '[Open Spellbook]'}</span>
          </div>
          {showThinking && (
            <div className="spellbook-body">
              {story.rawThinking}
            </div>
          )}
        </div>
      )}

      {/* Character Guild Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <BookMarked size={16} style={{ color: '#a78bfa' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Guild of Characters (Code Mapping)</h3>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
          Hover over characters to highlight their representation inside the code chamber.
        </p>
        <div className="characters-grid">
          {story.characters.map((char, index) => (
            <div 
              key={index} 
              className="character-card"
              onMouseEnter={() => setHoveredWord(char.codeEquivalent)}
              onMouseLeave={() => setHoveredWord(null)}
              style={{
                borderColor: hoveredWord === char.codeEquivalent ? '#0d9488' : 'rgba(255,255,255,0.06)',
                background: hoveredWord === char.codeEquivalent ? 'rgba(13, 148, 136, 0.04)' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="character-avatar">
                  {getCharacterEmoji(char.role, char.name)}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f3f4f6' }}>{char.name}</h4>
                  <span style={{ fontSize: '0.65rem', color: '#0d9488', fontWeight: 600 }}>{char.role}</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem', marginTop: '0.1rem' }}>
                <code style={{ fontSize: '0.7rem', color: '#f472b6', background: 'rgba(244,114,182,0.1)', padding: '0.1rem 0.25rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                  {char.codeEquivalent}
                </code>
                <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.35rem', lineHeight: 1.3 }}>
                  {char.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Interactive Screen */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Eye size={16} style={{ color: '#a78bfa' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
            Active Level Chamber: Level {activeLevelIndex + 1}
          </h3>
        </div>

        <div className="interactive-reader">
          {/* Code Chamber (Left) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="code-editor-chrome">
              <div className="chrome-dots">
                <span className="chrome-dot red"></span>
                <span className="chrome-dot yellow"></span>
                <span className="chrome-dot green"></span>
              </div>
              <span className="chrome-title">Source Rune Chamber</span>
              <span style={{ fontSize: '0.65rem', color: '#a78bfa', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                Active lines highlighted
              </span>
            </div>
            
            <div className="code-container" style={{ minHeight: '380px', maxHeight: '480px' }}>
              {codeLines.map((line, idx) => {
                const highlighted = isLineHighlighted(line);
                return (
                  <div
                    key={idx}
                    className={`code-line ${highlighted ? 'code-line-highlight' : ''}`}
                    style={{
                      transition: 'background 0.2s ease-in-out'
                    }}
                  >
                    <span style={{
                      display: 'inline-block',
                      width: '28px',
                      color: highlighted ? '#a78bfa' : '#4b5563',
                      userSelect: 'none',
                      fontSize: '0.75rem',
                      textAlign: 'right',
                      marginRight: '12px'
                    }}>
                      {idx + 1}
                    </span>
                    {line || ' '}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Study Chapter Panel (Right) */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {activeLevel && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '450px' }}>
                
                {/* Sub Tab Header */}
                <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                  <button
                    onClick={() => setPanelTab('lore')}
                    className="btn"
                    style={{
                      flex: 1,
                      background: panelTab === 'lore' ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                      border: 'none',
                      color: panelTab === 'lore' ? '#a78bfa' : '#9ca3af',
                      padding: '0.4rem 0.25rem',
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      fontWeight: panelTab === 'lore' ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <BookMarked size={12} />
                    Lore
                  </button>

                  <button
                    onClick={() => setPanelTab('grimoire')}
                    className="btn"
                    style={{
                      flex: 1,
                      background: panelTab === 'grimoire' ? 'rgba(34, 211, 238, 0.12)' : 'transparent',
                      border: 'none',
                      color: panelTab === 'grimoire' ? '#22d3ee' : '#9ca3af',
                      padding: '0.4rem 0.25rem',
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      fontWeight: panelTab === 'grimoire' ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <BrainCircuit size={12} />
                    Grimoire
                  </button>

                  <button
                    onClick={() => setPanelTab('trial')}
                    className="btn"
                    style={{
                      flex: 1,
                      background: panelTab === 'trial' ? 'rgba(251, 113, 133, 0.12)' : 'transparent',
                      border: 'none',
                      color: panelTab === 'trial' ? '#fb7185' : '#9ca3af',
                      padding: '0.4rem 0.25rem',
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      fontWeight: panelTab === 'trial' ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Sparkles size={12} />
                    Trial
                    {isAnswered && <span style={{ color: '#10b981', fontSize: '0.65rem' }}>✓</span>}
                  </button>
                </div>

                {/* Sub Tab View Container */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem', display: 'flex', flexDirection: 'column' }}>
                  
                  {panelTab === 'lore' && (
                    /* LORE NARRATIVE TAB */
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {/* Narrator Controls */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f3f4f6', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                          {activeLevel.title}
                        </span>
                        
                        <button 
                          onClick={handleNarrate}
                          style={{
                            background: isNarrating ? 'rgba(34,211,238,0.1)' : 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isNarrating ? '#22d3ee' : '#9ca3af',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          title={isNarrating ? "Stop reading" : "Read narrative out loud"}
                        >
                          {isNarrating ? <VolumeX size={12} /> : <Volume2 size={12} />}
                        </button>
                      </div>

                      <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#e4e4e7', marginBottom: '1rem', fontStyle: 'italic', borderLeft: '3px solid #a78bfa', paddingLeft: '0.75rem' }}>
                        {activeLevel.narrative}
                      </p>

                      {/* Characters in play list specific to this level */}
                      {(() => {
                        const levelCharacters = story.characters.filter(char => 
                          activeLevel.codeSnippet.toLowerCase().includes(char.codeEquivalent.toLowerCase())
                        );
                        const displayCharacters = levelCharacters.length > 0 ? levelCharacters : story.characters;

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block' }}>
                              Characters active in this level:
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {displayCharacters.map((char, index) => (
                                <div 
                                  key={index} 
                                  className="character-card" 
                                  style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.01)', margin: 0 }}
                                  onMouseEnter={() => setHoveredWord(char.codeEquivalent)}
                                  onMouseLeave={() => setHoveredWord(null)}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1rem' }}>{getCharacterEmoji(char.role, char.name)}</span>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'baseline' }}>
                                        <strong style={{ fontSize: '0.78rem', color: '#f3f4f6' }}>{char.name}</strong>
                                        <code style={{ fontSize: '0.62rem', color: '#fb7185', fontFamily: 'var(--font-mono)' }}>({char.codeEquivalent})</code>
                                      </div>
                                      <p style={{ fontSize: '0.68rem', color: '#9ca3af', lineHeight: 1.3, marginTop: '0.1rem' }}>{char.description}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      <button
                        className="btn btn-secondary"
                        onClick={() => setPanelTab('grimoire')}
                        style={{ marginTop: '1.25rem', width: '100%', padding: '0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                      >
                        Study Rune Code (Decoded) <ChevronRight size={12} />
                      </button>
                    </div>
                  )}

                  {panelTab === 'grimoire' && (
                    /* DECODED GRIMOIRE EXPLANATION TAB */
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {/* Real world analogy card */}
                      {activeLevel.analogy && (
                        <div style={{
                          background: 'rgba(234, 179, 8, 0.05)',
                          border: '1px solid rgba(234, 179, 8, 0.15)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          marginBottom: '1rem',
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'flex-start'
                        }}>
                          <span style={{ fontSize: '1.1rem', marginTop: '-0.1rem' }}>💡</span>
                          <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#facc15', textTransform: 'uppercase', display: 'block', marginBottom: '0.15rem' }}>Real-World Analogy</span>
                            <p style={{ fontSize: '0.72rem', color: '#e4e4e7', lineHeight: 1.45 }}>{activeLevel.analogy}</p>
                          </div>
                        </div>
                      )}

                      {/* Step-by-step Line breakdown */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block' }}>
                          Line-by-Line Grimoire:
                        </span>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {activeLevel.lineBreakdown && activeLevel.lineBreakdown.length > 0 ? (
                            activeLevel.lineBreakdown.map((item, idx) => (
                              <div key={idx} style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', padding: '0.55rem' }}>
                                <code style={{ fontSize: '0.72rem', color: '#fb7185', fontFamily: 'var(--font-mono)', display: 'block', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.2rem', marginBottom: '0.2rem' }}>
                                  {item.line}
                                </code>
                                <p style={{ fontSize: '0.7rem', color: '#a1a1aa', lineHeight: 1.35 }}>
                                  {item.meaning}
                                </p>
                              </div>
                            ))
                          ) : (
                            activeLevel.codeSnippet.split('\n').filter(l => l.trim().length > 0).map((line, idx) => (
                              <div key={idx} style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', padding: '0.55rem' }}>
                                <code style={{ fontSize: '0.72rem', color: '#fb7185', fontFamily: 'var(--font-mono)', display: 'block' }}>
                                  {line}
                                </code>
                                <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                                  Executes logical step and adjusts values in the current runtime stack.
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Technical breakdown summary */}
                      <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.2rem' }}>
                          <BookOpen size={11} style={{ color: '#f472b6' }} />
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f472b6', textTransform: 'uppercase' }}>Runes Decoded</span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: '#9ca3af', lineHeight: 1.4 }}>
                          {activeLevel.explanation}
                        </p>
                      </div>

                      <button
                        className="btn btn-primary"
                        onClick={() => setPanelTab('trial')}
                        style={{ marginTop: '1.25rem', width: '100%', padding: '0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                      >
                        Enter Level Trial 🛡️ <ChevronRight size={12} />
                      </button>
                    </div>
                  )}

                  {panelTab === 'trial' && (
                    /* TRIAL QUESTION CHALLENGE TAB */
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
                      
                      {!isAnswered ? (
                        <div className="quiz-container" style={{ margin: 0 }}>
                          <span style={{ fontSize: '0.68rem', color: '#fb7185', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block' }}>
                            🔒 Chamber Challenge: Unlock Next Level
                          </span>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6', lineHeight: 1.4, margin: '0.35rem 0 0.75rem 0' }}>
                            {activeLevel.challenge.question}
                          </p>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            {activeLevel.challenge.options.map((option, idx) => {
                              const isOptionSelected = idx === selectedOption;
                              return (
                                <button
                                  key={idx}
                                  className={`quiz-option ${isOptionSelected ? 'selected' : ''}`}
                                  onClick={() => handleSelectOption(idx)}
                                  style={{
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: '8px'
                                  }}
                                >
                                  <span style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    borderRadius: '50%', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontSize: '0.65rem',
                                    color: isOptionSelected ? '#fff' : '#9ca3af'
                                  }}>
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                  <span style={{ fontSize: '0.75rem' }}>{option}</span>
                                </button>
                              );
                            })}
                          </div>

                          <button
                            className="btn btn-primary"
                            onClick={handleCastAnswer}
                            disabled={selectedOption === null}
                            style={{ width: '100%', padding: '0.55rem' }}
                          >
                            Cast Answer Spell
                          </button>
                        </div>
                      ) : (
                        /* Level is Cracked / Answered */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ 
                            background: selectedOption === activeLevel.challenge.answerIndex || activeLevelIndex < unlockedLevelIndex
                              ? 'rgba(16, 185, 129, 0.08)' 
                              : 'rgba(239, 68, 68, 0.08)',
                            borderLeft: `3px solid ${
                              selectedOption === activeLevel.challenge.answerIndex || activeLevelIndex < unlockedLevelIndex
                                ? '#10b981' 
                                : '#ef4444'
                            }`,
                            padding: '0.65rem 0.85rem',
                            borderRadius: '0 8px 8px 0',
                            fontSize: '0.75rem',
                            lineHeight: 1.4
                          }}>
                            <strong style={{ 
                              color: selectedOption === activeLevel.challenge.answerIndex || activeLevelIndex < unlockedLevelIndex
                                ? '#34d399' 
                                : '#f87171', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.25rem', 
                              marginBottom: '0.2rem' 
                            }}>
                              {selectedOption === activeLevel.challenge.answerIndex || activeLevelIndex < unlockedLevelIndex ? (
                                <>
                                  <CheckCircle2 size={12} />
                                  Chamber Challenge Unlocked!
                                </>
                              ) : (
                                <>
                                  <XCircle size={12} />
                                  Rune Cast Failed!
                                </>
                              )}
                            </strong>
                            <span style={{ color: '#d1d5db' }}>{activeLevel.challenge.explanation}</span>
                          </div>

                          {/* Display proceed buttons */}
                          {selectedOption === activeLevel.challenge.answerIndex || activeLevelIndex < unlockedLevelIndex ? (
                            <button
                              className="btn btn-primary"
                              onClick={handleNextLevel}
                              style={{ width: '100%', padding: '0.55rem' }}
                            >
                              {activeLevelIndex === totalLevels - 1 ? 'Claim Victory Title' : 'Proceed to Next Level'}
                              <ChevronRight size={14} />
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary"
                              onClick={() => {
                                setIsAnswered(false);
                                setSelectedOption(null);
                              }}
                              style={{ width: '100%', padding: '0.55rem' }}
                            >
                              Recast Answer
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Branding Footer */}
      <div style={{
        marginTop: '1.5rem',
        fontSize: '0.7rem',
        color: '#4b5563',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.03)',
        paddingTop: '0.88rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '0.4rem',
        letterSpacing: '0.03em',
        width: '100%',
        zIndex: 10
      }}>
        <span>Made by <strong style={{ color: '#0d9488' }}>Corestar</strong></span>
        <span>•</span>
        <span>Owned by <strong style={{ color: '#eab308' }}>Hruddayansh</strong></span>
      </div>

    </div>
  );
};
