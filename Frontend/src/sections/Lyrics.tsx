import { Side} from "../components"

const Lyrics = () => {
  return (
      <Side position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]} color="purple">
        <h2 className="text-xl font-bold">Lyrics</h2>
      </Side>
  )
}

export default Lyrics