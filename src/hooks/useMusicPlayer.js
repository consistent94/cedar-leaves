import { useContext, useEffect, useState } from "react";
import { MusicContext } from "../contexts/MusicContext";

const useMusicPlayer = () => {
  const [state, setState] = useContext(MusicContext);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audioPlayer = state.audioPlayer;

    const handleTimeUpdate = () => {
      setCurrentTime(audioPlayer.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audioPlayer.duration);
    };

    audioPlayer.addEventListener("timeupdate", handleTimeUpdate);
    audioPlayer.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audioPlayer.removeEventListener("timeupdate", handleTimeUpdate);
      audioPlayer.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [state.audioPlayer]);

  useEffect(() => {
    // Preload durations for all tracks
    const loadTrackDurations = async () => {
      const updatedTracks = await Promise.all(
        state.tracks.map(async (track) => {
          if (!track.duration) {
            const audio = new Audio(track.url);
            await new Promise((resolve) => {
              audio.addEventListener("loadedmetadata", () => {
                track.duration = audio.duration; // Set duration
                resolve();
              });
            });
          }
          return track;
        })
      );
      setState((prevState) => ({ ...prevState, tracks: updatedTracks }));
    };
  
    loadTrackDurations();
  }, [state.tracks, setState]);

  function playTrack(index) {
    if (index === state.currentTrackIndex) {
      togglePlay();
    } else {
      state.audioPlayer.pause();
      state.audioPlayer = new Audio(state.tracks[index].url);
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
    const newIndex =
      state.currentTrackIndex === state.tracks.length - 1
        ? 0
        : state.currentTrackIndex + 1;
    playTrack(newIndex);
  }

  function playPreviousTrack() {
    const newIndex =
      state.currentTrackIndex === 0
        ? state.tracks.length - 1
        : state.currentTrackIndex - 1;
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
    duration,
  };
};

export default useMusicPlayer;
