import axios, { AxiosResponse } from "axios"
import { useEffect, useCallback } from "react"
import { Side } from "../components"
import { useAudioContext } from "../context"

const Playlists = () => {
  
  const { setCurrSong, setSongQueue, songQueue } = useAudioContext()
  
  const fetchAllSongs = useCallback(async () => {
    const url = '/api/song/allsongs'
    const response : AxiosResponse<Song[]> = await axios.get(url);
    console.log(response.data)
    setSongQueue(response.data)
  }, [setSongQueue])
  
  const setCurrentSong = (src: Song) => {
    setCurrSong(src)
  }  
  
  useEffect(() => {
    fetchAllSongs()
  }, [fetchAllSongs])
  
  /*
    1. Add a button on the div which on click would call a function that plays the song clicked on
    2. Gonna need to use Recoil idhr
  */

  return (
    <Side position={[-2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <div className="w-full h-full relative">
        {songQueue.map((val, key) => {
          return (
            <div
              key={key}
              onClick={() => setCurrentSong(val)}
              className="cursor-pointer"
            >
              {val.artist}
            </div>
          );
        })}
      </div>
    </Side>
  );
}

export default Playlists