import { GameState } from '../types'

interface FinishedProps {
  state: GameState;
  amAdmin: boolean;
  onRestart: () => void;
}

export function Finished({ state, amAdmin, onRestart }: FinishedProps) {
  const sortedPlayers = Object.values(state.players).sort((a,b) => b.score - a.score);

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
            <div className="place-score">{p.score} pts</div>
          </div>
        ))}
      </div>

      <div className="finished-actions">
        {amAdmin ? (
          <button className="btn btn-primary btn-large" onClick={onRestart}>Play Again</button>
        ) : (
          <div className="waiting-text">Waiting for admin to restart...</div>
        )}
      </div>
    </div>
  )
}
