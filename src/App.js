import { createContext, useState } from 'react';
import TrackList from './components/Track'
import PlayerControls from './components/Player.js'

import tracks from './data/tracks.js'

import { MusicContext } from "./contexts/MusicContext";

// styles
import './styles/app.css';

function App() {

  const [state, setState] = useState({
    audioPlayer: new Audio(),
    tracks: tracks,
    currentTrackIndex: null,
    isPlaying: false
  })
  
  return (
    <MusicContext.Provider value={[state, setState]}>
      <div className='App'>
        <header>
              {/* <img src="logo.png" alt="CEDAR LEAVES" /> */}
              <h1>CEDAR LEAVES</h1>
        </header>
        <main>
          <TrackList />
          <PlayerControls />
        </main>
      </div>
    </MusicContext.Provider>
  );
}

export default App;

     
