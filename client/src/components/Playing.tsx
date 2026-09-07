import { GameState, Player } from '../types'

interface PlayingProps {
  state: GameState;
  me: Player | null;
  timeLeft: number | null;
  answers: Record<string, string>;
  onAnswerChange: (category: string, val: string) => void;
  onStop: () => void;
}

export function Playing({ state, me, timeLeft, answers, onAnswerChange, onStop }: PlayingProps) {
  return (
    <div className="playing-layout">
      {/* SIDEBAR */}
      <div className="card panel-card playing-sidebar">
        <h3>Players</h3>
        <div className="sidebar-players">
          {Object.values(state.players).map(p => (
            <div key={p.id} className={`sidebar-player-pill ${p.hasStopped ? 'stopped' : ''}`}>
              <div className="avatar-circle small-avatar">
                {p.avatar ? (
                  <img src={`/avatars/${p.avatar}`} alt="avatar" className="avatar-img" />
                ) : (
                  p.name.substring(0,2).toUpperCase()
                )}
              </div>
              <span className="player-name">{p.name}</span>
              <span className="player-status-icon">{p.hasStopped ? '✅' : '⏳'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN GAME AREA */}
      <div className="card panel-card playing-card">
        <div className="playing-header">
          <div className="letter-display">
            <span>Letter:</span>
            <div className="big-letter">{state.currentLetter}</div>
          </div>
          
          {timeLeft !== null && (
            <div className="timer-display blink">
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        <div className="categories-inputs">
          {state.categories.map(cat => (
            <div key={cat} className="category-input-group">
              <label>{cat}</label>
              <input 
                className="main-input game-input"
                value={answers[cat] || ''} 
                onChange={e => onAnswerChange(cat, e.target.value)}
                disabled={me?.hasStopped || (timeLeft !== null && timeLeft <= 0)}
                placeholder="..."
              />
            </div>
          ))}
        </div>

        <div className="playing-actions">
          <button 
            className={`btn btn-large ${me?.hasStopped ? 'btn-disabled' : 'btn-danger'}`}
            onClick={onStop} 
            disabled={me?.hasStopped}
          >
            {me?.hasStopped ? 'Waiting for others...' : 'STOP!'}
          </button>
        </div>
      </div>
    </div>
  )
}
