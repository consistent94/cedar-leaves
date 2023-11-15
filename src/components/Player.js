import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
  faStepBackward,
  faStepForward
} from "@fortawesome/free-solid-svg-icons";
import useMusicPlayer from "../hooks/useMusicPlayer";

import '../styles/player.css'

function PlayerControls() {
  const music = useMusicPlayer();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const newProgress =
        (music.audioPlayer.currentTime / music.audioPlayer.duration) * 100;
      setProgress(newProgress);
    };

    music.audioPlayer.addEventListener("timeupdate", updateProgress);

    return () => {
      music.audioPlayer.removeEventListener("timeupdate", updateProgress);
    };
  }, [music.audioPlayer]);

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * music.audioPlayer.duration;
    music.audioPlayer.currentTime = newTime;
    setProgress(e.target.value);
  };

  return (
    <div className="audio-player">
      <div className="box controls has-background-grey-dark">
        <div className="current-track has-text-light">
          <p>{music.currentTrackName}</p>
        </div>
        <div>
          <button className="button has-text-light has-background-grey-dark">
            <FontAwesomeIcon
              icon={faStepBackward}
              onClick={music.playPreviousTrack}
            />
          </button>
          <button
            className="button has-text-light has-background-grey-dark"
            onClick={music.togglePlay}
          >
            {music.isPlaying ? (
              <FontAwesomeIcon icon={faPause} />
            ) : (
              <FontAwesomeIcon icon={faPlay} />
            )}
          </button>
          <button className="button has-text-light has-background-grey-dark">
            <FontAwesomeIcon
              icon={faStepForward}
              onClick={music.playNextTrack}
            />
          </button>
          <div className="progress-bar-container">
            <input
                type="range"
                value={progress}
                onChange={handleProgressChange}
                step="0.01"
                className="progress-bar"
              />
         </div>   
        </div>
      </div>
    </div>
  );
}

export default PlayerControls;
