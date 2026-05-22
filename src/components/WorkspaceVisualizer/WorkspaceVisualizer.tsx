'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, ContactShadows, Html } from '@react-three/drei';
import { useConfigurator } from '@/context/ConfiguratorContext';
import { RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import gsap from 'gsap';
import DeskModel from '../ModelPrimitives/DeskModel';
import ChairModel from '../ModelPrimitives/ChairModel';
import AccessoryModel from '../ModelPrimitives/AccessoryModel';
import LifestyleModels from '../ModelPrimitives/LifestyleModels';

// --- Interactive Pulsing 3D Hotspot Component using Drei <Html> ---
interface HotspotProps {
  position: [number, number, number];
  label: string;
  onClick: () => void;
}

function Hotspot({ position, label, onClick }: HotspotProps) {
  return (
    <Html position={position} center distanceFactor={2.4}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="group relative flex items-center justify-center pointer-events-auto cursor-pointer focus:outline-none"
        title={label}
      >
        {/* Pulsing outer glowing green circle */}
        <span className="absolute w-8 h-8 rounded-full bg-emerald-500/40 animate-ping" />
        
        {/* Secondary soft ring */}
        <span className="absolute w-5 h-5 rounded-full bg-emerald-400/20 group-hover:scale-125 transition-transform duration-300" />
        
        {/* Main emerald-green point-of-interest button */}
        <span className="relative z-10 flex items-center justify-center w-5.5 h-5.5 rounded-full bg-emerald-600 border-2 border-white shadow-[0_4px_12px_rgba(16,185,129,0.4)] transition-all duration-300 group-hover:scale-115 group-hover:bg-emerald-50">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>
        
        {/* Horizontal tag expanding on hover */}
        <span className="absolute left-7 whitespace-nowrap z-20 bg-slate-900/95 text-white text-[11px] font-bold py-1.5 px-3 rounded-full border border-emerald-500/30 opacity-0 scale-75 origin-left transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-1 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] flex items-center gap-1.5 backdrop-blur-sm select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {label}
        </span>
      </button>
    </Html>
  );
}

// --- CameraRig sub-component to handle cinematic 3D focus transitions ---
function CameraRig() {
  const { activeTab } = useConfigurator();
  const { camera, controls } = useThree() as any;

  useEffect(() => {
    if (!camera) return;

    // Premium transition targets for workspace categories
    const targets: Record<
      'desk' | 'chair' | 'tech' | 'eco',
      { position: [number, number, number]; target: [number, number, number] }
    > = {
      desk: { position: [2.8, 2.2, 3.2], target: [0, 0.4, 0] },        // Overlooking overall workspace
      chair: { position: [2.0, 1.0, 2.4], target: [0, 0.1, 0.4] },       // Zoomed/canted on chair
      tech: { position: [0.0, 1.4, 1.8], target: [0, 0.85, -0.2] },      // Curving monitor close-up
      eco: { position: [1.4, 0.9, 1.6], target: [0.9, 0.35, -0.2] },    // Focusing on Monstera/plants
    };

    const dest = targets[activeTab] || targets.desk;

    // Kill any ongoing tweens on camera.position and controls.target to prevent fighting
    gsap.killTweensOf(camera.position);
    if (controls) {
      gsap.killTweensOf(controls.target);
    }

    // Animate camera position
    gsap.to(camera.position, {
      x: dest.position[0],
      y: dest.position[1],
      z: dest.position[2],
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => {
        if (controls) controls.update();
      },
    });

    // Animate orbit controls target
    if (controls) {
      gsap.to(controls.target, {
        x: dest.target[0],
        y: dest.target[1],
        z: dest.target[2],
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          controls.update();
        },
      });
    }
  }, [activeTab, camera, controls]);

  return null;
}

