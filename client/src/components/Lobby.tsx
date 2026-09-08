import { useState, useContext } from 'react'
import { GameState, Player } from '../types'
import { LanguageContext } from '../App'
import { translateCategory, canonicalizeCategory } from '../i18n'

interface LobbyProps {
  state: GameState;
  amAdmin: boolean;
  me: Player | null;
  roomId: string;
  onStart: () => void;
  onPropose: (cat: string) => void;
  onHandleProposal: (cat: string, accept: boolean) => void;
  onAddCategory: (cat: string) => void;
  onRemoveCategory: (cat: string) => void;
  onSetMaxRounds: (max: number) => void;
  onToggleReady: () => void;
}

export function Lobby({ state, amAdmin, me, roomId, onStart, onPropose, onHandleProposal, onAddCategory, onRemoveCategory, onSetMaxRounds, onToggleReady }: LobbyProps) {
  const [newCat, setNewCat] = useState('');
  const { t, lang } = useContext(LanguageContext);

  const handleAddOrPropose = () => {
    if (!newCat.trim()) return;
    const canonical = canonicalizeCategory(newCat.trim());
    if (amAdmin) {
      onAddCategory(canonical);
    } else {
      onPropose(canonical);
    }
    setNewCat('');
  }

  const nonAdminPlayers = Object.values(state.players).filter(p => p.id !== state.adminId);
  const allReady = nonAdminPlayers.length === 0 || nonAdminPlayers.every(p => p.isReady);
  const notEnoughPlayers = Object.keys(state.players).length < 2;

  return (
    <div className="card panel-card">
      <div className="panel-header">
        <h2>{t.roomCode}: <span className="highlight-text">{roomId}</span></h2>
        <div className="round-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {t.round}: {state.roundNumber} /
          {amAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem', borderRadius: '8px' }}>
              <button 
                onClick={() => onSetMaxRounds(Math.max(1, state.maxRounds - 1))}
                style={{ background: 'white', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-main)' }}
              >
                -
              </button>
              <span style={{ minWidth: '20px', textAlign: 'center' }}>{state.maxRounds}</span>
              <button 
                onClick={() => onSetMaxRounds(Math.min(20, state.maxRounds + 1))}
                style={{ background: 'white', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-main)' }}
              >
                +
              </button>
            </div>
          ) : (
            <span style={{ marginLeft: '0.2rem' }}>{state.maxRounds}</span>
          )}
        </div>
      </div>

      <div className="lobby-content">
        <div className="players-section">
          <h3>{t.playersInRoom}</h3>
          <ul className="player-grid">
            {Object.values(state.players).map(p => {
              const isAdmin = p.id === state.adminId;
              return (
                <li key={p.id} className="player-avatar">
                  <div className="avatar-circle">
                    {p.avatar ? (
                      <img src={`/avatars/${p.avatar}`} alt="avatar" className="avatar-img" />
                    ) : (
                      p.name.substring(0,2).toUpperCase()
                    )}
                  </div>
                  <span className="player-name">
                    {p.name} {!isAdmin && (p.isReady ? '✅' : '⏳')}
                  </span>
                  {isAdmin && <span className="badge badge-admin">{t.admin}</span>}
                </li>
              )
            })}
          </ul>
        </div>
        
        <div className="categories-section">
          <h3>{t.categoriesForGame}</h3>
          <div className="category-tags">
            {state.categories.map(c => (
              <span key={c} className="badge badge-category" style={{ display: 'flex', alignItems: 'center' }}>
                {translateCategory(c, lang)}
                {amAdmin && (
                  <button className="remove-cat-btn" onClick={() => onRemoveCategory(c)} title="Remove Category">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                )}
              </span>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input 
              className="main-input" 
              placeholder={t.customCategory} 
              value={newCat} 
              onChange={e => setNewCat(e.target.value)} 
              style={{ maxWidth: '250px' }}
              onKeyDown={e => e.key === 'Enter' && handleAddOrPropose()}
            />
            <button className="btn btn-secondary" onClick={handleAddOrPropose}>
              {amAdmin ? t.add : t.suggest}
            </button>
          </div>

          {amAdmin && state.proposedCategories.length > 0 && (
            <div style={{ marginTop: '1.5rem', background: '#fff', padding: '1rem', borderRadius: '12px', border: '2px dashed var(--border-color)' }}>
              <h4>{t.suggestions}</h4>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {state.proposedCategories.map(c => (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0f4ff', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    <strong>{translateCategory(c, lang)}</strong>
                    <button className="btn btn-success btn-small" onClick={() => onHandleProposal(c, true)}>✓</button>
                    <button className="btn btn-danger btn-small" onClick={() => onHandleProposal(c, false)}>x</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="lobby-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        {!amAdmin && (
          <button 
            className={`btn btn-large ${me?.isReady ? 'btn-success' : 'btn-secondary'}`}
            onClick={onToggleReady}
          >
            {me?.isReady ? t.imReady : t.clickWhenReady}
          </button>
        )}

        {amAdmin ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className={`btn btn-large ${notEnoughPlayers || !allReady ? 'btn-disabled' : 'btn-primary'}`} 
              onClick={onStart}
              disabled={notEnoughPlayers || !allReady}
            >
              {t.startGame}
            </button>
            {notEnoughPlayers ? (
              <span style={{ color: 'var(--danger)', fontWeight: 'bold', textAlign: 'center' }}>{t.needMorePlayers}</span>
            ) : !allReady ? (
              <span style={{ color: 'var(--danger)', fontWeight: 'bold', textAlign: 'center' }}>{t.waitingForReady}</span>
            ) : null}
          </div>
        ) : (
          <div className="waiting-text">{t.waitingForAdmin}</div>
        )}
      </div>
    </div>
  )
}
