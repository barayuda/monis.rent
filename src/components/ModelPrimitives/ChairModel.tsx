'use client';

import React, { useRef, useEffect } from 'react';
import { useConfigurator } from '@/context/ConfiguratorContext';
import gsap from 'gsap';
import * as THREE from 'three';

export default function ChairModel() {
  const { selectedChairId } = useConfigurator();
  const chairGroupRef = useRef<THREE.Group>(null);
  
  const isErgo = selectedChairId === 'chair-ergo';

  // Play a beautiful entrance/swap animation when the chair type changes
  useEffect(() => {
    if (chairGroupRef.current) {
      // Pop scale up with a dynamic spring-back easing
      gsap.fromTo(
        chairGroupRef.current.scale,
        { x: 0.1, y: 0.1, z: 0.1 },
        { x: 1, y: 1, z: 1, duration: 0.9, ease: 'back.out(1.6)' }
      );
      // Spin it smoothly on the hydraulic axis
      gsap.fromTo(
        chairGroupRef.current.rotation,
        { y: -Math.PI },
        { y: 0, duration: 1.2, ease: 'power3.out' }
      );
    }
  }, [selectedChairId]);

  // Colors & Aesthetic specs
  // Ergo: Ocean Teal (#0f766e) mesh and matte black high-density plastic frame
  // Nomad: Premium Tan Leather (#b45309) cushions with elegant rosewood accents and dark metal hardware
  const ergoColor = '#14b8a6';
  const ergoFrame = '#1e293b';
  const nomadColor = '#c27a3f'; // Gorgeous rich tan leather
  const nomadWood = '#5c2d12'; // Solid mahogany accents
  const nomadMetal = '#111827'; // Dark structural frame

  return (
    <group ref={chairGroupRef} position={[0, 0, 0.85]}>
      {/* ==========================================
          SHARED HYDRAULIC WHEELBASE (5-STAR BASE)
          ========================================== */}
      <group position={[0, 0, 0]}>
        {/* Central hydraulic cylinder shaft */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.3, 16]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.1} metalness={0.95} />
        </mesh>
        
        {/* Shaft outer protective sleeve */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.15, 16]} />
          <meshStandardMaterial color={isErgo ? ergoFrame : nomadMetal} roughness={0.5} metalness={0.5} />
        </mesh>

        {/* 5-star legs structure */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * 2 * Math.PI) / 5;
          const length = 0.38;
          const x = Math.sin(angle) * (length / 2);
          const z = Math.cos(angle) * (length / 2);
          
          return (
            <group key={i} rotation={[0, angle, 0]}>
              {/* Spoke Arm */}
              <mesh position={[0, 0.05, length / 2]} castShadow receiveShadow>
                <boxGeometry args={[0.05, 0.03, length]} />
                <meshStandardMaterial
                  color={isErgo ? ergoFrame : nomadWood}
                  roughness={isErgo ? 0.6 : 0.3}
                  metalness={isErgo ? 0.3 : 0.1}
                />
              </mesh>
              
              {/* Caster Wheel */}
              <mesh position={[0, 0.02, length]} castShadow>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial color="#0f172a" roughness={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ==========================================
          CHAIR STYLE 1: ERGOFIT BREEZE (OCEAN TEAL)
          ========================================== */}
      {isErgo && (
        <group position={[0, 0.35, 0]}>
          {/* Seat bracket & tilt mechanism block */}
          <mesh position={[0, 0.04, 0]} castShadow>
            <boxGeometry args={[0.18, 0.08, 0.18]} />
            <meshStandardMaterial color={ergoFrame} roughness={0.6} />
          </mesh>

          {/* Seat Cushion */}
          <mesh position={[0, 0.09, -0.02]} castShadow receiveShadow>
            <boxGeometry args={[0.48, 0.05, 0.46]} />
            <meshStandardMaterial color={ergoColor} roughness={0.7} metalness={0.0} />
          </mesh>
          
          {/* Curved Ergonomic Spine support */}
          <mesh position={[0, 0.35, -0.22]} rotation={[-0.08, 0, 0]} castShadow>
            <boxGeometry args={[0.07, 0.5, 0.04]} />
            <meshStandardMaterial color={ergoFrame} roughness={0.5} />
          </mesh>

          {/* Mesh Backrest Border */}
          <group position={[0, 0.45, -0.25]} rotation={[0.05, 0, 0]}>
            {/* Left Frame */}
            <mesh position={[-0.21, 0, 0]} castShadow>
              <boxGeometry args={[0.03, 0.48, 0.03]} />
              <meshStandardMaterial color={ergoFrame} roughness={0.4} />
            </mesh>
            {/* Right Frame */}
            <mesh position={[0.21, 0, 0]} castShadow>
              <boxGeometry args={[0.03, 0.48, 0.03]} />
              <meshStandardMaterial color={ergoFrame} roughness={0.4} />
            </mesh>
            {/* Top Curved Edge */}
            <mesh position={[0, 0.24, 0]} castShadow>
              <boxGeometry args={[0.45, 0.03, 0.03]} />
              <meshStandardMaterial color={ergoFrame} roughness={0.4} />
            </mesh>
            {/* Bottom Support */}
            <mesh position={[0, -0.24, 0]} castShadow>
              <boxGeometry args={[0.45, 0.03, 0.03]} />
              <meshStandardMaterial color={ergoFrame} roughness={0.4} />
            </mesh>
            
            {/* Elastic Ocean Teal Mesh membrane */}
            <mesh position={[0, 0, -0.005]} castShadow>
              <boxGeometry args={[0.39, 0.45, 0.01]} />
              <meshStandardMaterial
                color={ergoColor}
                roughness={0.8}
                transparent={true}
                opacity={0.8}
                wireframe={false}
              />
            </mesh>
          </group>

          {/* Fully Adjustable 3D Armrests */}
          {/* Left Armrest */}
          <group position={[-0.26, 0.18, 0.05]}>
            <mesh position={[0, -0.05, 0]} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.15, 12]} />
              <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.8} />
            </mesh>
            <mesh position={[0.02, 0.03, 0]} castShadow>
              <boxGeometry args={[0.06, 0.02, 0.22]} />
              <meshStandardMaterial color={ergoFrame} roughness={0.7} />
            </mesh>
          </group>

          {/* Right Armrest */}
          <group position={[0.26, 0.18, 0.05]}>
            <mesh position={[0, -0.05, 0]} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.15, 12]} />
              <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.8} />
            </mesh>
            <mesh position={[-0.02, 0.03, 0]} castShadow>
              <boxGeometry args={[0.06, 0.02, 0.22]} />
              <meshStandardMaterial color={ergoFrame} roughness={0.7} />
            </mesh>
          </group>
          
          {/* Smart lumbar support pad */}
          <mesh position={[0, 0.28, -0.23]} castShadow>
            <boxGeometry args={[0.32, 0.08, 0.03]} />
            <meshStandardMaterial color={ergoFrame} roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* ==========================================
          CHAIR STYLE 2: PREMIUM NOMAD (TAN LEATHER)
          ========================================== */}
      {!isErgo && (
        <group position={[0, 0.35, 0]}>
          {/* Heavy metal tilting base bracket */}
          <mesh position={[0, 0.04, 0]} castShadow>
            <boxGeometry args={[0.2, 0.06, 0.2]} />
            <meshStandardMaterial color={nomadMetal} roughness={0.5} metalness={0.8} />
          </mesh>

          {/* Luxurious Thick Seat Cushion (Triple layered comfort) */}
          <group position={[0, 0.11, -0.02]}>
            {/* Cushion Base */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.5, 0.07, 0.48]} />
              <meshStandardMaterial color={nomadColor} roughness={0.75} metalness={0.05} />
            </mesh>
            {/* Soft Top Pillow Top */}
            <mesh position={[0, 0.045, 0]} castShadow>
              <boxGeometry args={[0.46, 0.03, 0.44]} />
              <meshStandardMaterial color={nomadColor} roughness={0.65} metalness={0.05} />
            </mesh>
          </group>
          
          {/* Heavy duty wooden mounting frame behind seat */}
          <mesh position={[0, 0.12, -0.22]} castShadow>
            <boxGeometry args={[0.15, 0.25, 0.05]} />
            <meshStandardMaterial color={nomadWood} roughness={0.3} />
          </mesh>

          {/* Plush High-Back Vegan Leather Backrest */}
          <group position={[0, 0.48, -0.24]} rotation={[0.07, 0, 0]}>
            {/* Backrest Mahogany Shell */}
            <mesh position={[0, 0, -0.035]} castShadow>
              <boxGeometry args={[0.48, 0.62, 0.03]} />
              <meshStandardMaterial color={nomadWood} roughness={0.25} />
            </mesh>
            
            {/* Main Tan Leather Back Cushion */}
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.44, 0.58, 0.06]} />
              <meshStandardMaterial color={nomadColor} roughness={0.7} metalness={0.05} />
            </mesh>

            {/* Accent Headrest Pillow */}
            <mesh position={[0, 0.23, 0.02]} castShadow>
              <boxGeometry args={[0.34, 0.12, 0.04]} />
              <meshStandardMaterial color={nomadColor} roughness={0.6} />
            </mesh>

            {/* Ergonomic lumbar bolster segment */}
            <mesh position={[0, -0.16, 0.02]} castShadow>
              <boxGeometry args={[0.38, 0.14, 0.04]} />
              <meshStandardMaterial color={nomadColor} roughness={0.7} />
            </mesh>
          </group>

          {/* Solid Curved Loop Armrests with Tan Leather Padding */}
          {/* Left Armrest */}
          <group position={[-0.27, 0.22, 0.0]}>
            {/* Black steel loop */}
            <mesh position={[0, -0.02, 0]} castShadow>
              <boxGeometry args={[0.02, 0.24, 0.28]} />
              <meshStandardMaterial color={nomadMetal} roughness={0.4} metalness={0.7} />
            </mesh>
            {/* Leather Arm Pad */}
            <mesh position={[0, 0.105, 0.02]} castShadow>
              <boxGeometry args={[0.04, 0.025, 0.24]} />
              <meshStandardMaterial color={nomadColor} roughness={0.65} />
            </mesh>
          </group>

          {/* Right Armrest */}
          <group position={[0.27, 0.22, 0.0]}>
            {/* Black steel loop */}
            <mesh position={[0, -0.02, 0]} castShadow>
              <boxGeometry args={[0.02, 0.24, 0.28]} />
              <meshStandardMaterial color={nomadMetal} roughness={0.4} metalness={0.7} />
            </mesh>
            {/* Leather Arm Pad */}
            <mesh position={[0, 0.105, 0.02]} castShadow>
              <boxGeometry args={[0.04, 0.025, 0.24]} />
              <meshStandardMaterial color={nomadColor} roughness={0.65} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}
