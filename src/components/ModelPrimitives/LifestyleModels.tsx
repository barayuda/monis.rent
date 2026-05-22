'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useConfigurator } from '@/context/ConfiguratorContext';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import DraggableAsset from './DraggableAsset';

// Procedural steam particle bubble rising from coffee mug
function SteamBubble({ p }: { p: any }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.getElapsedTime() + p.delay;
    const cycle = (time * p.speed) % 1; // 0 to 1
    
    // Float upwards
    ref.current.position.y = cycle * 0.16;
    // Sway slightly like rising vapour
    ref.current.position.x = p.xOffset + Math.sin(time * 3.5) * 0.01;
    ref.current.position.z = p.zOffset + Math.cos(time * 3.5) * 0.01;
    
    // Fade out as it rises
    if (ref.current.material) {
      (ref.current.material as THREE.MeshStandardMaterial).opacity = (1 - cycle) * 0.45;
    }
    // Grow slightly as it rises
    const scaleFactor = (0.6 + cycle * 0.6) * p.scale;
    ref.current.scale.setScalar(scaleFactor);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial 
        color="#fafaf9" 
        transparent 
        opacity={0.4} 
        roughness={0.9} 
        emissive="#fafaf9"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

function SteamParticles({ position }: { position: [number, number, number] }) {
  const [particles] = useState(() => Array.from({ length: 4 }).map((_, i) => ({
    id: i,
    speed: 0.14 + Math.random() * 0.14,
    xOffset: (Math.random() - 0.5) * 0.015,
    zOffset: (Math.random() - 0.5) * 0.015,
    scale: 0.008 + Math.random() * 0.008,
    delay: i * 0.7
  })));

  return (
    <group position={position}>
      {particles.map((p) => <SteamBubble key={p.id} p={p} />)}
    </group>
  );
}

// Animated wrapper for lifestyle assets to handle spring drop-in & scale transitions
interface AnimatedLifestyleProps {
  active: boolean;
  defaultPosition: [number, number, number];
  defaultRotation?: [number, number, number];
  children: React.ReactNode;
}

const AnimatedLifestyle: React.FC<AnimatedLifestyleProps> = ({
  active,
  defaultPosition,
  defaultRotation = [0, 0, 0],
  children,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!groupRef.current) return;

    const [x, y, z] = defaultPosition;
    const [rx, ry, rz] = defaultRotation;

    if (active) {
      if (!hasMounted.current) {
        // Initial drop-in from top + spring scale
        groupRef.current.position.set(x, y + 2.0, z);
        groupRef.current.rotation.set(rx, ry, rz);
        groupRef.current.scale.set(0.001, 0.001, 0.001);

        gsap.to(groupRef.current.position, {
          x, y, z,
          duration: 1.1,
          ease: 'back.out(1.4)',
        });
        gsap.to(groupRef.current.scale, {
          x: 1, y: 1, z: 1,
          duration: 1.1,
          ease: 'back.out(1.4)',
        });
        hasMounted.current = true;
      } else {
        // Smooth transition in
        gsap.to(groupRef.current.position, {
          x, y, z,
          duration: 0.9,
          ease: 'back.out(1.3)',
        });
        gsap.to(groupRef.current.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.9,
          ease: 'back.out(1.3)',
        });
      }
    } else {
      if (hasMounted.current) {
        // Fade & shrink fly-up away
        gsap.to(groupRef.current.position, {
          y: y + 2.0,
          duration: 0.8,
          ease: 'power2.in',
        });
        gsap.to(groupRef.current.scale, {
          x: 0.001, y: 0.001, z: 0.001,
          duration: 0.8,
          ease: 'power2.in',
        });
      } else {
        // Hide immediately above
        groupRef.current.position.set(x, y + 2.0, z);
        groupRef.current.rotation.set(rx, ry, rz);
        groupRef.current.scale.set(0.001, 0.001, 0.001);
        hasMounted.current = true;
      }
    }
  }, [active, defaultPosition, defaultRotation]);

  return <group ref={groupRef}>{children}</group>;
};

