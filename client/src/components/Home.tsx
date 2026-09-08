import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MusicContext, LanguageContext } from '../App'

const AVATARS = [
  'cat.jpg', 'duck.jpg', 'frog.jpg', 'bear.jpg', 'cow.jpg', 
  'dog.jpg', 'elephant.jpg', 'giraffe.jpg', 'horse.jpg', 
  'lion.jpg', 'monkey.jpg', 'penguin.jpg', 'pig.jpg', 
  'rabbit.jpg', 'sheep.jpg'
]

export function Home() {
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [avatarIndex, setAvatarIndex] = useState(0)
  const navigate = useNavigate()
  const { setTrack } = useContext(MusicContext)
  const { t } = useContext(LanguageContext)

  useEffect(() => {
    setTrack('lobby')
  }, [setTrack])

  const createRoom = () => {
    if (!name.trim()) return alert(t.enterName)
    localStorage.setItem('playerName', name)
    localStorage.setItem('playerAvatar', AVATARS[avatarIndex])
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    navigate(`/room/${newRoomId}`)
  }

  const joinRoom = () => {
    if (!name.trim()) return alert(t.enterName)
    if (!roomCode.trim()) return alert(t.enterCode)
    localStorage.setItem('playerName', name)
    localStorage.setItem('playerAvatar', AVATARS[avatarIndex])
    navigate(`/room/${roomCode.toUpperCase()}`)
  }

  const nextAvatar = () => setAvatarIndex((i) => (i + 1) % AVATARS.length)
  const prevAvatar = () => setAvatarIndex((i) => (i - 1 + AVATARS.length) % AVATARS.length)

  return (
    <div className="card panel-card flex-col">
      <div className="avatar-selector">
        <button className="btn btn-secondary btn-small" onClick={prevAvatar} style={{ padding: '0.5rem 1rem' }}>◀</button>
        <div className="avatar-bubble">
          <img src={`/avatars/${AVATARS[avatarIndex]}`} alt="avatar" style={{ userSelect: 'none', pointerEvents: 'none' }} />
        </div>
        <button className="btn btn-secondary btn-small" onClick={nextAvatar} style={{ padding: '0.5rem 1rem' }}>▶</button>
      </div>

      <input 
        className="main-input" 
        placeholder={t.enterName}
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={15}
      />
      
      <div className="action-box">
        <h3>{t.createGame}</h3>
        <button className="btn btn-primary btn-large" onClick={createRoom}>{t.createRoom}</button>
      </div>
      
      <div className="divider">{t.or}</div>

      <div className="action-box">
        <h3>{t.joinGame}</h3>
        <div className="join-group">
          <input 
            className="main-input code-input" 
            placeholder={t.codePlaceholder} 
            value={roomCode}
            onChange={e => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button className="btn btn-primary" onClick={joinRoom}>{t.join}</button>
        </div>
      </div>
    </div>
  )
}
