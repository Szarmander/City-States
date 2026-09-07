import { GameState } from '../types'

interface ScoringProps {
  state: GameState;
  amAdmin: boolean;
  meId: string | undefined;
  onNextRound: () => void;
  onReport: (playerId: string, category: string) => void;
  onInvalidate: (playerId: string, category: string) => void;
}

export function Scoring({ state, amAdmin, meId, onNextRound, onReport, onInvalidate }: ScoringProps) {
  const sortedPlayers = Object.values(state.players).sort((a,b) => (b.score + b.roundScore) - (a.score + a.roundScore));

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
                  const isInvalidated = state.invalidatedAnswers?.some(i => i.playerId === p.id && i.category === c);
                  const isReported = state.reportedAnswers?.some(r => r.playerId === p.id && r.category === c);
                  
                  const valid = ans && ans.startsWith(state.currentLetter.toLowerCase()) && ans.length > 1 && !isInvalidated;
                  
                  let pts = 0;
                  if (valid) {
                    const validAnswersForCat = Object.values(state.players)
                      .filter(pl => {
                        const a = pl.answers[c]?.trim().toLowerCase() || '';
                        const inv = state.invalidatedAnswers?.some(i => i.playerId === pl.id && i.category === c);
                        return a && a.startsWith(state.currentLetter.toLowerCase()) && a.length > 1 && !inv;
                      })
                      .map(pl => pl.answers[c]?.trim().toLowerCase());
                    
                    if (validAnswersForCat.length === 1) pts = 15;
                    else if (validAnswersForCat.filter(a => a === ans).length === 1) pts = 10;
                    else pts = 5;
                  }

                  return (
                    <td key={c} className={valid ? 'valid-ans' : 'invalid-ans'}>
                      {p.answers[c]?.trim() || '-'}
                      {valid && <span className="pts-tag">+{pts}</span>}
                      {valid && !amAdmin && !isReported && p.id !== meId && (
                        <button style={{ marginLeft: '5px', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onReport(p.id, c)} title="Report this answer">🚩</button>
                      )}
                      {valid && isReported && <span style={{ marginLeft: '5px' }} title="Reported">🚩</span>}
                      {valid && amAdmin && (
                        <button style={{ marginLeft: '5px', background: 'none', border: 'none', cursor: 'pointer', color: 'red' }} onClick={() => onInvalidate(p.id, c)} title="Invalidate this answer">❌</button>
                      )}
                    </td>
                  )
                })}
                <td className="score-col current-score">
                  {p.score + (p.roundScore || 0)}
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
