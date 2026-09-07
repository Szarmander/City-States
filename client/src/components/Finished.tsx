import { GameState } from '../types'

interface FinishedProps {
  state: GameState;
  amAdmin: boolean;
  onRestart: () => void;
  onQuit: () => void;
}

export function Finished({ state, amAdmin, onRestart, onQuit }: FinishedProps) {
  const sortedPlayers = Object.values(state.players).sort((a,b) => (b.score + b.roundScore) - (a.score + a.roundScore));

  return (
    <div className="card panel-card finished-card">
      <div className="panel-header text-center">
        <h2 className="title">Game Finished!</h2>
        <p>Final Standings</p>
      </div>

      <div className="podium">
        {sortedPlayers.map((p, i) => (
          <div key={p.id} className={`podium-place place-${i+1}`}>
            <div className="place-medal">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}th`}
            </div>
            <div className="avatar-circle small-avatar" style={{ margin: '0 1rem' }}>
              {p.avatar ? (
                <img src={`/avatars/${p.avatar}`} alt="avatar" className="avatar-img" />
              ) : (
                p.name.substring(0,2).toUpperCase()
              )}
            </div>
            <div className="place-name">{p.name}</div>
            <div className="place-score">{p.score + (p.roundScore || 0)} pts</div>
          </div>
        ))}
      </div>

      <div className="finished-actions">
        {amAdmin ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary btn-large" onClick={onRestart}>Play Again</button>
            <button className="btn btn-danger btn-large" onClick={onQuit}>Quit</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <div className="waiting-text">Waiting for admin to restart...</div>
            <button className="btn btn-danger" onClick={onQuit}>Quit</button>
          </div>
        )}
      </div>
    </div>
  )
}
