import React, { useState } from 'react';
import TrackList from './components/Track'
import PlayerControls from './components/Player.js'
import { MusicContext } from "./contexts/MusicContext";
import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import './styles/app.css';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: "gs://cedar-streaming.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

function App() {
  
  const storage = getStorage(app);
  const songRef = ref(storage);
  const [state, setState] = useState({
    audioPlayer: new Audio(),
    tracks: [],
    currentTrackIndex: null,
    isPlaying: false
  })
  
  const fetchSongs = async () => {
    try {
      const songsList = await listAll(songRef);

      const songsData = await Promise.all(
        songsList.items.map(async (item) => {
          try {
            const title = item.name;
            const url = await getDownloadURL(item);
            return { title, url };
          } catch (urlError) {
            throw urlError; 
          }
        })
      );
    setState((prev) => ({ ...prev, tracks: songsData }));
  } catch (fetchError) {
    console.error('Error fetching songs:', fetchError);
  }
};

  fetchSongs();


  return (
    <MusicContext.Provider value={[state, setState]}>
      <div className='App'>
        <header>
              {/* <img src="logo.png" alt="CEDAR LEAVES" /> */}
              <h1>CEDAR LEAVES</h1>
        </header>
        <main>
          <TrackList />
          {state.currentTrackIndex !== null && <PlayerControls />}
        </main>
      </div>
    </MusicContext.Provider>
  );
}

export default App;

     
