import React, { useState } from 'react';
import { CodeSnippet } from '../types';
import { CODE_EXAMPLES } from '../utils/examples';
import { BookOpen, Code2, Plus, Play, Sparkles } from 'lucide-react';

interface CodeLibraryProps {
  selectedSnippet: CodeSnippet | null;
  onSelectSnippet: (snippet: CodeSnippet | null) => void;
  customCode: string;
  setCustomCode: (code: string) => void;
  customLanguage: string;
  setCustomLanguage: (lang: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const CodeLibrary: React.FC<CodeLibraryProps> = ({
  selectedSnippet,
  onSelectSnippet,
  customCode,
  setCustomCode,
  customLanguage,
  setCustomLanguage,
  onGenerate,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');

  const handleSelectPreset = (snippet: CodeSnippet) => {
    onSelectSnippet(snippet);
    setCustomCode(''); // Reset custom code
  };

  const handleSelectCustomTab = () => {
    setActiveTab('custom');
    onSelectSnippet(null); // Deselect preset
  };

  const handleSelectPresetTab = () => {
    setActiveTab('preset');
    if (CODE_EXAMPLES.length > 0 && !selectedSnippet) {
      handleSelectPreset(CODE_EXAMPLES[0]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Tab Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          className={`btn ${activeTab === 'preset' ? 'btn-secondary btn-outline-teal' : 'btn-secondary'}`}
          onClick={handleSelectPresetTab}
          style={{
            padding: '0.5rem',
            fontSize: '0.8rem',
            border: 'none',
            background: activeTab === 'preset' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
            color: activeTab === 'preset' ? '#0d9488' : '#9ca3af'
          }}
        >
          <BookOpen size={14} style={{ marginRight: '4px' }} />
          Library Snips
        </button>

        <button
          className={`btn ${activeTab === 'custom' ? 'btn-secondary btn-outline-gold' : 'btn-secondary'}`}
          onClick={handleSelectCustomTab}
          style={{
            padding: '0.5rem',
            fontSize: '0.8rem',
            border: 'none',
            background: activeTab === 'custom' ? 'rgba(234, 179, 8, 0.1)' : 'transparent',
            color: activeTab === 'custom' ? '#eab308' : '#9ca3af'
          }}
        >
          <Plus size={14} style={{ marginRight: '4px' }} />
          Custom Scroll
        </button>
      </div>

      {activeTab === 'preset' ? (
        /* PRESET LIBRARY */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {CODE_EXAMPLES.map((example) => {
            const isActive = selectedSnippet?.id === example.id;
            return (
              <div
                key={example.id}
                className={`snippet-card ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectPreset(example)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0d9488', textTransform: 'uppercase' }}>
                    {example.language}
                  </span>
                  <span className={`difficulty-badge diff-${example.difficulty}`}>
                    {example.difficulty}
                  </span>
                </div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: isActive ? '#f3f4f6' : '#d1d5db' }}>
                  {example.title}
                </h5>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.4 }}>
                  {example.initialDescription}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        /* CUSTOM CODE INPUT */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0d9488', textTransform: 'uppercase' }}>
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
              <option value="sql">SQL Database Query</option>
              <option value="htmlcss">HTML / CSS</option>
              <option value="java">Java</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0d9488', textTransform: 'uppercase' }}>
              Paste Your Spell (Code)
            </label>
            <textarea
              className="input-area"
              rows={8}
              placeholder={`// Paste your code here to turn it into lore...\n\nfunction calculateTreasure() {\n  ...\n}`}
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        className="btn btn-primary"
        onClick={onGenerate}
        disabled={isLoading || (activeTab === 'custom' && !customCode.trim())}
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        {isLoading ? (
          <>
            <span className="magic-ring" style={{ width: '16px', height: '16px', borderWidth: '2px', marginRight: '8px' }}></span>
            Conjuring Lore...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Transmute Code to Lore
          </>
        )}
      </button>

      {/* Display Code Preview for Presets */}
      {activeTab === 'preset' && selectedSnippet && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Code2 size={14} style={{ color: '#0d9488' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af' }}>Code runes preview</span>
          </div>
          <div
            className="code-container"
            style={{
              maxHeight: '180px',
              fontSize: '0.75rem',
              padding: '0.75rem',
              border: '1px solid rgba(255,255,255,0.05)',
              background: '#04030a',
              borderRadius: '8px'
            }}
          >
            <pre style={{ margin: 0, overflow: 'auto' }}>
              <code>{selectedSnippet.code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
