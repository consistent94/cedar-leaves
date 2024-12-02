import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { MusicContext } from "../contexts/MusicContext";

const useMusicPlayer = () => {
  const [state, setState] = useContext(MusicContext);
  const [currentTime, setCurrentTime] = useState(0);
  const durationsRef = useRef({}); // Cache for durations
  const isLoadingRef = useRef(false); // Prevent redundant loading

  const audioPlayer = state.audioPlayer;

  // Define the togglePlay function first, so it's available for use in playTrack and useEffect
  const togglePlay = useCallback(() => {
    if (audioPlayer) {
      const isPlaying = !state.isPlaying;
      isPlaying ? audioPlayer.play() : audioPlayer.pause();
      setState((prevState) => {
        if (prevState.isPlaying === isPlaying) return prevState;
        return { ...prevState, isPlaying };
      });
    }
  }, [audioPlayer, state.isPlaying, setState]);

  // Define playTrack function
  const playTrack = useCallback(
    async (index) => {
      if (index === state.currentTrackIndex) {
        togglePlay();
      } else {
        const track = state.tracks[index];

        if (audioPlayer) {
          audioPlayer.pause();
        }

        const newAudioPlayer = new Audio(track.url);
        newAudioPlayer.play();

        setState((prevState) => ({
          ...prevState,
          audioPlayer: newAudioPlayer,
          currentTrackIndex: index,
          isPlaying: true,
        }));
      }
    },
    [state.tracks, state.currentTrackIndex, audioPlayer, togglePlay, setState]
  );

  // Preload durations once
  useEffect(() => {
    const preloadDurations = async () => {
      if (isLoadingRef.current) return; // Prevent redundant calls
      isLoadingRef.current = true;

      const updatedTracks = await Promise.all(
        state.tracks.map(async (track) => {
          if (!track.duration && !durationsRef.current[track.title]) {
            const audio = new Audio(track.url);
            await new Promise((resolve) => {
              audio.addEventListener("loadedmetadata", () => {
                const trackDuration = audio.duration || 0;
                durationsRef.current[track.title] = trackDuration;
                resolve();
              });
              audio.addEventListener("error", () => resolve()); // Handle loading errors gracefully
              audio.load(); // Trigger metadata loading
            });
          }
          return {
            ...track,
            duration: durationsRef.current[track.title] || track.duration,
          };
        })
      );

      // Avoid setting state unless tracks have actually changed
      if (JSON.stringify(updatedTracks) !== JSON.stringify(state.tracks)) {
        setState((prevState) => ({
          ...prevState,
          tracks: updatedTracks,
        }));
      }

      isLoadingRef.current = false;
    };

    preloadDurations();
  }, [state.tracks, setState]);

  // Handle audio player events
  useEffect(() => {
    if (!audioPlayer) return;

    const handleTimeUpdate = () => setCurrentTime(audioPlayer.currentTime);
    const handleTrackEnd = () => {
      const nextIndex =
        state.currentTrackIndex === state.tracks.length - 1
          ? 0
          : state.currentTrackIndex + 1;
      playTrack(nextIndex);
    };

    audioPlayer.addEventListener("timeupdate", handleTimeUpdate);
    audioPlayer.addEventListener("ended", handleTrackEnd);

    return () => {
      audioPlayer.removeEventListener("timeupdate", handleTimeUpdate);
      audioPlayer.removeEventListener("ended", handleTrackEnd);
    };
  }, [audioPlayer, state.currentTrackIndex, state.tracks.length, playTrack]); // Added missing dependencies

  return {
    playTrack,
    togglePlay,
    currentTrackIndex: state.currentTrackIndex,
    currentTrack:
      state.currentTrackIndex !== null && state.tracks.length > 0
        ? state.tracks[state.currentTrackIndex]
        : null,
    trackList: state.tracks,
    isPlaying: state.isPlaying,
    playNextTrack: () =>
      playTrack(
        state.currentTrackIndex === state.tracks.length - 1
          ? 0
          : state.currentTrackIndex + 1
      ),
    playPreviousTrack: () =>
      playTrack(
        state.currentTrackIndex === 0
          ? state.tracks.length - 1
          : state.currentTrackIndex - 1
      ),
    audioPlayer,
    currentTime,
    isLoading: isLoadingRef.current,
  };
};

export default useMusicPlayer;
