import React from "react";
import useMusicPlayer from "./../hooks/useMusicPlayer";
import '../styles/Track.css';

function TrackList() {
  const music = useMusicPlayer();

  console.log("TrackList - music.trackList:", music.trackList);
  console.log("TrackList - isLoading:", music.isLoading); 

  // Move formatTime function definition before it's used
  const formatTime = (time) => {
    if (time && !isNaN(time)) {
      const minutes = Math.floor(time / 60);
      const formatMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      const seconds = Math.floor(time % 60);
      const formatSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
      return `${formatMinutes}:${formatSeconds}`;
    }
    return "00:00";
  };

  return (
    <div className="track">
      {music.trackList.map((track, index) => {
        console.log("Rendering track:", track.title, "Duration:", track.duration);  // Log each track's duration

        return (
          <div
            key={index}
            className={`box ${index === music.currentTrackIndex ? "selected" : ""}`}
          >
            <div className="track-info">
              <div
                className={`track-title typewriter ${
                  index === music.currentTrackIndex ? "selected-title" : ""
                }`}
                onClick={() => music.playTrack(index)}
              >
                {track.title}
              </div>
              <div className="track-length">
                {formatTime(track.duration)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );  
}

export default TrackList;
