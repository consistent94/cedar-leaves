import React, { useState, useEffect } from 'react';
import { MusicContext } from "./contexts/MusicContext";
import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import TrackList from './components/Track'; 
import PlayerControls from './components/Player';
import './styles/App.css';

// Firebase config
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

  // Initial state
  const [state, setState] = useState({
    audioPlayer: new Audio(),
    tracks: [],
    currentTrackIndex: null,
    isPlaying: false,
  });

  // Loading state
  const [loading, setLoading] = useState(true);

  // Fetch songs only once
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const songsList = await listAll(songRef);
        const songsData = await Promise.all(
          songsList.items.map(async (item) => {
            try {
              const title = item.name;
              const url = await getDownloadURL(item);
              return { title, url, duration: null }; // Initialize duration as null
            } catch (error) {
              console.error("Error fetching URL for item:", error);
              return null;
            }
          })
        );

        setState((prev) => ({
          ...prev,
          tracks: songsData.filter((song) => song !== null),
        }));
      } catch (error) {
        console.error("Error fetching songs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [songRef]);

  // Render loading or main content
  if (loading) {
    return <div>Loading songs...</div>;
  }

  return (
    <MusicContext.Provider value={[state, setState]}>
      <div className="App">
        <header>
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
