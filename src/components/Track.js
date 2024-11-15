import React from "react";
import useMusicPlayer from "./../hooks/useMusicPlayer";
import '../styles/Track.css';

function TrackList() {
  const music = useMusicPlayer();

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
      {music.trackList.map((track, index) => (
        <div key={index} className="box">
          <div className="track-info">
            <div
              className="track-title typewriter"
              onClick={() => music.playTrack(index)}
            >
              {track.title}
            </div>
            <div className="track-length">
              {formatTime(track.duration)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TrackList;
