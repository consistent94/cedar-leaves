import { useContext, useEffect, useState, useCallback } from "react";
import { MusicContext } from "../contexts/MusicContext";

const useMusicPlayer = () => {
  const [state, setState] = useContext(MusicContext);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audioPlayer = state.audioPlayer;

    if (!audioPlayer) return;

    const handleTimeUpdate = () => setCurrentTime(audioPlayer.currentTime);
    const handleLoadedMetadata = () => setDuration(audioPlayer.duration);

    audioPlayer.addEventListener("timeupdate", handleTimeUpdate);
    audioPlayer.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audioPlayer.removeEventListener("timeupdate", handleTimeUpdate);
      audioPlayer.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [state.audioPlayer]);

  const preloadTrackDuration = useCallback(async (track) => {
    if (!track.duration) {
      const audio = new Audio(track.url);
      return new Promise((resolve) => {
        audio.addEventListener("loadedmetadata", () => {
          track.duration = audio.duration;
          resolve(track);
        });
        audio.addEventListener("error", () => {
          console.error(`Failed to load metadata for ${track.title}`);
          resolve(track); // Return the track unchanged on error
        });
      });
    }
    return track;
  }, []);

  useEffect(() => {
    const preloadDurations = async () => {
      const updatedTracks = await Promise.all(
        state.tracks.map(preloadTrackDuration)
      );

      const tracksChanged = updatedTracks.some(
        (track, index) => track.duration !== state.tracks[index]?.duration
      );

      if (tracksChanged) {
        setState((prevState) => ({
          ...prevState,
          tracks: updatedTracks,
        }));
      }
    };

    if (state.tracks.length > 0) preloadDurations();
  }, [state.tracks, preloadTrackDuration, setState]);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      state.audioPlayer.pause();
    } else {
      state.audioPlayer.play();
    }
    setState((prevState) => ({
      ...prevState,
      isPlaying: !prevState.isPlaying,
    }));
  }, [state.audioPlayer, state.isPlaying, setState]);

  const playTrack = useCallback(
    async (index) => {
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
    },
    [state, preloadTrackDuration, togglePlay, setState]
  );
  
  const playNextTrack = useCallback(() => {
    const newIndex =
      state.currentTrackIndex === state.tracks.length - 1
        ? 0
        : state.currentTrackIndex + 1;
    playTrack(newIndex);
  }, [state.currentTrackIndex, state.tracks, playTrack]);

  useEffect(() => {
    if (!state.audioPlayer) return;

    const handleTrackEnd = () => playNextTrack();

    state.audioPlayer.addEventListener("ended", handleTrackEnd);

    return () => {
      state.audioPlayer.removeEventListener("ended", handleTrackEnd);
    };
  }, [state.audioPlayer, playNextTrack]);

  const playPreviousTrack = useCallback(() => {
    const newIndex =
      state.currentTrackIndex === 0
        ? state.tracks.length - 1
        : state.currentTrackIndex - 1;
    playTrack(newIndex);
  }, [state.currentTrackIndex, state.tracks, playTrack]);

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
    playNextTrack,
    playPreviousTrack,
    audioPlayer: state.audioPlayer,
    currentTime,
    duration,
  };
};

export default useMusicPlayer;
