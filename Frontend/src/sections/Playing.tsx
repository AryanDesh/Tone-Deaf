import { useEffect, useRef, useState } from "react";
import { happy_now } from "../assets"
import { Side } from "../components"
import Hls from "hls.js";
import { supabase } from "../utils/supe";

const Playing = () => {
  
  const audioRef = useRef<HTMLAudioElement>()
  const folderName = '57f9eb70-9525-401e-989f-85e58fd4662e'
  const [src, setSrc] = useState('')
  const [imSrc, setImSrc] = useState('')
  
  const getAudioFile = async () => {
    const { data, error } = supabase.storage.from('Songs-Chunks').getPublicUrl('57f9eb70-9525-401e-989f-85e58fd4662e/57f9eb70-9525-401e-989f-85e58fd4662e.m3u8')
    setSrc(data.publicUrl) 
  }
  
  useEffect(() => {
    getAudioFile()
    const hls = new Hls();

    if(Hls.isSupported()) {
      hls.loadSource(src) 
      if(audioRef.current){
        hls.attachMedia(audioRef.current);
      }
    }
  }, [src])

  const getImageFile = () => {
    const { data, error } = supabase.storage.from('Songs-Chunks').getPublicUrl('57f9eb70-9525-401e-989f-85e58fd4662e/57f9eb70-9525-401e-989f-85e58fd4662e.jpg')
    setImSrc(data.publicUrl) 
  }
  
  useEffect(() => {
    getImageFile()
  }, [])

  return (
    <Side position={[0, 0, 2]} rotation={[0, 0, 0]}>
      <div className="w-full h-full relative">
        <img src={imSrc} className="bg-cover bg-no-repeat absolute w-full h-full -z-20" />
        <div className="w-full h-full bg-gradient-to-t from-primary-blue from-30% to-transparent absolute inset-0 -z-10" />
        <div className="w-full h-full flex flex-col items-center justify-end py-10">
          <div className="w-full flex flex-col items-center">
            <h1 className="text-5xl">Happy Now</h1>
            <h2 className="text-2xl pt-8">Artist</h2>
            <h2 className="text-2xl py-4">Album</h2>
          </div>
          <div className="w-full flex flex-col items-center">
            <audio controls ref={audioRef} className="w-full mx-auto mt-20" />
            <p>Seeker & Times</p>
          </div>
        </div>
      </div>
    </Side>
  );
}

export default Playing