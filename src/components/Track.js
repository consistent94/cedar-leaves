import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";

import useMusicPlayer from "./../hooks/useMusicPlayer";

import '../styles/track.css'


function TrackList() {
  const music = useMusicPlayer();

  return (
    <div className="track">
      {music.trackList.map((track, index) => (
        <div key={index} className="box">
          <div className="track-info">
            <button
              className="button"
              onClick={() => music.playTrack(index)}
            >
              {music.isPlaying && music.currentTrackIndex === index ? (
                <FontAwesomeIcon icon={faPause} />
              ) : (
                <FontAwesomeIcon icon={faPlay} />
              )}
            </button>
            <div className="track-title">{track.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default TrackList;
