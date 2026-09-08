import './Scoring.css';
import { useContext } from 'react'
import { GameState } from '../../types'
import { LanguageContext } from '../../App'
import { translateCategory } from '../../i18n'

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
  const { t, lang } = useContext(LanguageContext);

  return (
    <div className="card panel-card scoring-card">
      <div className="panel-header text-center">
        <h2>{t.round} {state.roundNumber} {t.roundOver.replace('Runda ', '').replace('Round ', '')}</h2>
        <div className="round-letter">{t.letter} <strong>{state.currentLetter}</strong></div>
      </div>

      <div className="table-container">
        <table className="scoring-table">
          <thead>
            <tr>
              <th>{t.player}</th>
              {state.categories.map(c => (
                <th key={c}>{translateCategory(c, lang)}</th>
              ))}
              <th className="score-col">{t.total}</th>
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', minHeight: '24px' }}>
                        <span>
                          {p.answers[c]?.trim() || '-'}
                          {valid && <span className="pts-tag" style={{ marginLeft: '0.5rem' }}>+{pts}</span>}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {valid && !amAdmin && !isReported && p.id !== meId && (
                            <button className="icon-btn report-btn" onClick={() => onReport(p.id, c)} title="Report this answer" style={{ color: 'var(--text-main)', opacity: 0.5 }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                            </button>
                          )}
                          {valid && isReported && (
                            <span className="icon-status" title="Reported" style={{ color: '#ff9800', display: 'flex' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                            </span>
                          )}
                          {valid && amAdmin && (
                            <button className="icon-btn delete-btn" onClick={() => onInvalidate(p.id, c)} title="Invalidate this answer" style={{ color: 'var(--danger)' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            </button>
                          )}
                        </div>
                      </div>
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
            {state.roundNumber >= state.maxRounds ? t.finishGame : t.nextRound}
          </button>
        ) : (
          <div className="waiting-text">{t.waitingForAdmin}</div>
        )}
      </div>
    </div>
  )
}
