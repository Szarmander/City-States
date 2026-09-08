import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, createContext } from 'react'
import { Home } from './components/Home/Home'
import { Room } from './components/Room/Room'
import { AudioPlayer } from './components/AudioPlayer/AudioPlayer'
import { Language, translations, getInitialLanguage } from './i18n'
import './App.css'

export const MusicContext = createContext({
  setTrack: (_track: 'lobby' | 'playing' | 'danger' | 'none') => {}
});

export const LanguageContext = createContext({
  lang: 'en' as Language,
  t: translations.en,
  setLang: (_lang: Language) => {}
});

function App() {
  const [musicPlaying, setMusicPlaying] = useState(true)
  const [currentTrack, setCurrentTrack] = useState<'lobby' | 'playing' | 'danger' | 'none'>('lobby')
  
  const [lang, setLangState] = useState<Language>(getInitialLanguage())
  const t = translations[lang]

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('language', newLang)
  }

  const toggleMusic = () => {
    setMusicPlaying(!musicPlaying)
  }

  return (
    <MusicContext.Provider value={{ setTrack: setCurrentTrack }}>
      <LanguageContext.Provider value={{ lang, t, setLang }}>
        <BrowserRouter>
          <div className="app-container">
            
            <AudioPlayer currentTrack={currentTrack} musicPlaying={musicPlaying} />
            
            <header className="app-header">
              <h1 className="main-title">Państwa-Miasta</h1>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary btn-small" 
                  onClick={() => setLang(lang === 'en' ? 'pl' : 'en')}
                >
                  {lang === 'en' ? '🇵🇱 PL' : '🇬🇧 EN'}
                </button>
                <button 
                  className="btn btn-secondary btn-small" 
                  onClick={toggleMusic}
                >
                  {musicPlaying ? '🔊' : '🔈'}
                </button>
              </div>
            </header>

            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/room/:roomId" element={<Room />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </LanguageContext.Provider>
    </MusicContext.Provider>
  )
}

export default App
