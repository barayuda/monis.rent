'use client';

import React, { useRef, useEffect } from 'react';
import { useConfigurator } from '@/context/ConfiguratorContext';
import gsap from 'gsap';
import * as THREE from 'three';
import DraggableAsset from './DraggableAsset';

// Custom interface for Accessory props
interface AnimatedAccessoryProps {
  active: boolean;
  defaultPosition: [number, number, number];
  children: React.ReactNode;
}

// Reusable animated wrapper to handle smooth GSAP spring drop-in and fly-up transitions
const AnimatedAccessory: React.FC<AnimatedAccessoryProps> = ({ active, defaultPosition, children }) => {
  const groupRef = useRef<THREE.Group>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!groupRef.current) return;

    const [x, y, z] = defaultPosition;

    if (active) {
      // Bring in: drop down from the top + scale up with spring back
      if (!hasMounted.current) {
        groupRef.current.position.set(x, y + 2.2, z);
        groupRef.current.scale.set(0.001, 0.001, 0.001);
        
        gsap.to(groupRef.current.position, {
          x, y, z,
          duration: 0.95,
          ease: 'back.out(1.5)',
        });
        gsap.to(groupRef.current.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.95,
          ease: 'back.out(1.5)',
        });
        hasMounted.current = true;
      } else {
        gsap.to(groupRef.current.position, {
          x, y, z,
          duration: 0.85,
          ease: 'back.out(1.4)',
        });
        gsap.to(groupRef.current.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.85,
          ease: 'back.out(1.4)',
        });
      }
    } else {
      // Scale down + fly upwards away from screen
      if (hasMounted.current) {
        gsap.to(groupRef.current.position, {
          y: y + 2.2,
          duration: 0.7,
          ease: 'power2.in',
        });
        gsap.to(groupRef.current.scale, {
          x: 0.001, y: 0.001, z: 0.001,
          duration: 0.7,
          ease: 'power2.in',
        });
      } else {
        // Initial state is inactive: hide immediately above
        groupRef.current.position.set(x, y + 2.2, z);
        groupRef.current.scale.set(0.001, 0.001, 0.001);
        hasMounted.current = true;
      }
    }
  }, [active, defaultPosition]);

  return <group ref={groupRef}>{children}</group>;
};

// --- Beautiful Organic Procedural Split-Leaf Monstera Leaf Component ---
interface MonsteraLeafProps {
  scale?: [number, number, number];
}

const MonsteraLeaf: React.FC<MonsteraLeafProps> = ({ scale = [1, 1, 1] }) => {
  return (
    <group scale={scale}>
      {/* Central main spine (tapering midrib) */}
      <mesh castShadow receiveShadow position={[0, 0, 0.1]}>
        <boxGeometry args={[0.008, 0.003, 0.22]} />
        <meshStandardMaterial color="#059669" roughness={0.6} />
      </mesh>
      
      {/* Lobe 1 (Bottom Left) */}
      <mesh castShadow position={[-0.04, 0, 0.03]} rotation={[0, 0, 0.6]} receiveShadow>
        <boxGeometry args={[0.08, 0.002, 0.024]} />
        <meshStandardMaterial color="#047857" roughness={0.7} />
      </mesh>
      
      {/* Lobe 2 (Bottom Right) */}
      <mesh castShadow position={[0.04, 0, 0.03]} rotation={[0, 0, -0.6]} receiveShadow>
        <boxGeometry args={[0.08, 0.002, 0.024]} />
        <meshStandardMaterial color="#047857" roughness={0.7} />
      </mesh>
      
      {/* Lobe 3 (Middle Left) */}
      <mesh castShadow position={[-0.05, 0, 0.09]} rotation={[0, 0, 0.35]} receiveShadow>
        <boxGeometry args={[0.1, 0.002, 0.028]} />
        <meshStandardMaterial color="#047857" roughness={0.7} />
      </mesh>
      
      {/* Lobe 4 (Middle Right) */}
      <mesh castShadow position={[0.05, 0, 0.09]} rotation={[0, 0, -0.35]} receiveShadow>
        <boxGeometry args={[0.1, 0.002, 0.028]} />
        <meshStandardMaterial color="#047857" roughness={0.7} />
      </mesh>

      {/* Lobe 5 (Top Left) */}
      <mesh castShadow position={[-0.04, 0, 0.15]} rotation={[0, 0, 0.15]} receiveShadow>
        <boxGeometry args={[0.09, 0.002, 0.026]} />
        <meshStandardMaterial color="#047857" roughness={0.7} />
      </mesh>
      
      {/* Lobe 6 (Top Right) */}
      <mesh castShadow position={[0.04, 0, 0.15]} rotation={[0, 0, -0.15]} receiveShadow>
        <boxGeometry args={[0.09, 0.002, 0.026]} />
        <meshStandardMaterial color="#047857" roughness={0.7} />
      </mesh>
      
      {/* Lobe 7 (Tip / Terminal cap) */}
      <mesh castShadow position={[0, 0, 0.2]} receiveShadow>
        <boxGeometry args={[0.035, 0.002, 0.05]} />
        <meshStandardMaterial color="#047857" roughness={0.7} />
      </mesh>
    </group>
  );
};

