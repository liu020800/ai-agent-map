"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

function ParallaxGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += (mouse.current.x * 0.08 - groupRef.current.rotation.y) * 0.03;
      groupRef.current.rotation.x += (mouse.current.y * 0.06 - groupRef.current.rotation.x) * 0.03;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function WireSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.06;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[6, 48, 48]} />
      <meshBasicMaterial color="#0a2a4a" wireframe transparent opacity={0.07} />
    </mesh>
  );
}

function DataRings() {
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  const r3 = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (r1.current) { r1.current.rotation.x = t * 0.12; r1.current.rotation.z = t * 0.08; }
    if (r2.current) { r2.current.rotation.y = t * 0.1; r2.current.rotation.x = t * 0.06; }
    if (r3.current) { r3.current.rotation.z = t * 0.08; r3.current.rotation.y = t * 0.05; }
  });
  return (
    <>
      <mesh ref={r1}><torusGeometry args={[8, 0.02, 16, 100]} /><meshBasicMaterial color="#00ffc8" transparent opacity={0.05} /></mesh>
      <mesh ref={r2}><torusGeometry args={[10, 0.015, 16, 100]} /><meshBasicMaterial color="#a855f7" transparent opacity={0.035} /></mesh>
      <mesh ref={r3}><torusGeometry args={[12, 0.01, 16, 100]} /><meshBasicMaterial color="#00d4ff" transparent opacity={0.025} /></mesh>
    </>
  );
}

function FloatingDots() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      p[i * 3] = (Math.random() - 0.5) * 35;
      p[i * 3 + 1] = (Math.random() - 0.5) * 35;
      p[i * 3 + 2] = (Math.random() - 0.5) * 35;
    }
    return p;
  }, []);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.015;
      ref.current.rotation.x = state.clock.elapsedTime * 0.008;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color="#00ffc8" size={0.04} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={0.2} color="#00ffc8" />
      <ParallaxGroup>
        <WireSphere />
        <DataRings />
        <FloatingDots />
        <Stars radius={200} depth={60} count={1500} factor={3} saturation={0} fade speed={0.6} />
      </ParallaxGroup>
    </>
  );
}

export default function CyberBackground() {
  return (
    <div className="fixed inset-0 z-0" style={{ background: "radial-gradient(ellipse at 50% 50%, #0a0a2e 0%, #000000 70%)" }}>
      <Canvas camera={{ position: [0, 0, 18], fov: 60 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
        <Scene />
      </Canvas>
    </div>
  );
}
