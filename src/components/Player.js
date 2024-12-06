import React, { useState, useEffect, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
  faStepBackward,
  faStepForward,
} from "@fortawesome/free-solid-svg-icons";
import useMusicPlayer from "../hooks/useMusicPlayer";
import "../styles/Player.css";

const PlayerControls = memo(() => {
  const music = useMusicPlayer();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const currentTime = music.getCurrentTime();
      if (music.audioPlayer.duration) {
        const newProgress = (currentTime / music.audioPlayer.duration) * 100;
        setProgress(newProgress);
      }
    };

    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [music]);

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

      <div className="progress-bar-container">
        <input
          type="range"
          value={progress}
          onChange={handleProgressChange}
          step="0.01"
          className="progress-bar"
        />
      </div>

      <div className="time-container">
        <span>{formatTime(music.currentTime)}</span>
        <span>{formatTime(currentTrack?.duration)}</span>
      </div>
    </div>
  );
});

export default PlayerControls;
