import { useState, useEffect } from "react";
import { Side } from "../components"
import { AudioPlayer } from "../components";
import { supabase } from "../utils/supe";
import { useAudioContext } from "../context";

const Playing = () => {
  
  const [imSrc, setImSrc] = useState('')
  
  const { currSong } = useAudioContext()
  useEffect(() => {
    console.log(currSong)
  }, [currSong])
  
  const getImageFile = () => {
    const { data } = supabase.storage.from('Songs-Chunks').getPublicUrl('3c64c554-21fe-4714-b2a4-9f2008969127/3c64c554-21fe-4714-b2a4-9f2008969127.jpg')
    setImSrc(data.publicUrl) 
  }
  
  useEffect(() => {
    getImageFile()
  }, [])


  return (
    <Side position={[0, 0, 2]} rotation={[0, 0, 0]}>
      <div className="w-full h-full relative">
        <img
          src={imSrc}
          className="bg-cover bg-no-repeat absolute w-full h-full -z-20"
        />
        <div className="w-full h-full bg-gradient-to-t from-primary-blue from-30% to-transparent absolute inset-0 -z-10" />
        <div className="w-full h-full flex flex-col items-center justify-end py-10">
          <div className="w-full flex flex-col items-center">
            <h1 className="text-5xl">Happy Now</h1>
            <h2 className="text-2xl pt-8">Artist</h2>
            <h2 className="text-2xl py-4">Album</h2>
          </div>
          <AudioPlayer />
        </div>
      </div>
    </Side>
  );
}

export default Playing