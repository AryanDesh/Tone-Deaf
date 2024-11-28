import { Canvas } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useLoader, } from "@react-three/fiber";
import * as THREE from 'three'

export function Object(){
  const gltf = useLoader(GLTFLoader, 'https://felixrunquist.com/felix_roundel_2.glb', loader => {
  const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/');
    loader.setDRACOLoader(dracoLoader);
   })
   const { nodes, materials } = gltf;
   const color = new THREE.Color('#FF9A03').convertSRGBToLinear();
   const ellipseMaterial = new THREE.MeshPhongMaterial({
        color: color.getHex(),
        transparent: false, opacity: 0.5,
        specular: 0x050505,
        shininess: 100
   });
   const textMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        transparent: false, opacity: 0.5,
        specular: 0x050505,
        shininess: 100
   });
  return (
    <>
      <group dispose={null}>
        <pointLight 

          name="Point Light"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={100}
          shadow-camera-far={100000}
          position={[-254.65, 150.88, -135.21]}
        ></pointLight>
        <group name="Group">
          <mesh 

            name="Text"
            geometry={nodes.Text.geometry}
            material={textMaterial}
            castShadow
            receiveShadow
            position={[-46.56, -1.88, -13.23]}
            rotation={[0, -Math.PI / 2, 0]}
          ></mesh>
          <mesh 

            name="Ellipse"
            geometry={nodes.Ellipse.geometry}
            material={ellipseMaterial}
            castShadow
            receiveShadow
            position={[-8.73, 0, -25.43]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={1}
          ></mesh>
        </group>
        <PerspectiveCamera 

          name="1"
          makeDefault={true}
          far={100000}
          near={70}
          fov={45}
          position={[-949.88, 139.05, 279.99]}
          rotation={[-0.46, -1.25, -0.44]}
          scale={1}
        ></PerspectiveCamera>
        <hemisphereLight name="Default Ambient Light" intensity={0.75} color="#eaeaea" ></hemisphereLight>
      </group>
    </>
  )
}

export default function Personal(){
  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <Canvas shadows>
        <OrbitControls></OrbitControls>
        <Object></Object>
      </Canvas>
    </div>
  )
}

