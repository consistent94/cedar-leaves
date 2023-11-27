import { useContext, useEffect, useState } from "react";
import { MusicContext } from "../contexts/MusicContext";

const useMusicPlayer = () => {
  const [state, setState] = useContext(MusicContext);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Set up event listeners for timeupdate and loadedmetadata
    const audioPlayer = state.audioPlayer;

    const handleTimeUpdate = () => {
      setCurrentTime(audioPlayer.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audioPlayer.duration);
    };

    audioPlayer.addEventListener("timeupdate", handleTimeUpdate);
    audioPlayer.addEventListener("loadedmetadata", handleLoadedMetadata);

    // Remove event listeners when component unmounts
    return () => {
      audioPlayer.removeEventListener("timeupdate", handleTimeUpdate);
      audioPlayer.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [state.audioPlayer]);

  function playTrack(index) {
    if (index === state.currentTrackIndex) {
        togglePlay();
    } else {
        state.audioPlayer.pause();
        state.audioPlayer = new Audio(state.tracks[index].url);
        console.log("index: ", state.tracks[index]);
        state.audioPlayer.play();
      setState({ ...state, currentTrackIndex: index, isPlaying: true });
    }
  }

  function togglePlay() {
    if (state.isPlaying) {
      state.audioPlayer.pause();
    } else {
      state.audioPlayer.play();
    }
    setState({ ...state, isPlaying: !state.isPlaying });
  }

  function playNextTrack() {
    let newIndex = null;
    state.currentTrackIndex === state.tracks.length - 1
      ? (newIndex = 0)
      : (newIndex = state.currentTrackIndex + 1);
    playTrack(newIndex);
  }

  function playPreviousTrack() {
    let newIndex = null;
    state.currentTrackIndex === 0
      ? (newIndex = state.tracks.length - 1)
      : (newIndex = state.currentTrackIndex - 1);
    playTrack(newIndex);
  }

  return {
    playTrack,
    togglePlay,
    currentTrackIndex: state.currentTrackIndex,
    currentTrackName:
      state.currentTrackIndex !== null &&
      state.tracks[state.currentTrackIndex].name,
    trackList: state.tracks,
    isPlaying: state.isPlaying,
    playNextTrack,
    playPreviousTrack,
    audioPlayer: state.audioPlayer,
    currentTime,
    duration
  };
};

export default useMusicPlayer;
