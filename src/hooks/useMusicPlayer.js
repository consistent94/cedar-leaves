import { useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { MusicContext } from "../contexts/MusicContext";

const useMusicPlayer = () => {
  const [state, setState] = useContext(MusicContext);
  const [currentTime, setCurrentTime] = useState(0);
  const durationsRef = useRef({});
  const isLoadingRef = useRef(false);
  const currentTimeRef = useRef(0);

  const audioPlayer = state.audioPlayer;

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

  useEffect(() => {
    const preloadDurations = async () => {
      if (isLoadingRef.current) return;
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
              audio.addEventListener("error", () => resolve());
              audio.load();
            });
          }
          return {
            ...track,
            duration: durationsRef.current[track.title] || track.duration,
          };
        })
      );

      if (JSON.stringify(updatedTracks) !== JSON.stringify(state.tracks)) {
        setState((prevState) => ({
          ...prevState,
          tracks: updatedTracks,
        }));
      }

      isLoadingRef.current = false;
    };

    preloadDurations();
  }, []);

  useEffect(() => {
    if (!audioPlayer) return;

    const handleTimeUpdate = () => {
      currentTimeRef.current = audioPlayer.currentTime;
      setCurrentTime(audioPlayer.currentTime);
    };
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
  }, []);

  return useMemo(() => ({
    audioPlayer,
    getCurrentTime: () => currentTimeRef.current,
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
    currentTime,
    isLoading: isLoadingRef.current,
  }), [
    audioPlayer,
    playTrack,
    togglePlay,
    state.currentTrackIndex,
    state.tracks,
    state.isPlaying,
    currentTime,
  ]);
};

export default useMusicPlayer;
