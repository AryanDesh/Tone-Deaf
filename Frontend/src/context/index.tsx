import { ReactNode, useState } from "react";
import { createContext, useContext } from "react";

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioContextProvider = ({ children } : { children : ReactNode }) => {

  const [currSong, setCurrSong] = useState('3c64c554-21fe-4714-b2a4-9f2008969127');

  return (
    <AudioContext.Provider
      value={{
        currSong,
        setCurrSong
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if(!context) throw new Error("useAudioContext must be used within AudioContextProvider")
  
  return context;
}