import { Side } from "../components"

const Rooms = () => {
  return (
      <Side position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]} color="orange">
        <h2 className="text-xl font-bold">Rooms</h2>
      </Side>
  )
}

export default Rooms