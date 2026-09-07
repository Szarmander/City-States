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
}

export function Lobby({ state, amAdmin, roomId, onStart, onPropose, onHandleProposal, onAddCategory, onRemoveCategory, onSetMaxRounds }: LobbyProps) {
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

  return (
    <div className="card panel-card">
      <div className="panel-header">
        <h2>Room Code: <span className="highlight-text">{roomId}</span></h2>
        <div className="round-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Round: {state.roundNumber}/
          {amAdmin ? (
            <input 
              type="number" 
              value={state.maxRounds} 
              onChange={e => onSetMaxRounds(parseInt(e.target.value) || 1)}
              style={{ width: '50px', borderRadius: '8px', border: 'none', padding: '0.2rem', fontWeight: 'bold', textAlign: 'center' }}
              min="1"
              max="20"
            />
          ) : (
            state.maxRounds
          )}
        </div>
      </div>

      <div className="lobby-content">
        <div className="players-section">
          <h3>Players ({Object.keys(state.players).length})</h3>
          <ul className="player-grid">
            {Object.values(state.players).map(p => (
              <li key={p.id} className="player-avatar">
                <div className="avatar-circle">
                  {p.avatar ? (
                    <img src={`/avatars/${p.avatar}`} alt="avatar" className="avatar-img" />
                  ) : (
                    p.name.substring(0,2).toUpperCase()
                  )}
                </div>
                <span className="player-name">{p.name}</span>
                {p.id === state.adminId && <span className="badge badge-admin">Admin</span>}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="categories-section">
          <h3>Categories</h3>
          <div className="category-tags">
            {state.categories.map(c => (
              <span key={c} className="badge badge-category">
                {c}
                {amAdmin && <button className="remove-cat-btn" onClick={() => onRemoveCategory(c)}>x</button>}
              </span>
            ))}
          </div>

          <div className="category-input-row" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              className="main-input" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '1rem', flex: 1, marginBottom: 0 }}
              placeholder={amAdmin ? "Add category..." : "Suggest category..."} 
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddOrPropose()}
            />
            <button className="btn btn-secondary btn-small" onClick={handleAddOrPropose}>
              {amAdmin ? 'ADD' : 'SUGGEST'}
            </button>
          </div>

          {state.proposedCategories.length > 0 && (
            <div className="proposed-categories" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f4ff', borderRadius: '12px', border: '2px dashed var(--border-color)' }}>
              <h4>Proposed by players:</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {state.proposedCategories.map(c => (
                  <li key={c} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>{c}</span>
                    {amAdmin ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-success btn-small" onClick={() => onHandleProposal(c, true)}>✓</button>
                        <button className="btn btn-danger btn-small" onClick={() => onHandleProposal(c, false)}>✕</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>Pending admin approval</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="lobby-actions">
        {amAdmin ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className={`btn btn-large ${Object.keys(state.players).length < 2 ? 'btn-disabled' : 'btn-primary'}`} 
              onClick={onStart}
              disabled={Object.keys(state.players).length < 2}
            >
              START GAME!
            </button>
            {Object.keys(state.players).length < 2 && (
              <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Need at least 2 players to start!</span>
            )}
          </div>
        ) : (
          <div className="waiting-text">Waiting for the admin to start...</div>
        )}
      </div>
    </div>
  )
}
