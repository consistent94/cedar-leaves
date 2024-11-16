import { useContext, useEffect, useState } from "react";
import { MusicContext } from "../contexts/MusicContext";

const useMusicPlayer = () => {
  const [state, setState] = useContext(MusicContext);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audioPlayer = state.audioPlayer;

    if (!audioPlayer) return;

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

  async function preloadTrackDuration(track) {
    if (!track.duration) {
      const audio = new Audio(track.url);
      await new Promise((resolve) => {
        audio.addEventListener("loadedmetadata", () => {
          track.duration = audio.duration;
          resolve(track);
        });
      });
    }
  };

  useEffect(() => {
    const preloadDurations = async () => {
      const updatedTracks = await Promise.all(
        state.tracks.map(async (track) => {
          if (!track.duration || track.duration === 0) {
            // Create a temporary Audio element to preload duration
            const audio = new Audio(track.url);
            return new Promise((resolve) => {
              audio.addEventListener("loadedmetadata", () => {
                resolve({ ...track, duration: audio.duration });
              });
              audio.addEventListener("error", () => {
                console.error(`Failed to load metadata for ${track.title}`);
                resolve(track); // Return the track unchanged on error
              });
            });
          }
          return track;
        })
      );
  
      // Avoid updating the state if nothing changed
      if (
        JSON.stringify(updatedTracks) !== JSON.stringify(state.tracks)
      ) {
        setState((prevState) => ({
          ...prevState,
          tracks: updatedTracks,
        }));
      }
    };
  
    if (state.tracks.length > 0) {
      preloadDurations(); // Preload durations for all tracks
    }
  }, [state.tracks, setState]);
  

  async function playTrack(index) {
    if (index === state.currentTrackIndex) {
      togglePlay();
    } else {
      const track = state.tracks[index];
      await preloadTrackDuration(track);

      if (state.audioPlayer) {
        state.audioPlayer.pause();
      }

      const audioPlayer = state.audioPlayer || new Audio();
      audioPlayer.src = track.url;
      audioPlayer.play();

      setState({
        ...state,
        audioPlayer,
        currentTrackIndex: index,
        isPlaying: true,
      });
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
