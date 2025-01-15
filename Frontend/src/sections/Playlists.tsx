import { Side } from "../components"
import PlaylistComponent from "../components/PlaylistComponent";

const Playlists = () => {
  

  return (
      <Side position={[-2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <PlaylistComponent />
      </Side>
  )
}

export default Playlists