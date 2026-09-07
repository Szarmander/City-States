import { GameState } from '../types'

interface ScoringProps {
  state: GameState;
  amAdmin: boolean;
  onNextRound: () => void;
}

export function Scoring({ state, amAdmin, onNextRound }: ScoringProps) {
  const sortedPlayers = Object.values(state.players).sort((a,b) => b.score - a.score);

  return (
    <div className="card panel-card scoring-card">
      <div className="panel-header text-center">
        <h2>Round {state.roundNumber} Over!</h2>
        <div className="round-letter">Letter: <strong>{state.currentLetter}</strong></div>
      </div>

      <div className="table-container">
        <table className="scoring-table">
          <thead>
            <tr>
              <th>Player</th>
              {state.categories.map(c => (
                <th key={c}>{c}</th>
              ))}
              <th className="score-col">Total</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map(p => (
              <tr key={p.id}>
                <td className="player-col">
                  <strong>{p.name}</strong>
                </td>
                {state.categories.map(c => {
                  const ans = p.answers[c]?.trim().toLowerCase() || '';
                  const valid = ans && ans.startsWith(state.currentLetter.toLowerCase());
                  
                  let pts = 0;
                  if (valid) {
                    const validAnswersForCat = Object.values(state.players)
                      .map(pl => pl.answers[c]?.trim().toLowerCase() || '')
                      .filter(a => a && a.startsWith(state.currentLetter.toLowerCase()));
                    
                    if (validAnswersForCat.length === 1) pts = 15;
                    else if (validAnswersForCat.filter(a => a === ans).length === 1) pts = 10;
                    else pts = 5;
                  }

                  return (
                    <td key={c} className={valid ? 'valid-ans' : 'invalid-ans'}>
                      {p.answers[c]?.trim() || '-'}
                      {valid && <span className="pts-tag">+{pts}</span>}
                    </td>
                  )
                })}
                <td className="score-col current-score">
                  {p.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="scoring-actions">
        {amAdmin ? (
          <button className="btn btn-primary btn-large" onClick={onNextRound}>
            {state.roundNumber >= state.maxRounds ? 'Finish Game' : 'Next Round'}
          </button>
        ) : (
          <div className="waiting-text">Waiting for admin...</div>
        )}
      </div>
    </div>
  )
}
