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
  const [state, setState] = useState({
    audioPlayer: new Audio(),
    tracks: [],
    currentTrackIndex: null,
    isPlaying: false
  });

  // Flag for loading state
  const [loading, setLoading] = useState(true);

  // Fetch songs when the component mounts
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const songsList = await listAll(songRef); // Fetch list of songs
        const batchSize = 5; // Load a batch of songs at a time
        const totalSongs = songsList.items.length;

        // Loop through songs and batch them
        for (let i = 0; i < totalSongs; i += batchSize) {
          const batch = songsList.items.slice(i, i + batchSize);
          const songsData = await Promise.all(
            batch.map(async (item) => {
              try {
                const title = item.name;
                const url = await getDownloadURL(item);
                return { title, url };
              } catch (urlError) {
                console.error('Error fetching URL for item:', urlError);
                return null; // Skip this song if the URL fails
              }
            })
          );
          
          setState((prev) => ({
            ...prev,
            tracks: [...prev.tracks, ...songsData.filter(song => song !== null)]
          }));
        }
      } catch (fetchError) {
        console.error('Error fetching songs:', fetchError);
      } finally {
        setLoading(false); // Stop loading when data is fetched
      }
    };

    fetchSongs(); // Call fetchSongs when the component mounts
  }, []); // Empty dependency array ensures it only runs once

  // Render a loading message or the actual content
  if (loading) {
    return <div>Loading songs...</div>;
  }

  return (
    <MusicContext.Provider value={[state, setState]}>
      <div className='App'>
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