export default function AccessoryModel() {
  const { selectedAccessoryIds, dayNightMode } = useConfigurator();

  // Programmatically construct high-fidelity active screen textures via HTML5 Canvas
  const screenTextures = React.useMemo(() => {
    if (typeof window === 'undefined') return null;

    // Helper to generate a code editor IDE screen texture
    const createIDETexture = (width: number, height: number, type: 'full' | 'sidebar' | 'code' | 'terminal') => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Dark slate background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      if (type === 'sidebar' || type === 'full') {
        // Draw file tree directory sidebar
        ctx.fillStyle = '#1e293b';
        const sidebarWidth = type === 'full' ? Math.round(width * 0.22) : width;
        ctx.fillRect(0, 0, sidebarWidth, height);

        // Sidebar EXPLORER header
        ctx.fillStyle = '#64748b';
        ctx.font = `bold ${Math.max(10, Math.round(height * 0.045))}px monospace`;
        ctx.fillText('EXPLORER: MONIS', 12, 25);

        // Fake folder tree
        const treeItems = [
          { name: '📁 src', indent: 10, color: '#38bdf8' },
          { name: '  📁 components', indent: 18, color: '#38bdf8' },
          { name: '    📄 Workspace.tsx', indent: 26, color: '#fbbf24' },
          { name: '    📄 AccessoryModel.tsx', indent: 26, color: '#fbbf24' },
          { name: '  📁 styles', indent: 18, color: '#38bdf8' },
          { name: '    📄 main.css', indent: 26, color: '#34d399' },
          { name: '  📄 App.tsx', indent: 18, color: '#fbbf24' },
          { name: '📄 package.json', indent: 10, color: '#ef4444' },
        ];

        let yOffset = 50;
        ctx.font = `${Math.max(9, Math.round(height * 0.038))}px monospace`;
        treeItems.forEach((item) => {
          ctx.fillStyle = item.color;
          ctx.fillText(item.name, item.indent, yOffset);
          yOffset += Math.round(height * 0.082);
        });
      }

      if (type === 'code' || type === 'full') {
        const codeStartX = type === 'full' ? Math.round(width * 0.25) : 15;
        const codeWidth = type === 'full' ? Math.round(width * 0.75) : width;

        // Draw top tab headers
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(codeStartX - 10, 0, codeWidth + 10, 32);

        // Open file tab
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(codeStartX - 10, 0, 150, 32);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '10px monospace';
        ctx.fillText('Workspace.tsx ×', codeStartX + 10, 20);

        // Inactive tab
        ctx.fillStyle = '#64748b';
        ctx.fillText('main.css', codeStartX + 160, 20);

        // Code code block with syntax highlights
        let yOffset = 55;
        ctx.font = `bold ${Math.max(10, Math.round(height * 0.042))}px monospace`;

        const codeLines = [
          { text: 'import React from "react";', color: '#c084fc' },
          { text: 'import { Canvas } from "@react-three/fiber";', color: '#c084fc' },
          { text: '', color: '' },
          { text: 'export const DreamWorkspace = () => {', color: '#f43f5e' },
          { text: '  const { items } = useConfigurator();', color: '#38bdf8' },
          { text: '  ', color: '' },
          { text: '  return (', color: '#f43f5e' },
          { text: '    <div className="bali-vibes-setup">', color: '#34d399' },
          { text: '      <Canvas shadowMap camera={{ pos: [0, 5] }}>', color: '#fbbf24' },
          { text: '        <ambientLight intensity={0.5} />', color: '#fbbf24' },
          { text: '        <BaliOffice items={items} />', color: '#38bdf8' },
          { text: '      </Canvas>', color: '#fbbf24' },
          { text: '    </div>', color: '#34d399' },
          { text: '  );', color: '#f43f5e' },
          { text: '};', color: '#f43f5e' },
        ];

        codeLines.forEach((line, index) => {
          // Line numbers gutter
          ctx.fillStyle = '#475569';
          ctx.fillText((index + 1).toString().padStart(2, ' '), codeStartX - 10, yOffset);

          // Line code
          ctx.fillStyle = line.color || '#f8fafc';
          ctx.fillText(line.text, codeStartX + 20, yOffset);
          yOffset += Math.round(height * 0.062);
        });

        // Glowing cyan cursor caret
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(codeStartX + 310, 115, 2, 14);
      }

      if (type === 'terminal') {
        // Draw terminal text with logs
        let yOffset = 25;
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('canggu-developer@monis-bali:~$ npm run dev', 12, yOffset);
        yOffset += 25;

        ctx.font = '10px monospace';
        const terminalLines = [
          { text: '▲ [next] Ready in 1.2s (http://localhost:3000)', color: '#fbbf24' },
          { text: '✔ Dynamic 3D visualizer assets initialized.', color: '#34d399' },
          { text: '✔ R3F canvas hook running at 60fps stable.', color: '#34d399' },
          { text: 'ℹ WebGLRenderer target: shadowMap true', color: '#38bdf8' },
          { text: '✔ Tailwind v4 reference compiled.', color: '#34d399' },
          { text: '✨ Live reload server waiting for changes...', color: '#60a5fa' }
        ];

        terminalLines.forEach((line) => {
          ctx.fillStyle = line.color;
          ctx.fillText(line.text, 12, yOffset);
          yOffset += 20;
        });
      }

      // VSCode-style status bar at bottom
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, height - 18, width, 18);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '9px sans-serif';
      ctx.fillText(' 🔀 master* | UTF-8 | TypeScript JSX | Ln 5, Col 24 | Prettier ✔', 8, height - 5);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      return texture;
    };

    // Helper to generate a Dashboard/Analytics screen texture
    const createDashboardTexture = (width: number, height: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Dark slate background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Top Header
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, 45);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('MONIS RENTAL METRICS & ANALYTICS', 15, 26);

      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('60FPS STABLE LIVE CONSOLE', width - 160, 25);

      // Draw Grid for coordinate curve graph
      const gX = 15;
      const gY = 60;
      const gW = Math.round(width * 0.62);
      const gH = height - 85;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;

      // Grid vertical lines
      for (let x = gX; x <= gX + gW; x += gW / 5) {
        ctx.beginPath();
        ctx.moveTo(x, gY);
        ctx.lineTo(x, gY + gH);
        ctx.stroke();
      }
      // Grid horizontal lines
      for (let y = gY; y <= gY + gH; y += gH / 4) {
        ctx.beginPath();
        ctx.moveTo(gX, y);
        ctx.lineTo(gX + gW, y);
        ctx.stroke();
      }

      // Draw Glowing Analytics coordinates curve
      // Teal Curve (#14b8a6)
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gX, gY + gH * 0.75);
      for (let i = 0; i <= 60; i++) {
        const x = gX + (i / 60) * gW;
        const ratio = i / 60;
        const y = gY + gH * (0.65 - Math.sin(ratio * Math.PI * 2.2) * 0.22 - ratio * 0.15);
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Translucent area fill under curve
      ctx.fillStyle = 'rgba(20, 184, 166, 0.08)';
      ctx.lineTo(gX + gW, gY + gH);
      ctx.lineTo(gX, gY + gH);
      ctx.closePath();
      ctx.fill();

      // Right panels (Metrics & Doughnut chart)
      const rX = gX + gW + 15;
      const rW = width - rX - 15;

      // Metric box 1 (Conversion Rate)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rX, 60, rW, 50);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px sans-serif';
      ctx.fillText('CONVERSION', rX + 10, 75);
      ctx.fillStyle = '#10b981'; // vibrant green
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('14.82% ▲', rX + 10, 98);

      // Metric box 2 (Doughnut KPI)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rX, 122, rW, height - 142);

      // Draw circular progress doughnut
      const cX = rX + rW / 2;
      const cY = 170;
      const rad = 24;

      // Inner gray base circle
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cX, cY, rad, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing amber progress arc (82%)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cX, cY, rad, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.82);
      ctx.stroke();

      // Inside progress text
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('82%', cX, cY);

      // Doughnut label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px sans-serif';
      ctx.fillText('OCCUPANCY', cX, cY + rad + 14);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      return texture;
    };

    return {
      ultrawideLeft: createIDETexture(256, 256, 'sidebar'),
      ultrawideCenter: createIDETexture(512, 256, 'code'),
      ultrawideRight: createIDETexture(256, 256, 'terminal'),
      dualLeft: createIDETexture(512, 256, 'full'),
      dualRight: createDashboardTexture(512, 256),
    };
  }, []);

  const hasUltrawide = selectedAccessoryIds.includes('tech-ultrawide');
  const hasDual = selectedAccessoryIds.includes('tech-dual');
  const hasInput = selectedAccessoryIds.includes('tech-input');
  const hasAudio = selectedAccessoryIds.includes('tech-audio');
  const hasLamp = selectedAccessoryIds.includes('eco-lamp');
  const hasPlant = selectedAccessoryIds.includes('eco-plant');

  // Interactive Refs for micro-animations
  const plantGroupRef = useRef<THREE.Group>(null);
  const lampGroupRef = useRef<THREE.Group>(null);
  const audioLeftRef = useRef<THREE.Group>(null);
  const audioRightRef = useRef<THREE.Group>(null);
  const headphonesRef = useRef<THREE.Group>(null);

  const handlePlantClick = (e: any) => {
    e.stopPropagation();
    if (!plantGroupRef.current) return;
    
    // Tropical rustle sway
    gsap.fromTo(plantGroupRef.current.rotation,
      { y: 0 },
      {
        y: 0.15,
        duration: 0.15,
        yoyo: true,
        repeat: 3,
        ease: 'power1.inOut',
        onComplete: () => {
          if (plantGroupRef.current) gsap.to(plantGroupRef.current.rotation, { y: 0, duration: 0.2 });
        }
      }
    );
    // Soft organic squash/stretch
    gsap.fromTo(plantGroupRef.current.scale,
      { x: 1, y: 1, z: 1 },
      { x: 1.04, y: 0.95, z: 1.04, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }
    );
  };

  const handleLampClick = (e: any) => {
    e.stopPropagation();
    if (!lampGroupRef.current) return;
    
    // Nod/shake head bounce
    gsap.fromTo(lampGroupRef.current.rotation,
      { x: 0 },
      { x: 0.15, duration: 0.12, yoyo: true, repeat: 1, ease: 'back.out(1.8)' }
    );
  };

  const handleAudioLeftClick = (e: any) => {
    e.stopPropagation();
    if (!audioLeftRef.current) return;
    gsap.fromTo(audioLeftRef.current.scale,
      { x: 1, y: 1, z: 1 },
      { x: 1.06, y: 1.06, z: 1.06, duration: 0.08, yoyo: true, repeat: 1, ease: 'power2.out' }
    );
  };

  const handleAudioRightClick = (e: any) => {
    e.stopPropagation();
    if (!audioRightRef.current) return;
    gsap.fromTo(audioRightRef.current.scale,
      { x: 1, y: 1, z: 1 },
      { x: 1.06, y: 1.06, z: 1.06, duration: 0.08, yoyo: true, repeat: 1, ease: 'power2.out' }
    );
  };

  const handleHeadphonesClick = (e: any) => {
    e.stopPropagation();
    if (!headphonesRef.current) return;
    gsap.fromTo(headphonesRef.current.rotation,
      { z: 0 },
      { z: 0.1, duration: 0.12, yoyo: true, repeat: 3, ease: 'power1.inOut',
        onComplete: () => {
          if (headphonesRef.current) gsap.to(headphonesRef.current.rotation, { z: 0, duration: 0.2 });
        }
      }
    );
  };

  return (
    <group position={[0, 0.03, 0]}>
      {/* ==========================================
          1. 34" CURVED ULTRAWIDE MONITOR
          ========================================== */}
      <AnimatedAccessory active={hasUltrawide && !hasDual} defaultPosition={[0, 0, -0.32]}>
        <group>
          {/* Heavy metal central flat clamp stand base */}
          <mesh position={[0, 0.01, -0.15]} castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.015, 0.22]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
          </mesh>
          
          {/* Articulated hydraulic gas arm */}
          <mesh position={[0, 0.24, -0.22]} rotation={[-0.15, 0, 0]} castShadow>
            <boxGeometry args={[0.045, 0.44, 0.045]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
          </mesh>

          {/* Curved Ultrawide Display Structure */}
          {/* We assemble three slightly angled segments to simulate an immersive curve */}
          <group position={[0, 0.45, -0.1]}>
            {/* Center Panel */}
            <mesh position={[0, 0, -0.045]} castShadow>
              <boxGeometry args={[0.62, 0.46, 0.035]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, -0.026]}>
              <boxGeometry args={[0.60, 0.44, 0.005]} />
              {screenTextures ? (
                <meshBasicMaterial map={screenTextures.ultrawideCenter} />
              ) : (
                <meshStandardMaterial color="#020617" emissive="#0284c7" emissiveIntensity={0.3} roughness={0.9} />
              )}
            </mesh>

            {/* Left Angled Panel */}
            <group position={[-0.52, 0, -0.012]} rotation={[0, 0.18, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.48, 0.46, 0.035]} />
                <meshStandardMaterial color="#0f172a" roughness={0.5} />
              </mesh>
              {/* Screen Glow code editor simulation */}
              <mesh position={[0, 0, 0.019]}>
                <boxGeometry args={[0.46, 0.44, 0.005]} />
                {screenTextures ? (
                  <meshBasicMaterial map={screenTextures.ultrawideLeft} />
                ) : (
                  <meshStandardMaterial color="#020617" emissive="#10b981" emissiveIntensity={0.45} roughness={0.9} />
                )}
              </mesh>
            </group>

            {/* Right Angled Panel */}
            <group position={[0.52, 0, -0.012]} rotation={[0, -0.18, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.48, 0.46, 0.035]} />
                <meshStandardMaterial color="#0f172a" roughness={0.5} />
              </mesh>
              {/* Screen Glow charts simulation */}
              <mesh position={[0, 0, 0.019]}>
                <boxGeometry args={[0.46, 0.44, 0.005]} />
                {screenTextures ? (
                  <meshBasicMaterial map={screenTextures.ultrawideRight} />
                ) : (
                  <meshStandardMaterial color="#020617" emissive="#3b82f6" emissiveIntensity={0.4} roughness={0.9} />
                )}
              </mesh>
            </group>
          </group>
        </group>
      </AnimatedAccessory>

      {/* ==========================================
          2. DUAL 27" MULTI-MONITOR SETUP
          ========================================== */}
      <AnimatedAccessory active={hasDual} defaultPosition={[0, 0, -0.32]}>
        <group>
          {/* Sturdy dual desk base clamp */}
          <mesh position={[0, 0.01, -0.15]} castShadow receiveShadow>
            <boxGeometry args={[0.26, 0.015, 0.22]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* Central Mounting Column */}
          <mesh position={[0, 0.26, -0.2]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.48, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.9} />
          </mesh>

          {/* Dual Gas-Spring Arms */}
          {/* Left Arm */}
          <mesh position={[-0.26, 0.35, -0.12]} rotation={[0, -0.5, 0]} castShadow>
            <boxGeometry args={[0.46, 0.03, 0.03]} />
            <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
          </mesh>
          {/* Right Arm */}
          <mesh position={[0.26, 0.35, -0.12]} rotation={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.46, 0.03, 0.03]} />
            <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
          </mesh>

          {/* LEFT 27" MONITOR (Angled Inward, showing code editor) */}
          <group position={[-0.58, 0.43, -0.05]} rotation={[0, 0.26, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.74, 0.46, 0.03]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
            {/* Glowing active screen surface */}
            <mesh position={[0, 0, 0.016]}>
              <boxGeometry args={[0.71, 0.43, 0.005]} />
              {screenTextures ? (
                <meshBasicMaterial map={screenTextures.dualLeft} />
              ) : (
                <meshStandardMaterial color="#020617" emissive="#10b981" emissiveIntensity={0.45} roughness={0.9} />
              )}
            </mesh>
          </group>

          {/* RIGHT 27" MONITOR (Angled Inward, showing analytical chart) */}
          <group position={[0.58, 0.43, -0.05]} rotation={[0, -0.26, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.74, 0.46, 0.03]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
            {/* Glowing active screen surface */}
            <mesh position={[0, 0, 0.016]}>
              <boxGeometry args={[0.71, 0.43, 0.005]} />
              {screenTextures ? (
                <meshBasicMaterial map={screenTextures.dualRight} />
              ) : (
                <meshStandardMaterial color="#020617" emissive="#f59e0b" emissiveIntensity={0.35} roughness={0.9} />
              )}
            </mesh>
          </group>
        </group>
      </AnimatedAccessory>

      {/* ==========================================
          3. NOMAD TECH INPUT PACK (KEYBOARD, MOUSE, MAT)
          ========================================== */}
      <AnimatedAccessory active={hasInput} defaultPosition={[0, 0, 0.16]}>
        <DraggableAsset itemId="tech-input" surface="desk" parentPosition={[0, 0.03, 0.16]}>
          <group>
          {/* Warm Grey Premium Felt Desk Mat */}
          <mesh position={[0, 0.002, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.004, 0.58]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>

          {/* 75% Custom Mechanical Keyboard */}
          <group position={[0, 0.015, 0.02]} castShadow>
            {/* Bamboo Keyboard Base Shell */}
            <mesh castShadow>
              <boxGeometry args={[0.56, 0.026, 0.18]} />
              <meshStandardMaterial color="#b45309" roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Custom keycap matrix blocks */}
            {/* Charcoal alphas */}
            <mesh position={[0, 0.014, 0]}>
              <boxGeometry args={[0.51, 0.012, 0.15]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>
            {/* Beige/white functional keys overlay */}
            <mesh position={[-0.23, 0.015, -0.06]}>
              <boxGeometry args={[0.04, 0.012, 0.02]} />
              <meshStandardMaterial color="#ebdcb9" roughness={0.6} />
            </mesh>
            {/* Vibrant Amber Accent ESC key */}
            <mesh position={[-0.25, 0.016, 0.06]}>
              <boxGeometry args={[0.02, 0.012, 0.02]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.5} />
            </mesh>
            {/* Ocean Teal Accent Enter key */}
            <mesh position={[0.24, 0.016, -0.02]}>
              <boxGeometry args={[0.025, 0.012, 0.04]} />
              <meshStandardMaterial color="#0f766e" roughness={0.5} />
            </mesh>
          </group>

          {/* Ergonomic Wireless Solid Wood Mouse */}
          <group position={[0.48, 0.018, 0.02]} rotation={[0, -0.05, 0]} castShadow>
            {/* Mouse Shell Body */}
            <mesh castShadow>
              <boxGeometry args={[0.065, 0.03, 0.11]} />
              <meshStandardMaterial color="#78350f" roughness={0.4} metalness={0.1} />
            </mesh>
            {/* Left/Right wood split buttons */}
            <mesh position={[0, 0.01, 0.02]}>
              <boxGeometry args={[0.055, 0.015, 0.05]} />
              <meshStandardMaterial color="#b45309" roughness={0.3} />
            </mesh>
            {/* Metal scroll wheel */}
            <mesh position={[0, 0.016, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.005, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </group>
        </DraggableAsset>
      </AnimatedAccessory>

      {/* ==========================================
          4. PREMIUM AUDIO PACK (MONITORS + HEADPHONES)
          ========================================== */}
      {/* ==========================================
          4A. LEFT STUDIO MONITOR SPEAKER
          ========================================== */}
      <AnimatedAccessory active={hasAudio} defaultPosition={[-1.15, 0.03, -0.28]}>
        <DraggableAsset itemId="tech-audio-left" surface="desk" parentPosition={[-1.15, 0.03, -0.28]}>
          <group ref={audioLeftRef} onClick={handleAudioLeftClick}>
            <group position={[0, 0.16, 0]} rotation={[0, 0.28, 0]}>
            {/* Wood Cabinet */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.16, 0.32, 0.18]} />
              <meshStandardMaterial color="#451a03" roughness={0.4} />
            </mesh>
            {/* Matte Black Front Baffle */}
            <mesh position={[0, 0, 0.091]}>
              <boxGeometry args={[0.14, 0.3, 0.005]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>
            {/* Kevlar Yellow Woofer Cone */}
            <mesh position={[0, -0.06, 0.094]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.005, 16]} />
              <meshStandardMaterial color="#eab308" roughness={0.5} />
            </mesh>
            {/* Soft Silk Tweeter Dome */}
            <mesh position={[0, 0.07, 0.094]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.005, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
            </mesh>
            </group>
          </group>
        </DraggableAsset>
      </AnimatedAccessory>

      {/* ==========================================
          4B. RIGHT STUDIO MONITOR SPEAKER
          ========================================== */}
      <AnimatedAccessory active={hasAudio} defaultPosition={[1.15, 0.03, -0.28]}>
        <DraggableAsset itemId="tech-audio-right" surface="desk" parentPosition={[1.15, 0.03, -0.28]}>
          <group ref={audioRightRef} onClick={handleAudioRightClick}>
            <group position={[0, 0.16, 0]} rotation={[0, -0.28, 0]}>
            {/* Wood Cabinet */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.16, 0.32, 0.18]} />
              <meshStandardMaterial color="#451a03" roughness={0.4} />
            </mesh>
            {/* Matte Black Front Baffle */}
            <mesh position={[0, 0, 0.091]}>
              <boxGeometry args={[0.14, 0.3, 0.005]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>
            {/* Kevlar Yellow Woofer Cone */}
            <mesh position={[0, -0.06, 0.094]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.005, 16]} />
              <meshStandardMaterial color="#eab308" roughness={0.5} />
            </mesh>
            {/* Soft Silk Tweeter Dome */}
            <mesh position={[0, 0.07, 0.094]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.005, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
            </mesh>
            </group>
          </group>
        </DraggableAsset>
      </AnimatedAccessory>

      {/* ==========================================
          4C. WOODEN HEADPHONE STAND
          ========================================== */}
      <AnimatedAccessory active={hasAudio} defaultPosition={[1.05, 0.03, 0.15]}>
        <DraggableAsset itemId="tech-audio-headphones" surface="desk" parentPosition={[1.05, 0.03, 0.15]}>
          <group ref={headphonesRef} onClick={handleHeadphonesClick}>
            <group position={[0, 0.17, 0]}>
            {/* Stand wood flat base */}
            <mesh position={[0, -0.16, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.015, 16]} />
              <meshStandardMaterial color="#78350f" roughness={0.4} />
            </mesh>
            {/* Curved organic support pillar */}
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.02, 0.32, 0.04]} />
              <meshStandardMaterial color="#78350f" roughness={0.4} />
            </mesh>
            {/* Top headphone hanger cradle */}
            <mesh position={[0, 0.16, 0]} castShadow>
              <boxGeometry args={[0.06, 0.02, 0.08]} />
              <meshStandardMaterial color="#78350f" roughness={0.4} />
            </mesh>
            
            {/* Suspended Headphones */}
            <group position={[0, 0.08, 0]} rotation={[0.08, 0, 0]}>
              {/* Headband arch */}
              <mesh castShadow>
                <torusGeometry args={[0.085, 0.012, 8, 24, Math.PI]} />
                <meshStandardMaterial color="#1e293b" roughness={0.7} />
              </mesh>
              {/* Left ear cup assembly */}
              <group position={[-0.088, -0.04, 0]}>
                <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.032, 0.032, 0.022, 16]} />
                  <meshStandardMaterial color="#0f766e" roughness={0.6} />
                </mesh>
                <mesh position={[0.01, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.034, 0.034, 0.01, 16]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.8} />
                </mesh>
              </group>
              {/* Right ear cup assembly */}
              <group position={[0.088, -0.04, 0]}>
                <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.032, 0.032, 0.022, 16]} />
                  <meshStandardMaterial color="#0f766e" roughness={0.6} />
                </mesh>
                <mesh position={[-0.01, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.034, 0.034, 0.01, 16]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.8} />
                </mesh>
              </group>
            </group>
            </group>
          </group>
        </DraggableAsset>
      </AnimatedAccessory>

      {/* ==========================================
          5. SMART AMBIENT LED DESK LAMP
          ========================================== */}
      <AnimatedAccessory active={hasLamp} defaultPosition={[-1.08, 0.16, -0.28]}>
        <DraggableAsset itemId="eco-lamp" surface="desk" parentPosition={[-1.08, 0.03, -0.28]}>
          <group ref={lampGroupRef} onClick={handleLampClick}>
          {/* Sleek cylindrical ceramic base */}
          <mesh position={[0, -0.14, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
            <meshStandardMaterial color="#fafaf9" roughness={0.5} /> {/* Matte off-white cream */}
          </mesh>

          {/* Thin curved structural neck */}
          <mesh position={[0.01, 0.03, 0]} rotation={[0, 0, -0.08]} castShadow>
            <cylinderGeometry args={[0.009, 0.012, 0.32, 12]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.9} />
          </mesh>

          {/* Cone-shaped custom lampshade */}
          <group position={[0.04, 0.2, 0]} rotation={[0, 0, 0.15]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.04, 0.08, 0.12, 16]} />
              <meshStandardMaterial color="#fafaf9" roughness={0.5} />
            </mesh>
            
            {/* Dimmable LED bulb element (Self-emissive in night mode) */}
            <mesh position={[0, -0.05, 0]}>
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#f59e0b"
                emissiveIntensity={dayNightMode === 'night' ? 2.5 : 0.4}
                roughness={0.9}
              />
            </mesh>

            {/* REAL spotlight projecting light directly onto the desk surface below */}
            <spotLight
              position={[0, -0.06, 0]}
              angle={Math.PI / 4}
              penumbra={0.7}
              intensity={dayNightMode === 'night' ? 4.5 : 0.1}
              color="#fbbf24"
              distance={2.5}
              castShadow={true}
              shadow-mapSize-width={512}
              shadow-mapSize-height={512}
              shadow-bias={-0.001}
            />
          </group>
          </group>
        </DraggableAsset>
      </AnimatedAccessory>

      {/* ==========================================
          6. TROPICAL MONSTERA PLANT
          ========================================== */}
      <AnimatedAccessory active={hasPlant} defaultPosition={[1.08, 0.14, -0.28]}>
        <DraggableAsset itemId="eco-plant" surface="desk" parentPosition={[1.08, 0.03, -0.28]}>
          <group ref={plantGroupRef} onClick={handlePlantClick}>
          {/* Terracotta Minimalist Pot */}
          <mesh position={[0, -0.08, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.09, 0.065, 0.14, 16]} />
            <meshStandardMaterial color="#c2410c" roughness={0.8} /> {/* True red clay terracotta */}
          </mesh>
          {/* Lip rim for pot realism */}
          <mesh position={[0, -0.015, 0]} castShadow>
            <cylinderGeometry args={[0.094, 0.094, 0.02, 16]} />
            <meshStandardMaterial color="#c2410c" roughness={0.8} />
          </mesh>
          {/* Soil plane */}
          <mesh position={[0, -0.018, 0]}>
            <cylinderGeometry args={[0.084, 0.084, 0.002, 16]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>

          {/* Stems and organic Monstera Leaves */}
          <group position={[0, 0, 0]}>
            {/* Stem & Leaf 1 (Left & Outwards) */}
            <group position={[0, 0, 0]} rotation={[0.4, 0.6, -0.3]}>
              <mesh position={[0, 0.12, 0]} castShadow>
                <cylinderGeometry args={[0.006, 0.008, 0.24, 8]} />
                <meshStandardMaterial color="#059669" roughness={0.7} />
              </mesh>
              {/* High fidelity Split Monstera Leaf blade */}
              <group position={[0, 0.22, 0]} rotation={[Math.PI / 2.5, 0, 0]}>
                <MonsteraLeaf scale={[0.95, 1, 0.95]} />
              </group>
            </group>

            {/* Stem & Leaf 2 (Right & Center) */}
            <group position={[0, 0, 0]} rotation={[-0.2, -0.8, 0.25]}>
              <mesh position={[0, 0.14, 0]} castShadow>
                <cylinderGeometry args={[0.006, 0.008, 0.28, 8]} />
                <meshStandardMaterial color="#059669" roughness={0.7} />
              </mesh>
              {/* High fidelity Split Monstera Leaf blade */}
              <group position={[0, 0.26, 0]} rotation={[Math.PI / 2.3, 0.2, -0.2]}>
                <MonsteraLeaf scale={[1.05, 1, 1.05]} />
              </group>
            </group>

            {/* Stem & Leaf 3 (High arching center leaf) */}
            <group position={[0, 0, 0]} rotation={[0.0, 0.0, -0.15]}>
              <mesh position={[0, 0.18, 0]} castShadow>
                <cylinderGeometry args={[0.006, 0.008, 0.35, 8]} />
                <meshStandardMaterial color="#059669" roughness={0.7} />
              </mesh>
              {/* High fidelity Split Monstera Leaf blade */}
              <group position={[0, 0.34, 0]} rotation={[Math.PI / 2.1, 0, 0.3]}>
                <MonsteraLeaf scale={[1.2, 1, 1.2]} />
              </group>
            </group>
          </group>
        </group>
        </DraggableAsset>
      </AnimatedAccessory>
    </group>
  );
}
