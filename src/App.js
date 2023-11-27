import { useState, useEffect } from 'react';
import TrackList from './components/Track'
import PlayerControls from './components/Player.js'

// import tracks from './data/tracks.js'

import { MusicContext } from "./contexts/MusicContext";

// firebase
import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// 
// https://firebase.google.com/docs/web/setup#available-libraries

// styles
import './styles/app.css';


const firebaseConfig = {
  apiKey: "AIzaSyCppNrtm7HQK26JApmQCJGMmAEGWz4CfOM",
  authDomain: "cedar-streaming.firebaseapp.com",
  projectId: "cedar-streaming",
  storageBucket: "gs://cedar-streaming.appspot.com",
  messagingSenderId: "671051816448",
  appId: "1:671051816448:web:59daaf7209186ddc7282e5",
  measurementId: "G-WQ2KDKHKG7"
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
      // console.log('songsList:', songsList);

      const songsData = await Promise.all(
        songsList.items.map(async (item) => {
          try {
            const title = item.name;
            const url = await getDownloadURL(item);
            return { title, url };
          } catch (urlError) {
            // console.error('Error getting download URL:', urlError);
            throw urlError; // Rethrow the error to propagate it to the outer catch block
          }
        })
      );

    setState((prev) => ({ ...prev, tracks: songsData }));
  } catch (fetchError) {
    // console.error('Error fetching songs:', fetchError);
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
          <PlayerControls />
        </main>
      </div>
    </MusicContext.Provider>
  );
}

export default App;

     
