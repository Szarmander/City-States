import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MusicContext } from '../App'

const AVATARS = ['cat.jpg', 'duck.jpg', 'frog.jpg']

export function Home() {
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [avatarIndex, setAvatarIndex] = useState(0)
  const navigate = useNavigate()
  const { setTrack } = useContext(MusicContext)

  useEffect(() => {
    setTrack('lobby')
  }, [setTrack])

  const createRoom = () => {
    if (!name.trim()) return alert("Enter your name")
    localStorage.setItem('playerName', name)
    localStorage.setItem('playerAvatar', AVATARS[avatarIndex])
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    navigate(`/room/${newRoomId}`)
  }

  const joinRoom = () => {
    if (!name.trim()) return alert("Enter your name")
    if (!roomCode.trim()) return alert("Enter room code")
    localStorage.setItem('playerName', name)
    localStorage.setItem('playerAvatar', AVATARS[avatarIndex])
    navigate(`/room/${roomCode.toUpperCase()}`)
  }

  const nextAvatar = () => setAvatarIndex((i) => (i + 1) % AVATARS.length)
  const prevAvatar = () => setAvatarIndex((i) => (i - 1 + AVATARS.length) % AVATARS.length)

  return (
    <div className="card panel-card flex-col">
      <div className="avatar-selector">
        <button className="btn btn-secondary btn-small" onClick={prevAvatar}>◀</button>
        <div className="avatar-bubble">
          <img src={`/avatars/${AVATARS[avatarIndex]}`} alt="avatar" />
        </div>
        <button className="btn btn-secondary btn-small" onClick={nextAvatar}>▶</button>
      </div>

      <input 
        className="main-input" 
        placeholder="Your Name" 
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={15}
      />
      
      <div className="action-box">
        <h3>Create a new game</h3>
        <button className="btn btn-primary btn-large" onClick={createRoom}>CREATE ROOM</button>
      </div>
      
      <div className="divider">OR</div>

      <div className="action-box">
        <h3>Join a game</h3>
        <div className="join-group">
          <input 
            className="main-input code-input" 
            placeholder="CODE" 
            value={roomCode}
            onChange={e => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button className="btn btn-primary" onClick={joinRoom}>JOIN</button>
        </div>
      </div>
    </div>
  )
}
