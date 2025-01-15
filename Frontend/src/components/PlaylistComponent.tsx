import axios, { AxiosResponse } from "axios";
import { useState, useEffect } from "react";

const PlaylistComponent = () => {
  
  const [songs, setSongs] = useState<Song[]>([])
  
  
  const fetchAllSongs = async () => {
    const url = '/api/temp/allsongs'
    const response : AxiosResponse<Song[]> = await axios.get(url);
    setSongs(response.data)
  }
  
  const setCurrentSong = (src: string) => {
    console.log(src)
  }  
  
  useEffect(() => {
    fetchAllSongs()
  }, [])
  
  /*
    1. Add a button on the div which on click would call a function that plays the song clicked on
    2. Gonna need to use Recoil idhr
  */
  
  return (
    <div className="w-full h-full relative">
      {songs.map((val, key) => {
        return (
          <div
            key={key}
            onClick={() => setCurrentSong(val.id)}
            className="cursor-pointer"
          >
            {val.artist}
          </div>
        );
      })}
    </div>
  );
}

export default PlaylistComponent