import React, { useState, useEffect } from 'react';
import { CodeSnippet, CodeStory } from './types';
import { StoryRealm } from './components/StoryRealm';
import { generateStory } from './utils/ai';
import { CODE_EXAMPLES } from './utils/examples';
import { Sparkles, Terminal, Scroll, AlertCircle } from 'lucide-react';

const LOADING_STEPS = [
  { name: "Deciphering Syntax Runes", minProgress: 0 },
  { name: "Forging Character Mappings", minProgress: 25 },
  { name: "Fusing Narrative Chapters", minProgress: 50 },
  { name: "Anchoring Level Challenges", minProgress: 75 }
];

export const App: React.FC = () => {
  const [page, setPage] = useState<'input' | 'analysis' | 'workspace'>('input');
  
  // Auth Portal States
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; discipline: string } | null>(null);
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'signup'>('landing');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [discipline, setDiscipline] = useState('Sorcerer');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Selection States
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(CODE_EXAMPLES[0]);
  const [customCode, setCustomCode] = useState('// Write or paste your script here\n');
  const [customLanguage, setCustomLanguage] = useState('javascript');
  const [activeCodeText, setActiveCodeText] = useState('');
  
  // Analysis & Loading States
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [apiDone, setApiDone] = useState(false);
  const [pendingStory, setPendingStory] = useState<CodeStory | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Final Story State
  const [story, setStory] = useState<CodeStory | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('All runic slots must be filled!');
      return;
    }
    setIsAuthenticating(true);
    setAuthError(null);
    setTimeout(() => {
      setIsAuthenticating(false);
      setCurrentUser({
        name: name || 'Sorcerer Ashvini',
        email,
        discipline: discipline
      });
    }, 1200);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setAuthError('All runic slots must be filled!');
      return;
    }
    setIsAuthenticating(true);
    setAuthError(null);
    setTimeout(() => {
      setIsAuthenticating(false);
      setCurrentUser({
        name,
        email,
        discipline
      });
    }, 1200);
  };

  // Simulated Progress bar running on analysis screen
  useEffect(() => {
    if (page !== 'analysis') {
      setAnalysisProgress(0);
      setApiDone(false);
      setPendingStory(null);
      return;
    }

    const interval = window.setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 98) {
          if (apiDone) {
            clearInterval(interval);
            return 100;
          }
          return 98;
        }
        // Speed up initially, slow down as it gets closer to 98
        const increment = prev < 40 ? 4 : prev < 75 ? 2 : 1;
        return prev + increment;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [page, apiDone]);

  // Transition to workspace once both progress is 100% and API is ready
  useEffect(() => {
    if (page === 'analysis' && analysisProgress === 100 && pendingStory) {
      setStory(pendingStory);
      setPage('workspace');
    }
  }, [analysisProgress, pendingStory, page]);

  const handleInitiateSpell = async () => {
    let codeToUse = '';
    let langToUse = '';

    if (activeTab === 'presets') {
      if (!selectedSnippet) {
        setError("Please select a preset scroll!");
        return;
      }
      codeToUse = selectedSnippet.code;
      langToUse = selectedSnippet.language;
    } else {
      codeToUse = customCode;
      langToUse = customLanguage;
    }

    if (!codeToUse.trim() || codeToUse.trim().startsWith('// Write or paste your script here')) {
      setError("Please write or paste your custom code before transmuting!");
      return;
    }

    setError(null);
    setPage('analysis');
    setApiDone(false);
    setPendingStory(null);
    setAnalysisProgress(0);
    setActiveCodeText(codeToUse);

    try {
      const generated = await generateStory(codeToUse, langToUse);
      setPendingStory(generated);
      setApiDone(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong while conjuring the lore.';
      setError(msg);
      setPage('input');
    }
  };

  const handleSelectPreset = (snippet: CodeSnippet) => {
    setSelectedSnippet(snippet);
    setCustomCode('');
  };

  const handleSelectCustomMode = () => {
    setSelectedSnippet(null);
    if (!customCode) {
      setCustomCode('// Write or paste your script here\n');
    }
  };

  if (!currentUser) {
    return (
      <div className="landing-container">
        {/* Animated Background Orbs */}
        <div className="magical-orb orb-primary"></div>
        <div className="magical-orb orb-secondary"></div>

        <div className="landing-split">
          
          {/* Hero Content Column */}
          <div className="landing-hero-block">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.88rem' }}>
              <div style={{ position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #0d9488, #06b6d4, #eab308)',
                  borderRadius: '16px',
                  opacity: 0.25,
                  filter: 'blur(10px)',
                  animation: 'pulse-glow 3s infinite alternate'
                }}></div>
                <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 1 }}>
                  <defs>
                    <linearGradient id="landing-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0d9488" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#eab308" />
                    </linearGradient>
                  </defs>
                  <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" stroke="url(#landing-logo-grad)" strokeWidth="5" fill="rgba(15, 23, 42, 0.6)" />
                  <path d="M32,38 L18,50 L32,62" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M68,38 L82,50 L68,62" stroke="#eab308" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <polygon points="50,28 62,50 50,72 38,50" fill="url(#landing-logo-grad)" style={{ animation: 'float-sphere 2s ease-in-out infinite' }} />
                </svg>
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 900, 
                  letterSpacing: '-0.03em', 
                  lineHeight: 0.95,
                  background: 'linear-gradient(135deg, #0d9488, #06b6d4, #eab308)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  learcod
                </h1>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  The Spellbook of Coding Logic
                </span>
              </div>
            </div>

            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1.15, color: '#fff', letterSpacing: '-0.02em', marginTop: '0.5rem' }}>
              Transmute raw syntax into <span style={{ color: '#eab308', textShadow: '0 0 15px rgba(234,179,8,0.2)' }}>interactive quest levels</span>.
            </h2>

            <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '520px' }}>
              Enter the Chamber of Transmutation. Paste any code block and witness it transform into a magical fantasy lore chapter, broken into levels that you unlock by conquering runic logical trials.
            </p>

            {/* Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem', maxWidth: '500px' }}>
              <div className="stat-item">
                <span className="stat-val">12k+</span>
                <span className="stat-label">Spellcasters</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">890k</span>
                <span className="stat-label">Runs Deciphered</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">99.4%</span>
                <span className="stat-label">Runic Accuracy</span>
              </div>
            </div>
          </div>

          {/* Right Column: Portal Card */}
          <div className="auth-card">
            {authMode === 'landing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>Access Chamber Gate</h3>
                <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: '-0.75rem' }}>
                  Register your Runic Identity Profile to archive cleared quests and build your status rank.
                </p>

                <button 
                  className="btn btn-primary" 
                  onClick={() => setAuthMode('signup')}
                  style={{ width: '100%', padding: '0.85rem 1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
                >
                  Create Spellcaster Profile ⚡
                </button>

                <button 
                  className="btn btn-secondary" 
                  onClick={() => setAuthMode('login')}
                  style={{ width: '100%', padding: '0.85rem 1.5rem' }}
                >
                  Unlock Existing Spellbook (Log In)
                </button>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Or, explore without profile:</span>
                  <button 
                    onClick={() => {
                      setCurrentUser({ name: 'Guest Magus', email: 'guest@learcod.io', discipline: 'Alchemist' });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0d9488',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      display: 'block',
                      margin: '0.5rem auto 0 auto',
                      textDecoration: 'underline'
                    }}
                  >
                    Enter chamber as Guest Magus 🔮
                  </button>
                </div>
              </div>
            )}

            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>Unlock Spellbook</h3>
                <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
                  Enter your credentials to regain access to your cleared rooms.
                </p>

                {authError && (
                  <div className="custom-alert custom-alert-error" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.78rem' }}>⚠️ {authError}</span>
                  </div>
                )}

                <div className="portal-input-group">
                  <label className="portal-label">Secret Identity (Email)</label>
                  <input 
                    type="email" 
                    className="portal-input" 
                    placeholder="magus@arch.io"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="portal-input-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="portal-label">Rune Passcode</label>
                  <input 
                    type="password" 
                    className="portal-input portal-input-gold" 
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem' }}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? 'Decrypting Runic Seals...' : 'Channel Access Portal 🗝️'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', fontSize: '0.75rem' }}>
                  <span style={{ color: '#6b7280' }}>New apprentice?</span>
                  <button type="button" onClick={() => { setAuthMode('signup'); setAuthError(null); }} style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                    Create Profile
                  </button>
                </div>
              </form>
            )}

            {authMode === 'signup' && (
              <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>Enlist Apprentice</h3>
                <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
                  Create your profile to start logging level scores.
                </p>

                {authError && (
                  <div className="custom-alert custom-alert-error" style={{ marginBottom: '1rem', padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.78rem' }}>⚠️ {authError}</span>
                  </div>
                )}

                <div className="portal-input-group">
                  <label className="portal-label">Apprentice Alias</label>
                  <input 
                    type="text" 
                    className="portal-input" 
                    placeholder="Spellweaver Ash"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="portal-input-group">
                  <label className="portal-label">Secret Identity (Email)</label>
                  <input 
                    type="email" 
                    className="portal-input" 
                    placeholder="apprentice@learcod.io"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="portal-input-group">
                  <label className="portal-label">Rune Passcode</label>
                  <input 
                    type="password" 
                    className="portal-input portal-input-gold" 
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="portal-input-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="portal-label">Discipline Division</label>
                  <select 
                    className="portal-input portal-select" 
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                  >
                    <option value="Sorcerer">Sorcerer (JS / TypeScript)</option>
                    <option value="Pyromancer">Pyromancer (Python)</option>
                    <option value="Alchemist">Alchemist (C++)</option>
                    <option value="Necromancer">Necromancer (SQL Queries)</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem' }}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? 'Weaving Astral Profile...' : 'Manifest Identity Profile ✨'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', fontSize: '0.75rem' }}>
                  <span style={{ color: '#6b7280' }}>Already enlisted?</span>
                  <button type="button" onClick={() => { setAuthMode('login'); setAuthError(null); }} style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                    Log In
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Branding Footer */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          marginTop: '2.5rem',
          fontSize: '0.75rem',
          color: '#6b7280',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '1rem',
          width: '100%',
          maxWidth: '1000px',
          display: 'flex',
          justifyContent: 'center',
          gap: '0.4rem',
          letterSpacing: '0.03em'
        }}>
          <span>Made by <strong style={{ color: '#0d9488' }}>Corestar</strong></span>
          <span style={{ color: '#374151' }}>•</span>
          <span>Owned by <strong style={{ color: '#eab308' }}>Hruddayansh</strong></span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      
      {/* Header Bar */}
      <header className="header-bar" style={{ justifyContent: 'space-between', padding: '0.75rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.88rem' }}>
          {/* Super Logo for learcod */}
          <div style={{ position: 'relative', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #0d9488, #06b6d4, #eab308)',
              borderRadius: '12px',
              opacity: 0.15,
              filter: 'blur(8px)',
              animation: 'pulse-glow 3s infinite alternate'
            }}></div>
            <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 1 }}>
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>
              {/* Outer Hex Shield */}
              <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" stroke="url(#logo-grad)" strokeWidth="5" fill="rgba(15, 23, 42, 0.6)" />
              {/* Inner Brackets combined with Crystal */}
              <path d="M32,38 L18,50 L32,62" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M68,38 L82,50 L68,62" stroke="#eab308" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              {/* Floating core crystal node */}
              <polygon points="50,28 62,50 50,72 38,50" fill="url(#logo-grad)" style={{ animation: 'float-sphere 2s ease-in-out infinite' }} />
            </svg>
          </div>

          <div>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 900, 
              letterSpacing: '-0.02em', 
              lineHeight: 1,
              background: 'linear-gradient(135deg, #0d9488, #06b6d4, #eab308)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.15rem'
            }}>
              learcod
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#eab308', letterSpacing: 'normal', textFillColor: 'initial', WebkitTextFillColor: 'initial' }}>.</span>
            </h1>
            <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginTop: '0.15rem' }}>
              Transmuting logic into lore
            </span>
          </div>
        </div>

        {/* Profile Status Badge */}
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '0.35rem 0.85rem', borderRadius: '20px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0d9488, #eab308)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              {currentUser.name[0].toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f3f4f6', lineHeight: 1.1 }}>{currentUser.name}</span>
              <span style={{ fontSize: '0.58rem', color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                {currentUser.discipline} Magus
              </span>
            </div>
            <button 
              onClick={() => {
                setCurrentUser(null);
                setAuthMode('landing');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.65rem',
                cursor: 'pointer',
                fontWeight: 600,
                marginLeft: '0.35rem',
                textDecoration: 'underline'
              }}
            >
              Leave
            </button>
          </div>
        )}
      </header>

      {/* Main Pages Router */}
      <main style={{ flex: 1, overflowY: page === 'workspace' ? 'hidden' : 'auto', padding: page === 'workspace' ? '0' : '1.5rem' }}>
        
        {page === 'input' && (
          /* PAGE 1: CHOOSE OR INPUT CODE */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto', minHeight: 'calc(100vh - 125px)', justifyContent: 'center' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f3f4f6' }}>Choose Your Code Incantation</h2>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '0.25rem', maxWidth: '500px', margin: '0.25rem auto 0 auto' }}>
                Select a preset logic scroll from our archives, or draft your own custom script to transmute it into levels.
              </p>
            </div>

            {/* Tab Selector Header */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', justifyContent: 'center' }}>
              <button
                onClick={() => setActiveTab('presets')}
                className="btn"
                style={{
                  background: activeTab === 'presets' ? 'rgba(13, 148, 136, 0.15)' : 'transparent',
                  border: `1px solid ${activeTab === 'presets' ? '#0d9488' : 'transparent'}`,
                  color: activeTab === 'presets' ? '#fff' : '#9ca3af',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '30px'
                }}
              >
                <Scroll size={14} style={{ marginRight: '0.4rem', color: '#0d9488' }} />
                Rune Scroll Presets
              </button>
              
              <button
                onClick={() => setActiveTab('custom')}
                className="btn"
                style={{
                  background: activeTab === 'custom' ? 'rgba(234, 179, 8, 0.15)' : 'transparent',
                  border: `1px solid ${activeTab === 'custom' ? '#eab308' : 'transparent'}`,
                  color: activeTab === 'custom' ? '#fff' : '#9ca3af',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '30px'
                }}
              >
                <Terminal size={14} style={{ marginRight: '0.4rem', color: '#eab308' }} />
                Custom Spellcaster
              </button>
            </div>

            {error && (
              <div className="custom-alert custom-alert-error" style={{ width: '100%' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Transmutation Failed</h4>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Tab Contents */}
            <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
              
              {activeTab === 'presets' ? (
                /* Presets Tab View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Scroll size={18} style={{ color: '#0d9488' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Archive scrolls presets</h3>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1, maxHeight: '420px', paddingRight: '0.25rem' }}>
                    {CODE_EXAMPLES.map((example) => {
                      const isSelected = selectedSnippet?.id === example.id;
                      return (
                        <div
                          key={example.id}
                          className={`snippet-card ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedSnippet(example)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase' }}>
                              {example.language}
                            </span>
                            <span className={`difficulty-badge diff-${example.difficulty}`}>
                              {example.difficulty}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.25rem' }}>{example.title}</h4>
                          <p style={{ fontSize: '0.72rem', color: '#9ca3af', lineHeight: 1.4 }}>
                            {example.initialDescription}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Custom Tab View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Terminal size={18} style={{ color: '#eab308' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Draft custom spell</h3>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase' }}>
                      Incantation Language
                    </label>
                    <select
                      className="select-input"
                      value={customLanguage}
                      onChange={(e) => setCustomLanguage(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="javascript">JavaScript / TypeScript</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="sql">SQL Query</option>
                      <option value="java">Java</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', flex: 1 }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase' }}>
                      Rune Block (Code)
                    </label>
                    <textarea
                      className="input-area"
                      placeholder={`// Paste your script code here\n\nfunction playQuest() {\n  ...\n}`}
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      style={{ height: '240px', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Transmute Button */}
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button 
                className="btn btn-primary"
                onClick={handleInitiateSpell}
                style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', width: '100%' }}
              >
                <Sparkles size={18} />
                Initiate Transmutation Spell 🔮
              </button>
            </div>

            {/* Branding Footer */}
            <div style={{
              marginTop: '1.5rem',
              fontSize: '0.72rem',
              color: '#6b7280',
              textAlign: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: '0.88rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.4rem',
              letterSpacing: '0.03em'
            }}>
              <span>Made by <strong style={{ color: '#0d9488' }}>Corestar</strong></span>
              <span style={{ color: '#374151' }}>•</span>
              <span>Owned by <strong style={{ color: '#eab308' }}>Hruddayansh</strong></span>
            </div>
            
          </div>
        )}


        {page === 'analysis' && (
          /* PAGE 2: FULLPAGE ANALYSIS ANIMATION */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2.5rem', maxWidth: '600px', margin: '0 auto' }}>
            
            {/* Spinning Sigil */}
            <div style={{ position: 'relative' }}>
              <div className="magic-ring" style={{ width: '110px', height: '110px', borderWidth: '4px' }}></div>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '2.5rem',
                animation: 'float-sphere 2s ease-in-out infinite'
              }}>
                🔮
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '100%' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Deciphering Logical Runes</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                Analyzing compile parameters and drafting educational storyline...
              </p>
            </div>

            {/* Stepper Grid Checklist */}
            <div className="glass-panel" style={{ width: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {LOADING_STEPS.map((step, idx) => {
                const isActive = analysisProgress >= step.minProgress && (idx === LOADING_STEPS.length - 1 || analysisProgress < LOADING_STEPS[idx + 1].minProgress);
                const isCleared = analysisProgress >= (idx === LOADING_STEPS.length - 1 ? 100 : LOADING_STEPS[idx + 1].minProgress);
                
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      opacity: isCleared || isActive ? 1 : 0.35,
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: isCleared ? 'rgba(16, 185, 129, 0.15)' : isActive ? 'rgba(13, 148, 136, 0.15)' : 'transparent',
                        border: `1.5px solid ${isCleared ? '#10b981' : isActive ? '#0d9488' : 'rgba(255,255,255,0.1)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        color: isCleared ? '#10b981' : '#0d9488',
                        fontWeight: 700
                      }}>
                        {isCleared ? '✓' : idx + 1}
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#fff' : '#d1d5db' }}>
                        {step.name}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.72rem', color: isCleared ? '#10b981' : isActive ? '#0d9488' : '#6b7280', fontWeight: 600 }}>
                      {isCleared ? "Completed" : isActive ? "Transmuting..." : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Simulated Progress Bar */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>
                <span>TRANSMUTATION STRENGTH</span>
                <span style={{ color: '#eab308' }}>{analysisProgress}%</span>
              </div>
              <div className="mana-bar-container" style={{ height: '8px' }}>
                <div className="mana-bar-fill" style={{ width: `${analysisProgress}%` }}></div>
              </div>
              
              {analysisProgress === 98 && (
                <span style={{ fontSize: '0.68rem', color: '#fb7185', textAlign: 'center', fontStyle: 'italic', marginTop: '0.2rem' }}>
                  Weaving final quest challenges... Please hold your incantation.
                </span>
              )}
            </div>

          </div>
        )}

        {page === 'workspace' && story && (
          /* PAGE 3: RESULT LEVELS WORKSPACE */
          <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
            <StoryRealm story={story} fullCode={activeCodeText} onExit={() => setPage('input')} />
          </div>
        )}

      </main>
    </div>
  );
};
