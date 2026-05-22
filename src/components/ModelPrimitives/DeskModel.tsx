'use client';

import React, { useRef, useEffect } from 'react';
import { useConfigurator } from '@/context/ConfiguratorContext';
import gsap from 'gsap';
import * as THREE from 'three';

export default function DeskModel({ children }: { children?: React.ReactNode }) {
  const { selectedDeskId, dayNightMode, ledColor } = useConfigurator();
  
  const topGroupRef = useRef<THREE.Group>(null);
  const ledLightRef = useRef<THREE.PointLight>(null);

  const isBamboo = selectedDeskId === 'desk-bamboo';
  const deskHeight = isBamboo ? 1.15 : 0.72; // Bamboo is standing desk, Walnut is standard executive desk

  // Animate desk height using GSAP on tabletop group
  useEffect(() => {
    if (topGroupRef.current) {
      gsap.to(topGroupRef.current.position, {
        y: deskHeight,
        duration: 1.5,
        ease: 'power2.inOut',
      });
    }
  }, [deskHeight]);

  // Animate LED glow intensity and color
  useEffect(() => {
    if (ledLightRef.current) {
      const targetIntensity = dayNightMode === 'night' ? 2.5 : 0.2;
      gsap.to(ledLightRef.current, {
        intensity: targetIntensity,
        duration: 1.0,
      });
    }
  }, [dayNightMode]);

  useEffect(() => {
    if (ledLightRef.current) {
      const color = new THREE.Color(ledColor);
      gsap.to(ledLightRef.current.color, {
        r: color.r,
        g: color.g,
        b: color.b,
        duration: 0.8,
      });
    }
  }, [ledColor]);

  // Materials & Colors based on selected desk style
  const topColor = isBamboo ? '#eed9b3' : '#3e2b20'; // Warm honey bamboo vs Dark rich walnut
  const topRoughness = isBamboo ? 0.35 : 0.65; // Sleek semi-gloss vs elegant organic matte
  const topMetalness = isBamboo ? 0.1 : 0.0;
  
  const frameColor = isBamboo ? '#f3f4f6' : '#1f2937'; // Pure white dual-motor frame vs structural dark slate frame
  const frameRoughness = 0.4;
  const frameMetalness = 0.8;

  return (
    <group>
      {/* 1. FIXED LOWER DESK FRAME (Stays at floor level) */}
      <group>
        {/* Left Foot */}
        <mesh position={[-1.0, 0.025, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.05, 0.9]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={frameRoughness}
            metalness={frameMetalness}
          />
        </mesh>
        
        {/* Right Foot */}
        <mesh position={[1.0, 0.025, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.05, 0.9]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={frameRoughness}
            metalness={frameMetalness}
          />
        </mesh>

        {/* Left Outer Pillar (Outer telescoping sleeve) */}
        <mesh position={[-1.0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.55, 0.12]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={frameRoughness}
            metalness={frameMetalness}
          />
        </mesh>

        {/* Right Outer Pillar */}
        <mesh position={[1.0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.55, 0.12]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={frameRoughness}
            metalness={frameMetalness}
          />
        </mesh>

        {/* Lower Crossbar for structural rigidity */}
        <mesh position={[0, 0.45, -0.2]} castShadow>
          <boxGeometry args={[1.88, 0.04, 0.08]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={frameRoughness}
            metalness={frameMetalness}
          />
        </mesh>
      </group>

      {/* 2. MOVING UPPER DESK GROUP (Tabletop, inner legs, and all desk accessories) */}
      <group ref={topGroupRef} position={[0, 0.72, 0]}>
        {/* Tabletop Surface */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.06, 1.3]} />
          <meshStandardMaterial
            color={topColor}
            roughness={topRoughness}
            metalness={topMetalness}
          />
        </mesh>

        {/* Tabletop Edge Bevel simulation (gives realistic depth highlights) */}
        <mesh position={[0, -0.031, 0]}>
          <boxGeometry args={[2.61, 0.005, 1.31]} />
          <meshStandardMaterial color={topColor} roughness={0.8} />
        </mesh>

        {/* Left Inner Pillar (Telescoping column extending downwards) */}
        <mesh position={[-1.0, -0.32, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.09, 0.6, 0.09]} />
          <meshStandardMaterial
            color={isBamboo ? '#d1d5db' : '#374151'} // Bright chrome/brushed silver vs dark charcoal steel
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Right Inner Pillar */}
        <mesh position={[1.0, -0.32, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.09, 0.6, 0.09]} />
          <meshStandardMaterial
            color={isBamboo ? '#d1d5db' : '#374151'}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Under-desk Wire Management Tray / Structural Subframe */}
        <mesh position={[0, -0.06, 0]} castShadow>
          <boxGeometry args={[1.8, 0.06, 0.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.5} />
        </mesh>
        
        {/* Bali-inspired Eco Leaf branding decal under desk (Secret design easter egg) */}
        <mesh position={[0.7, -0.061, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.002, 16]} />
          <meshStandardMaterial color="#059669" roughness={0.9} />
        </mesh>

        {/* 3. NEON LED UNDER-GLOW SPOTLIGHT */}
        <pointLight
          ref={ledLightRef}
          position={[0, -0.15, 0]}
          color={ledColor}
          intensity={dayNightMode === 'night' ? 2.5 : 0.2}
          distance={3.5}
          decay={2.0}
        />
        
        {/* Render children (accessories) inside the moving group */}
        {children}
      </group>
    </group>
  );
}
