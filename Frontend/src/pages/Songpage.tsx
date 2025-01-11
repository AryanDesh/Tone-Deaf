import { Canvas} from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Tesseract } from "../components"

const Songpage = () => {
  return (
    <main className="w-full h-screen songpage_background">
      <div className="w-full h-full grid grid-cols-4">
        <div className="w-full h-full col-start-2 col-end-4">
          <Canvas linear camera={{ position: [0, 0, 6] }}>
            <ambientLight intensity={2} />
            <pointLight position={[10, 10, 10]} />
            <Tesseract />
            <OrbitControls />
          </Canvas>
        </div>
      </div>
    </main>
  );
}

export default Songpage