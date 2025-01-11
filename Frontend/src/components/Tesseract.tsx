import { useRef} from "react"
import { Group } from "three"
import Side from "./Side"

const Tesseract = () => {
const cubeRef = useRef<Group>(null)

  return (
    <group ref={cubeRef}>
      <Side position={[0, 0, 2]} rotation={[0, 0, 0]} color="red">
        <h2 className="text-xl font-bold">Front Face</h2>
        <p>Welcome to the cube!</p>
      </Side>
      <Side position={[0, 0, -2]} rotation={[0, Math.PI, 0]} color="red">
        <h2 className="text-xl font-bold">Back Face</h2>
        <p>Explore all sides!</p>
      </Side>
      <Side position={[-2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} color="green">
        <h2 className="text-xl font-bold">Left Face</h2>
        <p>Rotate to see more!</p>
      </Side>
      <Side position={[2, 0, 0]} rotation={[0, Math.PI / 2, 0]} color="yellow">
        <h2 className="text-xl font-bold">Right Face</h2>
        <p>Interactive 3D cube</p>
      </Side>
      <Side position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]} color="purple">
        <h2 className="text-xl font-bold">Top Face</h2>
        <p>Built with React & Three.js</p>
      </Side>
      <Side position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]} color="orange">
        <h2 className="text-xl font-bold">Bottom Face</h2>
        <p>Enjoy the view!</p>
      </Side>
    </group>
  )
}

export default Tesseract