export default function LifestyleModels() {
  const { selectedAccessoryIds, dayNightMode, selectedDeskId } = useConfigurator();

  // Selected state for each item
  const hasCoffeeMachine = selectedAccessoryIds.includes('coffee-machine');
  const deskHeight = selectedDeskId === 'desk-bamboo' ? 1.15 : 0.72;
  const mugDefaultPos: [number, number, number] = hasCoffeeMachine 
    ? [-1.35, 0.615, 0.12] 
    : [-0.65, deskHeight + 0.03, 0.15];
  const hasCoffeeMug = selectedAccessoryIds.includes('coffee-mug');
  const hasSurfboard = selectedAccessoryIds.includes('outdoor-surfboard');
  const hasScooter = selectedAccessoryIds.includes('outdoor-scooter');
  const hasBeanBag = selectedAccessoryIds.includes('relax-beanbag');
  const hasSpeaker = selectedAccessoryIds.includes('relax-speaker');
  const hasShelf = selectedAccessoryIds.includes('garage-shelf');
  const hasPegboard = selectedAccessoryIds.includes('garage-pegboard');

  const isNight = dayNightMode === 'night';

  // 1. Parametric Surfboard Geometry
  const surfboardGeometry = React.useMemo(() => {
    const geom = new THREE.BufferGeometry();
    
    const Nu = 50; // length divisions
    const Nv = 30; // angular divisions
    
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    
    for (let i = 0; i <= Nu; i++) {
      const tu = i / Nu;
      const u = -1.1 + 2.2 * tu; // Y coordinate from -1.1 to 1.1
      
      // Surfboard width profile: pointy nose, nice wide midpoint, tapered tail
      const w = 0.24 * Math.cos((u * Math.PI) / 2.5) * (1.0 - 0.12 * u);
      // Surfboard thickness profile (foil)
      const h = 0.032 * Math.cos((u * Math.PI) / 2.5);
      // Surfboard rocker curve (curved up nose and tail)
      const r = 0.075 * Math.max(0, u) ** 1.8 + 0.035 * Math.min(0, u) ** 2;
      
      for (let j = 0; j <= Nv; j++) {
        const tv = j / Nv;
        const v = tv * Math.PI * 2;
        
        const x = w * Math.cos(v);
        const y = u;
        const z = r + h * Math.sin(v);
        
        vertices.push(x, y, z);
        uvs.push(tv, tu);
      }
    }
    
    // Faces indices
    for (let i = 0; i < Nu; i++) {
      for (let j = 0; j < Nv; j++) {
        const p0 = i * (Nv + 1) + j;
        const p1 = p0 + 1;
        const p2 = (i + 1) * (Nv + 1) + j;
        const p3 = p2 + 1;
        
        // Face 1
        indices.push(p0, p2, p1);
        // Face 2
        indices.push(p1, p2, p3);
      }
    }
    
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    
    return geom;
  }, []);

  // 2. High-Fidelity Canvas Texture for Surfboard Decals
  const surfboardTexture = React.useMemo(() => {
    // Return early if server-side (Next.js SSR support)
    if (typeof window === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // A. Clean warm sand/fiberglass background
    ctx.fillStyle = '#fafaf9';
    ctx.fillRect(0, 0, 512, 1024);

    // B. Draw wooden stringers (deck + bottom)
    const drawStringer = (centerX: number) => {
      ctx.fillStyle = '#7c2d12'; // Rich mahogany/balsa brown
      ctx.fillRect(centerX - 2, 0, 4, 1024);
      // Subtle wood grain lines
      ctx.fillStyle = '#b45309';
      ctx.fillRect(centerX - 3, 0, 1, 1024);
      ctx.fillRect(centerX + 2, 0, 1, 1024);
    };
    drawStringer(128); // Deck stringer
    drawStringer(384); // Bottom stringer

    // C. Retro Bali Sunset resin tint stripe bands
    const drawStripes = (xStart: number, width: number) => {
      // 1. Warm sunset orange band
      ctx.fillStyle = 'rgba(234, 88, 12, 0.9)';
      ctx.fillRect(xStart, 380, width, 80);
      
      // 2. Golden sand yellow band
      ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';
      ctx.fillRect(xStart, 460, width, 80);

      // 3. Tropical sea teal band
      ctx.fillStyle = 'rgba(13, 148, 136, 0.9)';
      ctx.fillRect(xStart, 540, width, 80);
    };
    drawStripes(8, 240);   // Deck stripes
    drawStripes(264, 240); // Bottom stripes

    // D. Hand-shaped retro logo typography (adds incredible realism)
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    
    // Deck branding
    ctx.font = '900 18px "Courier New", monospace';
    ctx.fillText('MONIS SURF CO.', 128, 220);
    ctx.font = 'italic 12px Georgia, serif';
    ctx.fillText('Custom Shaped • Bali', 128, 240);

    // Bottom specifications
    ctx.font = '900 16px "Courier New", monospace';
    ctx.fillText('7\'10" FUNBOARD', 384, 220);
    ctx.font = '11px Georgia, serif';
    ctx.fillText('23 1/2" x 3 1/8"', 384, 238);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);

  // 3. Molded Composite Fin Geometry
  const finGeometry = React.useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); // trailing edge base
    s.lineTo(0.07, 0); // base length
    // Swept-back curved leading edge to tip
    s.bezierCurveTo(0.09, 0.04, 0.08, 0.08, 0.05, 0.10);
    // Swept trailing edge back down
    s.bezierCurveTo(0.02, 0.07, 0.005, 0.03, 0, 0);

    const extrudeSettings = {
      depth: 0.004,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.0015,
      bevelThickness: 0.0015,
    };
    return new THREE.ExtrudeGeometry(s, extrudeSettings);
  }, []);

  // 4. Custom Shaped Tail Pad Geometry
  const tailPadGeometry = React.useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.055, -0.12);
    s.lineTo(0.055, -0.12);
    s.lineTo(0.065, 0.12);
    s.lineTo(-0.065, 0.12);
    s.lineTo(-0.055, -0.12);

    const extrudeSettings = {
      depth: 0.003,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.001,
      bevelThickness: 0.001,
    };
    return new THREE.ExtrudeGeometry(s, extrudeSettings);
  }, []);

  // Helper to compute deck height and bottom height at Y position to lay elements flat
  const getSurfboardZSurface = (y: number, deck: boolean) => {
    const r = 0.075 * Math.max(0, y) ** 1.8 + 0.035 * Math.min(0, y) ** 2;
    const h = 0.032 * Math.cos((y * Math.PI) / 2.5);
    return deck ? r + h : r - h;
  };

  // Interactive Refs for micro-animations
  const scooterGroupRef = useRef<THREE.Group>(null);
  const surfboardGroupRef = useRef<THREE.Group>(null);
  const mugGroupRef = useRef<THREE.Group>(null);

  const handleScooterClick = (e: any) => {
    e.stopPropagation();
    if (!scooterGroupRef.current) return;
    
    // Playful Vespa suspension bounce!
    gsap.fromTo(scooterGroupRef.current.position,
      { y: 0.15 },
      { y: 0, duration: 0.8, ease: 'bounce.out' }
    );
  };

  const handleSurfboardClick = (e: any) => {
    e.stopPropagation();
    if (!surfboardGroupRef.current) return;
    
    // Wave sway rock
    gsap.fromTo(surfboardGroupRef.current.rotation,
      { z: -0.15 },
      { z: -0.23, duration: 0.15, yoyo: true, repeat: 5, ease: 'power1.inOut' }
    );
  };

  const handleMugClick = (e: any) => {
    e.stopPropagation();
    if (!mugGroupRef.current) return;
    
    // Cute coffee cup bounce-hop
    const baseVal = mugGroupRef.current.position.y;
    gsap.fromTo(mugGroupRef.current.position,
      { y: baseVal },
      { 
        y: baseVal + 0.06, 
        duration: 0.12, 
        yoyo: true, 
        repeat: 1, 
        ease: 'power2.out' 
      }
    );
  };

  return (
    <group>
      {/* ==========================================
          1. COFFEE STATION: ESPRESSO MACHINE
          Includes a small wooden side table when active.
          ========================================== */}
      <AnimatedLifestyle active={hasCoffeeMachine} defaultPosition={[-1.35, 0, 0.1]} defaultRotation={[0, Math.PI / 6, 0]}>
        <DraggableAsset itemId="coffee-machine" surface="floor" parentPosition={[-1.35, -0.5, 0.1]}>
          <group>
          {/* Side Table Top (Eco Raw Teak Wood Cylinder) */}
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.03, 24]} />
            <meshStandardMaterial color="#854d0e" roughness={0.5} />
          </mesh>
          {/* Side Table Legs (Three thin black steel legs) */}
          <mesh position={[-0.14, 0.3, 0.08]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.6, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0.14, 0.3, 0.08]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.6, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.3, -0.16]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.6, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
          </mesh>

          {/* Barista Pro Espresso Machine */}
          <group position={[0, 0.615, 0]}>
            {/* Stainless Steel Main Body */}
            <mesh position={[0, 0.11, 0]} castShadow>
              <boxGeometry args={[0.22, 0.22, 0.22]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Dark front console panel */}
            <mesh position={[0, 0.13, 0.111]} castShadow>
              <boxGeometry args={[0.18, 0.12, 0.005]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>
            {/* Small pressure dial/gauge */}
            <mesh position={[-0.05, 0.13, 0.115]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.002, 12]} />
              <meshStandardMaterial color="#ebdcb9" metalness={0.2} roughness={0.3} />
            </mesh>
            {/* Chrome group head */}
            <mesh position={[0, 0.06, 0.07]} rotation={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Portafilter Handle (sticks out) */}
            <mesh position={[0.06, 0.06, 0.1]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <boxGeometry args={[0.1, 0.012, 0.015]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
            {/* Bottom Drip Tray Grid */}
            <mesh position={[0, 0.005, 0.04]} castShadow>
              <boxGeometry args={[0.2, 0.01, 0.12]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Back transparent water reservoir */}
            <mesh position={[0, 0.13, -0.09]} castShadow>
              <boxGeometry args={[0.18, 0.18, 0.04]} />
              <meshStandardMaterial color="#bae6fd" transparent opacity={0.65} roughness={0.1} />
            </mesh>
          </group>
        </group>
        </DraggableAsset>
      </AnimatedLifestyle>

      {/* ==========================================
          2. COFFEE STATION: CERAMIC NOMAD MUG
          Placed on the side table if coffee machine is active,
          otherwise placed on the main desk next to the keyboard.
          ========================================== */}
      {/* If table is active, position is on the side table: [-1.35, 0.615, 0.12]
          If table is NOT active, position is on the main desk: [-0.65, 0.75, 0.15] */}
      <AnimatedLifestyle
        active={hasCoffeeMug}
        defaultPosition={mugDefaultPos}
        defaultRotation={hasCoffeeMachine ? [0, 0, 0] : [0, Math.PI / 12, 0]}
      >
        <DraggableAsset 
          itemId="coffee-mug" 
          surface={hasCoffeeMachine ? 'floor' : 'desk'} 
          parentPosition={hasCoffeeMachine ? [-1.35, -0.5, 0.12] : [-0.65, -0.5 + deskHeight + 0.03, 0.15]}
        >
          <group ref={mugGroupRef} onClick={handleMugClick}>
          {/* Dynamic rising steam vapour */}
          <SteamParticles position={[0, 0.05, 0]} />

          {/* Mug Cup Body (Pejaten Terracotta Sandstone finish) */}
          <mesh position={[0, 0.03, 0]} castShadow>
            <cylinderGeometry args={[0.024, 0.024, 0.06, 16]} />
            <meshStandardMaterial color="#ea580c" roughness={0.75} />
          </mesh>
          {/* Mug Handle */}
          <mesh position={[-0.024, 0.03, 0]} rotation={[0, 0, 0]} castShadow>
            <torusGeometry args={[0.018, 0.005, 8, 12, Math.PI * 2]} />
            <meshStandardMaterial color="#ea580c" roughness={0.75} />
          </mesh>
          {/* Interior hot liquid (Dark black coffee) */}
          <mesh position={[0, 0.058, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.002, 12]} />
            <meshStandardMaterial color="#1c1917" roughness={0.25} />
          </mesh>
        </group>
        </DraggableAsset>
      </AnimatedLifestyle>

      {/* ==========================================
          3. OUTDOOR GEAR: CANGGU CUSTOM SURFBOARD
          Leaning vertically against the back-left grid.
          ========================================== */}
      <AnimatedLifestyle
        active={hasSurfboard}
        defaultPosition={[-1.35, 0.8, -0.6]}
        defaultRotation={[0.15, 0.35, -0.15]}
      >
        <DraggableAsset itemId="outdoor-surfboard" surface="floor" parentPosition={[-1.35, -0.5, -0.6]}>
          <group ref={surfboardGroupRef} onClick={handleSurfboardClick}>
            {/* Surfboard Main Body with custom texture and glossy fiberglass finish */}
            <mesh geometry={surfboardGeometry} castShadow receiveShadow>
              {surfboardTexture ? (
                <meshStandardMaterial 
                  map={surfboardTexture} 
                  roughness={0.08} 
                  metalness={0.1} 
                />
              ) : (
                <meshStandardMaterial 
                  color="#fafaf9" 
                  roughness={0.12} 
                  metalness={0.08} 
                />
              )}
            </mesh>

            {/* Charcoal/Black Rubber Traction Tail Pad with raised kick tail and central arch bar */}
            <group>
              {/* Main Grip Pad */}
              <mesh 
                geometry={tailPadGeometry} 
                position={[0, -0.78, getSurfboardZSurface(-0.78, true) + 0.0015]} 
                rotation={[-0.05, 0, 0]}
                castShadow
              >
                <meshStandardMaterial color="#27272a" roughness={0.9} />
              </mesh>
              
              {/* Raised Kick Tail */}
              <mesh 
                position={[0, -0.91, getSurfboardZSurface(-0.91, true) + 0.008]} 
                rotation={[-0.2, 0, 0]}
                castShadow
              >
                <boxGeometry args={[0.11, 0.04, 0.015]} />
                <meshStandardMaterial color="#18181b" roughness={0.95} />
              </mesh>
              
              {/* Center Arch Bar */}
              <mesh 
                position={[0, -0.78, getSurfboardZSurface(-0.78, true) + 0.0045]} 
                rotation={[-0.05, 0, 0]}
                castShadow
              >
                <boxGeometry args={[0.012, 0.16, 0.005]} />
                <meshStandardMaterial color="#18181b" roughness={0.95} />
              </mesh>
            </group>

            {/* Leash Plug recessed in the deck near the tail */}
            <group position={[0, -1.0, getSurfboardZSurface(-1.0, true)]} rotation={[-0.06, 0, 0]}>
              {/* Recessed Plug Cup */}
              <mesh castShadow>
                <cylinderGeometry args={[0.009, 0.009, 0.004, 16]} />
                <meshStandardMaterial color="#18181b" roughness={0.7} />
              </mesh>
              {/* Tiny Metal Bar */}
              <mesh position={[0, 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.0012, 0.0012, 0.014, 8]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.15} />
              </mesh>
            </group>

            {/* Pro Thruster Fin Setup (Triple swept-back fin array on the bottom side) */}
            {/* Center Fin */}
            <mesh 
              geometry={finGeometry} 
              position={[0, -0.92, getSurfboardZSurface(-0.92, false) - 0.001]} 
              rotation={[Math.PI / 2, 0, Math.PI / 2]} 
              castShadow
            >
              <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.1} />
            </mesh>

            {/* Left Fin (toe-in and canted outwards) */}
            <mesh 
              geometry={finGeometry} 
              position={[-0.075, -0.82, getSurfboardZSurface(-0.82, false) - 0.001]} 
              rotation={[Math.PI / 2 + 0.1, -0.06, Math.PI / 2]} 
              castShadow
            >
              <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.1} />
            </mesh>

            {/* Right Fin (toe-in and canted outwards) */}
            <mesh 
              geometry={finGeometry} 
              position={[0.075, -0.82, getSurfboardZSurface(-0.82, false) - 0.001]} 
              rotation={[Math.PI / 2 - 0.1, 0.06, Math.PI / 2]} 
              castShadow
            >
              <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.1} />
            </mesh>
          </group>
        </DraggableAsset>
      </AnimatedLifestyle>

      {/* ==========================================
          4. OUTDOOR GEAR: RETRO HONDA SCOOPY SCOOTER
          Parked on the floor to the right of the desk.
          ========================================== */}
      <AnimatedLifestyle active={hasScooter} defaultPosition={[1.35, 0, 0.4]} defaultRotation={[0, -Math.PI / 5, 0]}>
        <DraggableAsset itemId="outdoor-scooter" surface="floor" parentPosition={[1.35, -0.5, 0.4]}>
          <group ref={scooterGroupRef} onClick={handleScooterClick}>
          {/* Rear Fat Wheel */}
          <group position={[0, 0.16, -0.36]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
              <meshStandardMaterial color="#1c1917" roughness={0.9} />
            </mesh>
            {/* White-wall ring tire detail */}
            <mesh position={[0, 0.041, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.002, 12]} />
              <meshStandardMaterial color="#fafaf9" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.041, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.002, 12]} />
              <meshStandardMaterial color="#fafaf9" roughness={0.8} />
            </mesh>
          </group>

          {/* Front Fat Wheel */}
          <group position={[0, 0.16, 0.36]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
              <meshStandardMaterial color="#1c1917" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.041, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.002, 12]} />
              <meshStandardMaterial color="#fafaf9" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.041, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.002, 12]} />
              <meshStandardMaterial color="#fafaf9" roughness={0.8} />
            </mesh>
          </group>

          {/* Scooter Floorboard Chassis */}
          <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.18, 0.04, 0.44]} />
            <meshStandardMaterial color="#1e293b" roughness={0.85} /> {/* Dark grey rubber floor mats */}
          </mesh>

          {/* Main Retro Engine Body cover (Gorgeous mint green cylinder) */}
          <group position={[0, 0.33, -0.18]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.14, 0.14, 0.36, 16]} />
              <meshStandardMaterial color="#86efac" roughness={0.2} metalness={0.2} /> {/* Retro mint-green */}
            </mesh>
            <mesh position={[0, 0, -0.18]} castShadow>
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshStandardMaterial color="#86efac" roughness={0.2} />
            </mesh>
          </group>

          {/* Premium Nomad Tan Leather Dual Seat */}
          <mesh position={[0, 0.48, -0.15]} castShadow>
            <boxGeometry args={[0.13, 0.06, 0.34]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} /> {/* Rich tan leather */}
          </mesh>

          {/* Front Shield & Steering Fork Column */}
          <group position={[0, 0.42, 0.22]}>
            {/* Fork column */}
            <mesh position={[0, 0.14, 0.04]} rotation={[0.2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.42, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.1} />
            </mesh>
            {/* Retro Mint Green Front Apron Shield */}
            <mesh position={[0, 0.12, 0.08]} rotation={[0.18, 0, 0]} castShadow>
              <boxGeometry args={[0.22, 0.38, 0.024]} />
              <meshStandardMaterial color="#86efac" roughness={0.2} />
            </mesh>
            {/* Front fender mudguard */}
            <mesh position={[0, -0.14, 0.1]} castShadow>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshStandardMaterial color="#86efac" roughness={0.2} />
            </mesh>
          </group>

          {/* Handlebars with tan rubber grips */}
          <group position={[0, 0.74, 0.26]}>
            {/* Horizontal Chrome handlebar */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.01, 0.01, 0.32, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Left Grip */}
            <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.05, 8]} />
              <meshStandardMaterial color="#78350f" roughness={0.7} />
            </mesh>
            {/* Right Grip */}
            <mesh position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.05, 8]} />
              <meshStandardMaterial color="#78350f" roughness={0.7} />
            </mesh>
            {/* Circular chrome mirrors */}
            <mesh position={[0.1, 0.1, -0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.005, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[-0.1, 0.1, -0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.005, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>

          {/* Large Retro Circular Headlight */}
          <group position={[0, 0.66, 0.36]}>
            {/* Chrome bezel */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Glass Lens (Warm glowing in night mode) */}
            <mesh position={[0, 0, 0.016]}>
              <sphereGeometry args={[0.036, 12, 12]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#fef08a"
                emissiveIntensity={isNight ? 2.8 : 0.2}
                roughness={0.1}
              />
            </mesh>
            {/* Real headlight beam in night mode */}
            {isNight && (
              <spotLight
                position={[0, 0, 0.02]}
                angle={Math.PI / 6}
                penumbra={0.5}
                intensity={4.0}
                color="#fef08a"
                distance={3.5}
              />
            )}
          </group>
        </group>
        </DraggableAsset>
      </AnimatedLifestyle>

      {/* ==========================================
          5. RELAX ZONE: TROPICAL HEMP BEAN BAG
          Soft supportive bean bag placed on the floor to the left.
          ========================================== */}
      <AnimatedLifestyle active={hasBeanBag} defaultPosition={[-1.2, 0, 0.5]} defaultRotation={[0, Math.PI / 4, 0]}>
        <DraggableAsset itemId="relax-beanbag" surface="floor" parentPosition={[-1.2, -0.5, 0.5]}>
          <group>
          {/* Organic Teardrop Bean Bag shape using multiple stacked, deformed spheres */}
          {/* Bottom fat pouch */}
          <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.26, 16, 16]} />
            <group scale={[1.4, 0.8, 1.4]}>
              <meshStandardMaterial color="#ea580c" roughness={0.95} /> {/* Terracotta Hemp fabric */}
            </group>
          </mesh>
          {/* Middle pouch */}
          <mesh position={[0, 0.22, -0.04]} castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <group scale={[1.2, 0.9, 1.2]}>
              <meshStandardMaterial color="#ea580c" roughness={0.95} />
            </group>
          </mesh>
          {/* Top pointed tip */}
          <mesh position={[0, 0.32, -0.08]} castShadow>
            <sphereGeometry args={[0.13, 16, 16]} />
            <group scale={[1.0, 1.2, 1.0]}>
              <meshStandardMaterial color="#ea580c" roughness={0.95} />
            </group>
          </mesh>
          {/* Handle strap (Teak fabric) */}
          <mesh position={[0, 0.4, -0.1]} rotation={[0.4, 0, 0]} castShadow>
            <torusGeometry args={[0.025, 0.006, 6, 12, Math.PI * 1.5]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
        </group>
        </DraggableAsset>
      </AnimatedLifestyle>

      {/* ==========================================
          6. RELAX ZONE: NOMAD BASS BLUETOOTH SPEAKER
          Desk accessory positioned next to the computer/keyboard setup.
          ========================================== */}
      {/* Placed inside Desk tabletop space coordinate frame. Tabletop y = 0.75 relative to floor.
          Since this is a desk accessory, it will be animated inside the moving desk group!
          Wait, we implement it here but offset it to stand on the desk!
          Wait, if we render it here, we should hook into `deskHeight` to elevate it correctly!
          Let's find out: the selectedDeskId determines if deskHeight is 1.15 (Bamboo) or 0.72 (Walnut).
          Let's dynamically offset this item based on selectedDeskId so it stands perfectly on the desk tabletop! */}
      {(() => {
        const { selectedDeskId } = useConfigurator();
        const deskHeight = selectedDeskId === 'desk-bamboo' ? 1.15 : 0.72;
        return (
          <AnimatedLifestyle
            active={hasSpeaker}
            defaultPosition={[-0.45, deskHeight + 0.03, 0.16]}
            defaultRotation={[0, -Math.PI / 10, 0]}
          >
            <DraggableAsset itemId="relax-speaker" surface="desk" parentPosition={[-0.45, -0.5 + deskHeight + 0.03, 0.16]}>
              <group>
              {/* Horizontal Pill Speaker (Sand Woven Fabric Cover) */}
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.026, 0.026, 0.14, 16]} />
                <meshStandardMaterial color="#ebdcb9" roughness={0.9} /> {/* Warm sand fabric */}
              </mesh>
              {/* Left rubber cap */}
              <mesh position={[-0.071, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.027, 0.027, 0.006, 12]} />
                <meshStandardMaterial color="#292524" roughness={0.6} /> {/* Dark grey rubber */}
              </mesh>
              {/* Right rubber cap */}
              <mesh position={[0.071, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.027, 0.027, 0.006, 12]} />
                <meshStandardMaterial color="#292524" roughness={0.6} />
              </mesh>
              {/* Small glowing power LED (emits blue light in night mode) */}
              <mesh position={[0, 0.025, 0.005]}>
                <sphereGeometry args={[0.003, 8, 8]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#06b6d4"
                  emissiveIntensity={isNight ? 2.5 : 0.2}
                />
              </mesh>
            </group>
            </DraggableAsset>
          </AnimatedLifestyle>
        );
      })()}

      {/* ==========================================
          7. GARAGE SPACE: HEAVY DUTY GEAR SHELF
          A tall industrial metal shelf on the floor to the far left.
          ========================================== */}
      <AnimatedLifestyle
        active={hasShelf}
        defaultPosition={[-1.75, 0, -0.15]}
        defaultRotation={[0, Math.PI / 4, 0]}
      >
        <DraggableAsset itemId="garage-shelf" surface="floor" parentPosition={[-1.75, -0.5, -0.15]}>
          <group>
          {/* Black powder-coated steel posts at corners */}
          <mesh position={[-0.2, 0.7, -0.15]} castShadow>
            <boxGeometry args={[0.02, 1.4, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.7} />
          </mesh>
          <mesh position={[0.2, 0.7, -0.15]} castShadow>
            <boxGeometry args={[0.02, 1.4, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.7} />
          </mesh>
          <mesh position={[-0.2, 0.7, 0.15]} castShadow>
            <boxGeometry args={[0.02, 1.4, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.7} />
          </mesh>
          <mesh position={[0.2, 0.7, 0.15]} castShadow>
            <boxGeometry args={[0.02, 1.4, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.7} />
          </mesh>

          {/* Shelves (Sustainable Teak Wood Panels) */}
          {/* Shelf 1 (Low) */}
          <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.015, 0.32]} />
            <meshStandardMaterial color="#78350f" roughness={0.65} />
          </mesh>
          {/* Shelf 2 (Mid-low) */}
          <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.015, 0.32]} />
            <meshStandardMaterial color="#78350f" roughness={0.65} />
          </mesh>
          {/* Shelf 3 (Mid-high) */}
          <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.015, 0.32]} />
            <meshStandardMaterial color="#78350f" roughness={0.65} />
          </mesh>
          {/* Shelf 4 (High) */}
          <mesh position={[0, 1.32, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.015, 0.32]} />
            <meshStandardMaterial color="#78350f" roughness={0.65} />
          </mesh>

          {/* Simulated storage organizers on the shelf */}
          {/* Sand canvas basket on lowest shelf */}
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.34, 0.16, 0.26]} />
            <meshStandardMaterial color="#d6d3d1" roughness={0.8} />
          </mesh>
          {/* Minimalist storage box on second shelf */}
          <mesh position={[-0.06, 0.62, 0.02]} castShadow>
            <boxGeometry args={[0.22, 0.16, 0.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          {/* Potted succulent plant on third shelf */}
          <group position={[0.08, 0.98, -0.04]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.04, 0.03, 0.08, 12]} />
              <meshStandardMaterial color="#a8a29e" roughness={0.7} />
            </mesh>
            {/* Succulent green dome */}
            <mesh position={[0, 0.05, 0]}>
              <sphereGeometry args={[0.036, 8, 8]} />
              <meshStandardMaterial color="#15803d" roughness={0.6} />
            </mesh>
          </group>
        </group>
        </DraggableAsset>
      </AnimatedLifestyle>

      {/* ==========================================
          8. GARAGE SPACE: WORKSPACE PEGBOARD PANEL
          Mounts on the backing wall frame, behind the desk.
          ========================================== */}
      <AnimatedLifestyle active={hasPegboard} defaultPosition={[0, 1.45, -0.58]}>
        <group>
          {/* Sturdy Wood Backing Panel */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.58, 0.018]} />
            <meshStandardMaterial color="#eed9b3" roughness={0.7} /> {/* Natural birch plywood */}
          </mesh>

          {/* Peg hooks grid details (represented as neat structural strips) */}
          <mesh position={[0, 0.18, 0.012]} castShadow>
            <boxGeometry args={[1.4, 0.015, 0.008]} />
            <meshStandardMaterial color="#a1a1aa" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.02, 0.012]} castShadow>
            <boxGeometry args={[1.4, 0.015, 0.008]} />
            <meshStandardMaterial color="#a1a1aa" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.14, 0.012]} castShadow>
            <boxGeometry args={[1.4, 0.015, 0.008]} />
            <meshStandardMaterial color="#a1a1aa" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* Small customized pegboard attachments */}
          {/* Mini Birch Wooden Shelf hanging on left */}
          <mesh position={[-0.42, 0.08, 0.05]} castShadow>
            <boxGeometry args={[0.3, 0.012, 0.08]} />
            <meshStandardMaterial color="#854d0e" roughness={0.6} />
          </mesh>
          {/* Two tiny canisters / pots on shelf */}
          <mesh position={[-0.48, 0.12, 0.05]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.06, 10]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.4} /> {/* Light blue cup */}
          </mesh>
          <mesh position={[-0.38, 0.11, 0.05]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.04, 10]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>

          {/* Hanging Tools/Accoutrements (represented procedurally) */}
          {/* Yellow scissors hanging on peg */}
          <group position={[0.2, -0.04, 0.015]} rotation={[0, 0, -0.1]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[0.018, 0.006, 6, 12]} />
              <meshStandardMaterial color="#eab308" roughness={0.5} />
            </mesh>
          </group>

          {/* Coiled black audio patch cable hanging on right */}
          <mesh position={[0.48, -0.06, 0.025]} rotation={[0, 0, 0]} castShadow>
            <torusGeometry args={[0.046, 0.008, 6, 24]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>
      </AnimatedLifestyle>
    </group>
  );
}
