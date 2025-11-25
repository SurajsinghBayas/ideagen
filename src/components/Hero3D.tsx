import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const AbstractShape = () => {
    const mesh = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.x = state.clock.elapsedTime * 0.2;
            mesh.current.rotation.y = state.clock.elapsedTime * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={mesh} scale={1.5}>
                <torusKnotGeometry args={[1, 0.3, 128, 32]} />
                <meshPhysicalMaterial
                    color="#1a1a1a" // Dark charcoal
                    roughness={0.4}
                    metalness={0.1}
                    clearcoat={1}
                    clearcoatRoughness={0.2}
                />
            </mesh>
        </Float>
    );
};

export const Hero3D = () => {
    return (
        <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
                <pointLight position={[-10, -10, -10]} intensity={1} />

                <AbstractShape />

                <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.25} far={10} color="#000000" />
                <Environment preset="studio" />
            </Canvas>
        </div>
    );
};