export default function WorkspaceVisualizer() {
  const {
    selectedDeskId,
    selectedChairId,
    selectedAccessoryIds,
    dayNightMode,
    ledColor,
    toggleAccessory,
    customPositions,
    resetAllPositions,
  } = useConfigurator();

  const isNight = dayNightMode === 'night';
  const deskHeight = 1.0; // Fixed visualizer desk height

  // Scene ambient / background colors
  const bgColor = isNight ? '#0b0f19' : '#FAF8F5';
  const ambientIntensity = isNight ? 0.35 : 1.6;
  const sunIntensity = isNight ? 0.1 : 1.8;

  const showUltrawide = selectedAccessoryIds.includes('tech-ultrawide');
  const showDual = selectedAccessoryIds.includes('tech-dual');
  const showPlant = selectedAccessoryIds.includes('eco-plant');
  const showLamp = selectedAccessoryIds.includes('eco-lamp');

  const hasCustomPositions = Object.keys(customPositions).length > 0;

  return (
    <div className="w-full h-full flex flex-col relative bg-transparent">
      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full">
        <Canvas
          shadows
          camera={{ position: [2.8, 2.2, 3.2], fov: 48 }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          {/* Background color */}
          <color attach="background" args={[bgColor]} />

          {/* Dynamic Scene Fog to create natural depth */}
          <fog attach="fog" args={[bgColor, 4, 12]} />

          {/* Orbit Camera Controls */}
          <OrbitControls 
            makeDefault
            enableDamping
            dampingFactor={0.05}
            minDistance={1.8}
            maxDistance={6}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going underground
          />

          {/* Cinematic 3D Camera Focus Rig */}
          <CameraRig />

          {/* Ambient Lighting */}
          <ambientLight intensity={ambientIntensity} />

          {/* Key Sun Directional Light */}
          {!isNight ? (
            <directionalLight
              position={[6, 12, 5]}
              intensity={sunIntensity}
              castShadow
              shadow-mapSize={[1024, 1024]}
              shadow-bias={-0.0001}
            />
          ) : (
            // Moonlight
            <directionalLight
              position={[5, 10, -3]}
              intensity={0.2}
              color="#38bdf8"
            />
          )}

          {/* LED Strip Backlight projecting onto background wall */}
          {isNight && (
            <spotLight
              position={[0, deskHeight - 0.1, -0.6]}
              angle={Math.PI / 1.8}
              penumbra={1}
              intensity={12}
              distance={4}
              color={ledColor}
              castShadow
            />
          )}

          {/* Night Stars Background Effect */}
          {isNight && <Stars radius={100} depth={50} count={350} factor={4} saturation={0.5} fade speed={1} />}

          {/* Workspace Furniture */}
          <group position={[0, -0.5, 0]}>
            {/* Minimalist Floor Platform */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
              <planeGeometry args={[12, 12]} />
              <meshStandardMaterial color={isNight ? '#1e293b' : '#eae6df'} roughness={0.9} />
            </mesh>

            {/* Core Desk & Nested Accessories (Elevate together smoothly!) */}
            <DeskModel>
              <AccessoryModel />
              
              {/* Point-and-Click Floating 3D Hotspots */}
              {!showUltrawide && !showDual && (
                <Hotspot
                  position={[0, 0.36, -0.24]}
                  label="Add Widescreen Monitor!"
                  onClick={() => toggleAccessory('tech-ultrawide')}
                />
              )}
              {!showPlant && (
                <Hotspot
                  position={[1.08, 0.22, -0.28]}
                  label="Place a Tropical Plant!"
                  onClick={() => toggleAccessory('eco-plant')}
                />
              )}
              {!showLamp && (
                <Hotspot
                  position={[-1.08, 0.24, -0.28]}
                  label="Add Ambient Desk Lamp!"
                  onClick={() => toggleAccessory('eco-lamp')}
                />
              )}
            </DeskModel>

            {/* Core Chair */}
            <ChairModel />

            {/* Premium Nomad Lifestyle Models (Floor items + Desk speaker) */}
            <LifestyleModels />

            {/* Soft Contact Shadows beneath furniture */}
            <ContactShadows 
              position={[0, 0, 0]} 
              opacity={isNight ? 0.3 : 0.65} 
              scale={6} 
              blur={2.4} 
              far={1.6} 
              receiveShadow
            />
          </group>
        </Canvas>
      </div>

      {/* Absolute floating UI details badge */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-col gap-1 select-none">
        <span className="text-[10px] font-black tracking-widest text-[#8A8478] bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#E6E1D6] shadow-sm uppercase">
          Orbiting Active 3D Visualizer
        </span>
        <span className="text-[9px] text-[#6B655A] font-medium bg-[#FAF8F5]/80 backdrop-blur-sm px-2.5 py-0.5 rounded-md border border-[#E6E1D6]/60 w-fit flex items-center gap-1.5">
          <span>Drag to Rotate</span>
          <span className="text-stone-300">•</span>
          <span>Pinch to Zoom</span>
          <span className="text-stone-300">•</span>
          <span className="text-emerald-700 font-extrabold flex items-center gap-0.5">Click items to play! ✨</span>
        </span>
      </div>

      {/* Floating Glassmorphic Reset Layout Button */}
      {hasCustomPositions && (
        <button
          onClick={resetAllPositions}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#E6E1D6] shadow-md text-xs font-bold text-stone-700 hover:bg-stone-50/90 hover:shadow-lg hover:border-stone-300 active:scale-95 transition-all duration-200 select-none cursor-pointer group"
          title="Reset all items to default positions"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-[-45deg] transition-transform duration-300" />
          <span>Reset Layout</span>
        </button>
      )}
    </div>
  );
}
