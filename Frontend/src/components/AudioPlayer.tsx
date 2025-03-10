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

const AudioPlayer : FC<AudioPlayerProps> = ({ src, setSrc }) => {
  

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
  
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-1/2 flex justify-between items-center py-4">
        <p>{convertDuration(trackProgress)}</p>
        <div className="w-full flex gap-8 justify-center items-center">
          <IconButton
            clickFunction={handleClick}
            src="/icons/player-track-prev.svg"
          />
          <IconButton
            clickFunction={handleClick}
            src={`${
              playing ? "/icons/player-pause.svg" : "/icons/player-play.svg"
            }`}
          />
          <IconButton
            clickFunction={playNext}
            src="/icons/player-track-next.svg"
          />
        </div>
        <p ref={timeRef}>0:00</p>
      </div>
      <div className="seeker">
        <input
          type="range"
          ref={seekRef}
          min={0}
          max={sliderMax}
          value={0}
          onChange={handleChange}
        />
        <audio
          ref={audioRef}
          className="w-2/5 mx-auto mt-20"
          onLoadedMetadata={handleLoadedMetadata}
        />
      </div>
    </div>
  );
}

export default AudioPlayer