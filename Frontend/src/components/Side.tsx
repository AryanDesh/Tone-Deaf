import { ReactNode } from "react"
import { Euler, Vector3 } from "three"
import { Html } from "@react-three/drei"

const Side = ({ position, rotation, color, children }: {
  position: Vector3,
  rotation: Euler,
  color: string,
  children: ReactNode
}) => {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[4, 4]} />
      <meshStandardMaterial color={color} />
      <Html
        transform
        distanceFactor={2}
        position={[0, 0, 0.01]}
        occlude
      >
        <div className="bg-white text-black p-4 rounded shadow-lg w-[790px] h-[790px] flex items-center justify-center text-center">
          {children}
        </div>
      </Html>
    </mesh>
  );
}

export default Side