import { forwardRef } from "react"

interface PlayerProps {
  changeFunction: () => void
}

const AudioPlayer = forwardRef<PlayerProps, HTMLAudioElement>(({ changeFunction }, audioRef) => {

  return (
    <div></div>
  )
})
export default AudioPlayer