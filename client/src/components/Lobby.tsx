import { useState } from 'react'
import { GameState, Player } from '../types'

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

  const handleAddOrPropose = () => {
    if (!newCat.trim()) return;
    if (amAdmin) {
      onAddCategory(newCat.trim());
    } else {
      onPropose(newCat.trim());
    }
    setNewCat('');
  }

  const nonAdminPlayers = Object.values(state.players).filter(p => p.id !== state.adminId);
  const allReady = nonAdminPlayers.length === 0 || nonAdminPlayers.every(p => p.isReady);
  const notEnoughPlayers = Object.keys(state.players).length < 2;

  return (
    <div className="card panel-card">
      <div className="panel-header">
        <h2>Room Code: <span className="highlight-text">{roomId}</span></h2>
        <div className="round-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Round: {state.roundNumber} /
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
          <h3>Players in Room</h3>
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
                  {isAdmin && <span className="badge badge-admin">Admin</span>}
                </li>
              )
            })}
          </ul>
        </div>
        
        <div className="categories-section">
          <h3>Categories for this game:</h3>
          <div className="category-tags">
            {state.categories.map(c => (
              <span key={c} className="badge badge-category">
                {c}
                {amAdmin && <button className="remove-cat-btn" onClick={() => onRemoveCategory(c)}>x</button>}
              </span>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input 
              className="main-input" 
              placeholder="Custom category..." 
              value={newCat} 
              onChange={e => setNewCat(e.target.value)} 
              style={{ maxWidth: '250px' }}
              onKeyDown={e => e.key === 'Enter' && handleAddOrPropose()}
            />
            <button className="btn btn-secondary" onClick={handleAddOrPropose}>
              {amAdmin ? 'Add' : 'Suggest'}
            </button>
          </div>

          {amAdmin && state.proposedCategories.length > 0 && (
            <div style={{ marginTop: '1.5rem', background: '#fff', padding: '1rem', borderRadius: '12px', border: '2px dashed var(--border-color)' }}>
              <h4>Suggestions from players:</h4>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {state.proposedCategories.map(c => (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0f4ff', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    <strong>{c}</strong>
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
            {me?.isReady ? "I'm Ready!" : "Click when Ready"}
          </button>
        )}

        {amAdmin ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className={`btn btn-large ${notEnoughPlayers || !allReady ? 'btn-disabled' : 'btn-primary'}`} 
              onClick={onStart}
              disabled={notEnoughPlayers || !allReady}
            >
              START GAME!
            </button>
            {notEnoughPlayers ? (
              <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Need at least 2 players to start!</span>
            ) : !allReady ? (
              <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Waiting for all players to be ready!</span>
            ) : null}
          </div>
        ) : (
          <div className="waiting-text">Waiting for the admin to start...</div>
        )}
      </div>
    </div>
  )
}
