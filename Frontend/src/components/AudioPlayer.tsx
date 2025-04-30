import { useState, useRef, useCallback, useEffect, FC } from "react";
import IconButton from "./IconButton";
import Hls from "hls.js";
import { supabase } from "../utils/supe";
import { Song } from "../types/songTypes";
import { useAudioContext } from "../context";
import { useSocketManager } from "../context/socket";

interface AudioPlayerProps {
  src: Song,
  setSrc: (Song: Song) => void
}

const AudioPlayer: FC<AudioPlayerProps> = ({ src, setSrc }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [songSrc, setSongSrc] = useState('')
  const [sliderMax, setSliderMax] = useState<number | undefined>(0);
  const [trackProgress, setTrackProgress] = useState<number>(0);
  const [volume, setVolume] = useState(1); // Default volume (1 = 100%)
  const playRef = useRef<number | null>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const seekRef = useRef<HTMLInputElement>(null)
  const { isPlaying, setIsPlaying, nextSong, prevSong } = useAudioContext();
  const { socket } = useSocketManager();
  
  const getAudioFile = useCallback(async () => {
    const { data } = supabase.storage.from('Songs-Chunks').getPublicUrl(`${src.id}/${src.id}.m3u8`);
    console.log(data);
    setSongSrc(data.publicUrl) 
  }, [src])
  
  useEffect(() => {
    getAudioFile();
    if (!songSrc) return;
  
    const hls = new Hls({
      maxBufferLength: 30, 
      maxMaxBufferLength: 60, 
      maxBufferHole: 0.1, 
      maxLoadingDelay: 2, 
      fragLoadingTimeOut: 4000,
      startFragPrefetch: true,
      lowLatencyMode: true,
    });
  
    if (Hls.isSupported() && audioRef.current) {
      hls.loadSource(songSrc);
      hls.attachMedia(audioRef.current);
      
      hls.on(Hls.Events.FRAG_CHANGED, () => {
        console.log("Fragment changed, resuming playback");
        audioRef.current?.play();
      });
  
      hls.on(Hls.Events.MANIFEST_PARSED, async () => {
        try {
          await audioRef.current?.play();
        } catch (err) {
          console.log("Auto-play blocked", err);
        }
      });
    }
  
    return () => hls.destroy();
  }, [songSrc, getAudioFile]);
  
  const convertDuration = (secs: number | undefined) => {
    if(secs) {
      const minutes = Math.floor(secs / 60);
      const seconds = Math.floor(secs % 60);
      const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
      return `${minutes}:${returnedSeconds}`;
    }
    return "0:00"
  }
  
  const handleLoadedMetadata = () => {
    if (timeRef.current) timeRef.current.textContent = convertDuration(audioRef.current?.duration);      
    if(audioRef.current) setSliderMax(Math.floor(audioRef.current.duration))
  }

  const updateProgress = useCallback(() => {
    if(audioRef.current && seekRef.current) {
      const currentTime = audioRef.current.currentTime;
      setTrackProgress(currentTime)

      seekRef.current.value = currentTime.toString()
      seekRef.current.style.setProperty('--range-progress', `${(currentTime / audioRef.current.duration) * 100}%`);
    }
  }, [audioRef, seekRef, setTrackProgress])
  
  useEffect(() => {
    updateProgress()
  }, [updateProgress])

  const startAnimation = useCallback(() => {
    if(audioRef.current && seekRef.current) {
      const animate = () => {
        updateProgress()
        playRef.current = requestAnimationFrame(animate)
      }
        playRef.current = requestAnimationFrame(animate)
    }
  }, [updateProgress])
  
  useEffect(() => {
    if(isPlaying) {
      audioRef.current?.play();
      startAnimation()
    } else {
      audioRef.current?.pause();
      if(playRef.current) {
        cancelAnimationFrame(playRef.current);
        playRef.current = null;
      }
      updateProgress();
    }
    
    return () => {
      if(playRef.current) {
        cancelAnimationFrame(playRef.current)
      }
    }
  }, [isPlaying, startAnimation, updateProgress])
  
  // Handle end of track to automatically play next song
  useEffect(() => {
    const handleTrackEnd = () => {
      handlePlayNext();
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleTrackEnd);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleTrackEnd);
      }
    };
  }, []);
  
  const handleChange = () => {
    if(audioRef.current && seekRef.current) {
      const newTime = Number(seekRef.current.value);
      audioRef.current.currentTime = newTime;
      setTrackProgress(newTime);

      seekRef.current.style.setProperty('--range-progress', `${(newTime / audioRef.current.duration) * 100}%`);
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }
  
  const handlePlayNext = () => {
    nextSong();
    // Make sure the new song is reflected in the component
    // If the src prop doesn't automatically update from context changes
    // you might need to use useEffect to sync or manually update here
  }
  
  const handlePlayPrev = () => {
    prevSong();
    // Same consideration as above regarding src prop updates
  }
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  
  return (  
    <div className="w-full flex flex-col items-center relative">
      <div className="w-full flex justify-between items-center py-4">
    
        {/* Player Controls & Volume Control in Same Flex Container */}
        <div className="w-full grid grid-cols-[2fr_auto] items-center">
          {/* Player Controls + Timer */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center w-2/5 mx-auto">
            <p>{convertDuration(trackProgress)}</p>

            {/* Playback Controls */}
            <div className="flex gap-8 justify-center">
              <IconButton clickFunction={handlePlayPrev} src="/icons/player-track-prev.svg" />
              <IconButton clickFunction={handlePlayPause} src={isPlaying ? "/icons/player-pause.svg" : "/icons/player-play.svg"} />
              <IconButton clickFunction={handlePlayNext} src="/icons/player-track-next.svg" />
            </div>

            <p ref={timeRef}>0:00</p>
          </div>

          {/* Volume Control on the Right */}
          <div className="grid grid-cols-[auto_auto_auto] items-center">
            <span>🔉</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              className="w-16"
            />
            <span>🔊</span>
          </div>
        </div>
      </div>
    
      {/* Progress Bar */}
      <div className="absolute bottom-0 w-7/12">
        <input type="range" ref={seekRef} min={0} max={sliderMax} value={0} onChange={handleChange} className="w-full" />
        <audio ref={audioRef} className="w-2/5 mx-auto mt-20" onLoadedMetadata={handleLoadedMetadata} preload="auto"/>
      </div>
    </div>
  );
}

export default AudioPlayer