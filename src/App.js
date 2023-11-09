import { useState, useRef } from 'react';
import Track from './components/Track'
// import Player from './components/Player.js'
import tracks from './data/tracks.js'

import './styles/App.css';

function App() {

  
  const [songs, setSongs] = useState(tracks); 
  const [currentSong, setCurrentSong] = useState(songs[0]); 
  const [isPlaying, setIsPlaying] = useState(false); 

  const audioRef =useRef();

  const [songInfo, setSongInfo] = useState({ 
    currentTime: 0, 
    duration: 0, 
    animationPercentage: 0, 
  }); 

  const timeUpdateHandler = (e) => { 
    const current = e.target.currentTime; 
    const duration = e.target.duration; 
    //calculating percentage 
    const roundedCurrent = Math.round(current); 
    const roundedDuration = Math.round(duration); 
    const animation = Math.round((roundedCurrent / roundedDuration) * 100); 
    console.log(); 
    setSongInfo({ 
      currentTime: current, 
      duration, 
      animationPercentage: animation, 
    }); 
  }; 

  const songEndHandler = async () => { 
    let currentIndex = songs.findIndex((song) => song.id === currentSong.id); 
  
    await setCurrentSong(songs[(currentIndex + 1) % songs.length]); 
  
    if (isPlaying) audioRef.current.play(); 
  }; 

  return (
    <div className="App">
      <header>
            <img src="logo.png" alt="CEDAR LEAVES" />
      </header>
    
        <main>
            <h1>Track Listing</h1>
            <div class="tracklist">
              {tracks.map((track) => (
                <Track key={track.id} track={track} />
              ))}
            </div>

            {/* <AudioPlayer currentTrack={currentTrack} audioRef={audioRef} /> */}
        </main>

        {/* <Player 
          id={songs.id} 
          songs={songs} 
          songInfo={songInfo} 
          setSongInfo={setSongInfo} 
          audioRef={audioRef} 
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying} 
          currentSong={currentSong} 
          setCurrentSong={setCurrentSong} 
          setSongs={setSongs} 
        />  */}

        <audio 
          onLoadedMetadata={timeUpdateHandler} 
          onTimeUpdate={timeUpdateHandler} 
          src={currentSong.audio} 
          ref={audioRef} 
          onEnded={songEndHandler} 
      ></audio> 

    </div>
  );
}

export default App;
