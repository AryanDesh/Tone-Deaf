import { useState, useRef, useCallback, useEffect, FC } from "react";
import IconButton from "./IconButton";
import Hls from "hls.js";
import { supabase } from "../utils/supe";

/*
  TODO:
  1. Add a way to like song and add to playlist
  2. Add functionality to show current queue

*/
interface AudioPlayerProps {
  src: Song,
  setSrc: React.Dispatch<React.SetStateAction<Song>>
}

const AudioPlayer : FC<AudioPlayerProps> = ({ src }) => {
  

  const audioRef = useRef<HTMLAudioElement>(null)
  
  const [songSrc, setSongSrc] = useState('')
  
  const getAudioFile = useCallback (async () => {
    const { data } = supabase.storage.from('Songs-Chunks').getPublicUrl(`${src.id}/${src.id}.m3u8`)
    setSongSrc(data.publicUrl) 
  }, [src])
  
  useEffect(() => {
    getAudioFile()
    const hls = new Hls();

    if(Hls.isSupported()) {
      hls.loadSource(songSrc) 
      if(audioRef.current){
        hls.attachMedia(audioRef.current);
      }
    }
  }, [songSrc, getAudioFile])

  
  /** Handle the cube rotation when the slider is moved by pressing down and moving
  */


  const [sliderMax, setSliderMax] = useState<number | undefined>(0);
  const [trackProgress, setTrackProgress] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false)
  const [volume, setVolume] = useState(1); // Default volume (1 = 100%)

  const playRef = useRef<number | null>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const seekRef = useRef<HTMLInputElement>(null)

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
    if(playing) {
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
  }, [playing, startAnimation, updateProgress])
  
  const handleChange = () => {
    if(audioRef.current && seekRef.current) {
      const newTime = Number(seekRef.current.value);
      audioRef.current.currentTime = newTime;
      setTrackProgress(newTime);

      seekRef.current.style.setProperty('--range-progress', `${(newTime / audioRef.current.duration) * 100}%`);
    }
  }

  const handleClick = () => {
    setPlaying(prev => !prev)
  }
  
  const playNext = () => {
    console.log("Next")
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
      <IconButton clickFunction={handleClick} src="/icons/player-track-prev.svg" />
      <IconButton clickFunction={handleClick} src={playing ? "/icons/player-pause.svg" : "/icons/player-play.svg"} />
      <IconButton clickFunction={playNext} src="/icons/player-track-next.svg" />
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
    <div className="absolute  bottom-0 w-7/12">
      <input type="range" ref={seekRef} min={0} max={sliderMax} value={0} onChange={handleChange} className="w-full" />
      <audio ref={audioRef} className="w-2/5 mx-auto mt-20" onLoadedMetadata={handleLoadedMetadata} />
    </div>
  </div>
  
  );
}

export default AudioPlayer