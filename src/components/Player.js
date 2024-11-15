import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
  faStepBackward,
  faStepForward
} from "@fortawesome/free-solid-svg-icons";
import useMusicPlayer from "../hooks/useMusicPlayer";

import '../styles/Player.css'

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

  const formatTime = (time) => {
    if (time && !isNaN(time)) {
      const minutes = Math.floor(time / 60);
      const formatMinutes =
        minutes < 10 ? `0${minutes}` : `${minutes}`;
      const seconds = Math.floor(time % 60);
      const formatSeconds =
        seconds < 10 ? `0${seconds}` : `${seconds}`;
      return `${formatMinutes}:${formatSeconds}`;
    }
    return '00:00';
  };

  return (
    <div className="audio-player">
      <div className="box controls has-background-grey-dark">
        <div>
          <div className="buttons">
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
          </div>
          <div className="progress-bar-container">
          <span className="time current">{formatTime(music.currentTime)}</span>
            <input
                type="range"
                value={progress}
                onChange={handleProgressChange}
                step="0.01"
                className="progress-bar"
              />
          <span className="time">{formatTime(music.duration)}</span>
         </div>   
        </div> 
      </div>
    </div>
  );
}

export default PlayerControls;
