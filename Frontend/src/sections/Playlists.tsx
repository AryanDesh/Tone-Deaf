import { Side} from "../components"

const Playlists = () => {
  return (
      <Side position={[-2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} color="green">
        <h2 className="text-xl font-bold">Playlists</h2>
      </Side>
  )
}

export default Playlists