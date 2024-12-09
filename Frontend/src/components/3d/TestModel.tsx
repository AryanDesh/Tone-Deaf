import { useGLTF } from '@react-three/drei';
import { GroupProps } from '@react-three/fiber';
import { GLTF } from 'three-stdlib';
import * as THREE from 'three';

// Extend GLTF class to include your model-specific types
type GLTFResult = GLTF & {
  nodes: {
    Cube: THREE.Mesh;
  };
  materials: {
    Material: THREE.Material;
  };
};

export function Model(props: GroupProps) {
  const { nodes, materials } = useGLTF('/blender.glb') as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube.geometry}
        material={materials.Material}
        scale={[1.468, 1.497, 1.506]}
      />
    </group>
  );
}

// Preload the asset
useGLTF.preload('/blender.glb');