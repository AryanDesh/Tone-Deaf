import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const CubeFace: React.FC<{ position: [number, number, number], rotation: [number, number, number], color: string, children: React.ReactNode }> = ({ position, rotation, color, children }) => (
  <mesh position={position} rotation={rotation}>
    <planeGeometry args={[2, 2]} />
    <meshStandardMaterial color={color} />
    <Html transform distanceFactor={2} position={[0, 0, 0.01]} rotation-y={Math.PI}>
      <div className="bg-white bg-opacity-80 p-4 rounded shadow-lg w-48 h-48 flex items-center justify-center text-center">
        {children}
      </div>
    </Html>
  </mesh>
)

const HtmlCube: React.FC = () => {
  const cubeRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x += 0
      cubeRef.current.rotation.y += 0
    }
  })

  return (
    <group ref={cubeRef}>
      <CubeFace position={[0, 0, 1]} rotation={[0, 0, 0]} color="red">
        <h2 className="text-xl font-bold">Front Face</h2>
        <p>Welcome to the cube!</p>
      </CubeFace>
      <CubeFace position={[0, 0, -1]} rotation={[0, Math.PI, 0]} color="blue">
        <h2 className="text-xl font-bold">Back Face</h2>
        <p>Explore all sides!</p>
      </CubeFace>
      <CubeFace position={[-1, 0, 0]} rotation={[0, Math.PI / 2, 0]} color="green">
        <h2 className="text-xl font-bold">Left Face</h2>
        <p>Rotate to see more!</p>
      </CubeFace>
      <CubeFace position={[1, 0, 0]} rotation={[0, -Math.PI / 2, 0]} color="yellow">
        <h2 className="text-xl font-bold">Right Face</h2>
        <p>Interactive 3D cube</p>
      </CubeFace>
      <CubeFace position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]} color="purple">
        <h2 className="text-xl font-bold">Top Face</h2>
        <p>Built with React & Three.js</p>
      </CubeFace>
      <CubeFace position={[0, -1, 0]} rotation={[Math.PI / 2, 0, 0]} color="orange">
        <h2 className="text-xl font-bold">Bottom Face</h2>
        <p>Enjoy the view!</p>
      </CubeFace>
    </group>
  )
}

const HtmlCubeScene: React.FC = () => {
  return (
    <div className="w-full h-screen">
      <Canvas linear camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <HtmlCube />
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export default HtmlCubeScene

