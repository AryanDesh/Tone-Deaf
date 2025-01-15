import { FC, ReactNode, useCallback, useState } from "react"
import { Html } from "@react-three/drei"
import { ThreeEvent } from "@react-three/fiber";

interface SideProps {
  position: [number, number, number],
  rotation: [number, number, number],
  children: ReactNode
}

const Side : FC<SideProps> = ({ position, rotation, children }) => {
  
  const [isInteracting, setIsInteracting] = useState<boolean>(false);

  const handlePointerDown = useCallback((e : ThreeEvent<PointerEvent>) => {
    setIsInteracting(true)
    e.stopPropagation()
  }, [])
  
  const handlePointerUp = useCallback((e : ThreeEvent<PointerEvent>) => {
    setIsInteracting(false)
    e.stopPropagation();
  }, [])
  
  const handleClick = useCallback((e : ThreeEvent<MouseEvent>) => {
    if(isInteracting) {
      e.stopPropagation()
    }
  }, [isInteracting])

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[4,4]} />
      <meshPhysicalMaterial
        metalness={0}
        roughness={0}
        envMapIntensity={0.9}
        clearcoat={1}
        transparent={true}
        opacity={1}
        transmission={0.95}
        color="aquamarine"
        reflectivity={0.2}
      />
      <Html
        transform
        distanceFactor={2}
        position={[0, 0, 0.01]}
        occlude
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
      >
        <section className="w-[790px] h-[790px] select-none">
          {children}
        </section>
      </Html>
    </mesh>
  );
}

export default Side