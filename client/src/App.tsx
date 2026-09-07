import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, createContext } from 'react'
import { Home } from './components/Home'
import { Room } from './components/Room'
import { AudioPlayer } from './components/AudioPlayer'
import './App.css'

export const MusicContext = createContext({
  setTrack: (_track: 'lobby' | 'playing' | 'danger' | 'none') => {}
});

function App() {
  const [musicPlaying, setMusicPlaying] = useState(true)
  const [currentTrack, setCurrentTrack] = useState<'lobby' | 'playing' | 'danger' | 'none'>('lobby')

  const toggleMusic = () => {
    setMusicPlaying(!musicPlaying)
  }

  return (
    <MusicContext.Provider value={{ setTrack: setCurrentTrack }}>
      <BrowserRouter>
        <div className="app-container">
          
          <AudioPlayer currentTrack={currentTrack} musicPlaying={musicPlaying} />
          
          <header className="app-header">
            <h1 className="main-title">CITY-STATES</h1>
            <button 
              className="btn btn-secondary btn-small" 
              onClick={toggleMusic}
              style={{ position: 'absolute', top: '1rem', right: '1rem' }}
            >
              {musicPlaying ? '🔊 Music ON' : '🔈 Music OFF'}
            </button>
          </header>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/room/:roomId" element={<Room />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </MusicContext.Provider>
  )
}

export default App
