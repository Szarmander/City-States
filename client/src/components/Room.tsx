import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import usePartySocket from 'partysocket/react'
import { AnimatePresence, motion } from 'framer-motion'
import { GameState, ClientMessage } from '../types'

import { Lobby } from './Lobby'
import { Playing } from './Playing'
import { Scoring } from './Scoring'
import { Finished } from './Finished'
import { Roulette } from './Roulette'
import { MusicContext } from '../App'

const pageVariants = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -50, scale: 0.95 }
};

const pageTransition: any = {
  type: "spring",
  stiffness: 300,
  damping: 25
};

export function Room() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const name = localStorage.getItem('playerName') || 'Guest'
  const [state, setState] = useState<GameState | null>(null)
  
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  const socket = usePartySocket({
    host: import.meta.env.VITE_PARTYKIT_HOST || 'localhost:1999', 
    room: roomId!,
    onMessage: (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'state_update') {
        setState(msg.state)
      } else if (msg.type === 'error') {
        alert(msg.message)
        navigate('/')
      }
    },
    onOpen: () => {
      const avatar = localStorage.getItem('playerAvatar') || 'cat.jpg'
      socket.send(JSON.stringify({ type: 'join', name, avatar } as ClientMessage))
    }
  })

  const { setTrack } = useContext(MusicContext)

  useEffect(() => {
    if (state?.status === 'playing' && state.roundTimer) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((state.roundTimer! - Date.now()) / 1000))
        setTimeLeft(remaining)
        if (remaining === 0) clearInterval(interval)
      }, 200)
      return () => clearInterval(interval)
    } else {
      setTimeLeft(null)
    }
  }, [state?.roundTimer, state?.status])

  useEffect(() => {
    if (state?.status === 'roulette') {
      setAnswers({})
      setTrack('playing')
    } else if (state?.status === 'lobby' || state?.status === 'scoring' || state?.status === 'finished') {
      setTrack('lobby')
    }
  }, [state?.status, setTrack])

  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 10 && timeLeft > 0) {
      setTrack('danger')
    }
  }, [timeLeft, setTrack])

  if (!state) return <div className="loading-screen">Connecting to room...</div>

  const amAdmin = state.adminId === socket.id
  const me = socket.id ? state.players[socket.id] : null

  const startGame = () => {
    socket.send(JSON.stringify({ type: 'start_game' } as ClientMessage))
  }

  const nextRound = () => {
    socket.send(JSON.stringify({ type: 'next_round' } as ClientMessage))
  }

  const handleAnswerChange = (category: string, val: string) => {
    // Only allow typing if the first letter matches currentLetter
    if (val.length > 0) {
      const firstChar = val.charAt(0).toLowerCase();
      const targetChar = state.currentLetter.toLowerCase();
      // Allow it if it matches, otherwise discard change
      if (firstChar !== targetChar) {
        return;
      }
    }
    const newAnswers = { ...answers, [category]: val }
    setAnswers(newAnswers)
    socket.send(JSON.stringify({ type: 'submit_answers', answers: newAnswers } as ClientMessage))
  }

  const stopRound = () => {
    socket.send(JSON.stringify({ type: 'stop_round' } as ClientMessage))
  }

  const proposeCategory = (cat: string) => {
    socket.send(JSON.stringify({ type: 'propose_category', category: cat } as ClientMessage))
  }

  const handleProposal = (cat: string, accept: boolean) => {
    socket.send(JSON.stringify({ type: 'handle_proposal', category: cat, accept } as ClientMessage))
  }

  const addCategory = (cat: string) => {
    socket.send(JSON.stringify({ type: 'add_category', category: cat } as ClientMessage))
  }

  const removeCategory = (cat: string) => {
    socket.send(JSON.stringify({ type: 'remove_category', category: cat } as ClientMessage))
  }

  const setMaxRounds = (max: number) => {
    socket.send(JSON.stringify({ type: 'set_max_rounds', maxRounds: max } as ClientMessage))
  }

  return (
    <div className="room-container">
      <AnimatePresence mode="wait">
        {state.status === 'lobby' && (
          <motion.div key="lobby" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            <Lobby 
              state={state} 
              amAdmin={amAdmin} 
              me={me} 
              roomId={roomId!} 
              onStart={startGame} 
              onPropose={proposeCategory}
              onHandleProposal={handleProposal}
              onAddCategory={addCategory}
              onRemoveCategory={removeCategory}
              onSetMaxRounds={setMaxRounds}
              onToggleReady={() => socket.send(JSON.stringify({ type: 'toggle_ready' } as ClientMessage))}
            />
          </motion.div>
        )}
        
        {state.status === 'roulette' && (
          <motion.div key="roulette" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            <Roulette targetLetter={state.currentLetter} />
          </motion.div>
        )}
        
        {state.status === 'playing' && (
          <motion.div key="playing" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            <Playing 
              state={state} 
              me={me} 
              timeLeft={timeLeft} 
              answers={answers} 
              onAnswerChange={handleAnswerChange} 
              onStop={stopRound} 
            />
          </motion.div>
        )}

        {state.status === 'scoring' && (
          <motion.div key="scoring" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            <Scoring 
              state={state} 
              amAdmin={amAdmin} 
              meId={me?.id}
              onNextRound={nextRound} 
              onReport={(playerId, category) => socket.send(JSON.stringify({ type: 'report_answer', playerId, category } as ClientMessage))}
              onInvalidate={(playerId, category) => socket.send(JSON.stringify({ type: 'invalidate_answer', playerId, category } as ClientMessage))}
            />
          </motion.div>
        )}

        {state.status === 'finished' && (
          <motion.div key="finished" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            <Finished 
              state={state} 
              amAdmin={amAdmin} 
              onRestart={startGame} 
              onQuit={() => navigate('/')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
