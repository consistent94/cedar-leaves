import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
  faStepBackward,
  faStepForward,
} from "@fortawesome/free-solid-svg-icons";
import useMusicPlayer from "../hooks/useMusicPlayer";
import "../styles/Player.css";

function PlayerControls() {
  console.log("PlayerControls rendered");
  
  const music = useMusicPlayer();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      if (music.audioPlayer.duration) {
        const newProgress =
          (music.audioPlayer.currentTime / music.audioPlayer.duration) * 100;
        setProgress(newProgress);
      }
    };

    music.audioPlayer.addEventListener("timeupdate", updateProgress);

    return () => {
      music.audioPlayer.removeEventListener("timeupdate", updateProgress);
    };
  }, [music.audioPlayer]);

  // useEffect(() => {
  //   const handleKeyPress = (e) => {
  //     if (e.code === "Space") {
  //       e.preventDefault(); // Prevent page scroll
  //       music.togglePlay(); // Toggle playback
  //     }
  //   };
  
  //   window.addEventListener("keydown", handleKeyPress);
  
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyPress);
  //   };
  // }, [music]);

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * music.audioPlayer.duration;
    music.audioPlayer.currentTime = newTime;
    setProgress(e.target.value);
  };

  const formatTime = (time) => {
    if (time && !isNaN(time)) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes < 10 ? "0" : ""}${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;
    }
    return "00:00";
  };

  const currentTrack = music.currentTrack;

  return (
    <div className="audio-player">
      {/* Controls and Track Info */}
      <div className="controls-container">
        <div className="controls">
          <button className="button has-text-light">
            <FontAwesomeIcon
              icon={faStepBackward}
              onClick={music.playPreviousTrack}
            />
          </button>
          <button className="button has-text-light" onClick={music.togglePlay}>
            {music.isPlaying ? (
              <FontAwesomeIcon icon={faPause} />
            ) : (
              <FontAwesomeIcon icon={faPlay} />
            )}
          </button>
          <button className="button has-text-light">
            <FontAwesomeIcon
              icon={faStepForward}
              onClick={music.playNextTrack}
            />
          </button>
        </div>
        <div className="track-title">
          {currentTrack ? currentTrack.title : "No Track"}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <input
          type="range"
          value={progress}
          onChange={handleProgressChange}
          step="0.01"
          className="progress-bar"
        />
      </div>

      {/* Time Info */}
      <div className="time-container">
        <span>{formatTime(music.currentTime)}</span>
        <span>{formatTime(currentTrack?.duration)}</span>
      </div>
    </div>
  );
}

export default PlayerControls;
