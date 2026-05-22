'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, ContactShadows } from '@react-three/drei';
import { useConfigurator } from '@/context/ConfiguratorContext';
import DeskModel from '../ModelPrimitives/DeskModel';
import ChairModel from '../ModelPrimitives/ChairModel';
import AccessoryModel from '../ModelPrimitives/AccessoryModel';

// --- Main WorkspaceVisualizer Component ---

export default function WorkspaceVisualizer() {
  const {
    selectedDeskId,
    selectedChairId,
    selectedAccessoryIds,
    dayNightMode,
    ledColor,
  } = useConfigurator();

  const isNight = dayNightMode === 'night';
  const deskHeight = 1.0; // Fixed visualizer desk height

  // Scene ambient / background colors
  const bgColor = isNight ? '#0b0f19' : '#FAF8F5';
  const ambientIntensity = isNight ? 0.3 : 1.6;
  const sunIntensity = isNight ? 0.1 : 1.8;

  const showUltrawide = selectedAccessoryIds.includes('tech-ultrawide');
  const showDual = selectedAccessoryIds.includes('tech-dual');
  const showTechInput = selectedAccessoryIds.includes('tech-input');
  const showAudio = selectedAccessoryIds.includes('tech-audio');
  const showLamp = selectedAccessoryIds.includes('eco-lamp');
  const showPlant = selectedAccessoryIds.includes('eco-plant');

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
            enableDamping
            dampingFactor={0.05}
            minDistance={1.8}
            maxDistance={6}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going underground
          />

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
            </DeskModel>

            {/* Core Chair */}
            <ChairModel />

            {/* Soft Contact Shadows beneath furniture */}
            <ContactShadows 
              position={[0, 0, 0]} 
              opacity={isNight ? 0.3 : 0.65} 
              scale={6} 
              blur={2.4} 
              far={1.6} 
            />
          </group>
        </Canvas>
      </div>

      {/* Absolute floating UI details badge */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-col gap-1 select-none">
        <span className="text-[10px] font-black tracking-widest text-[#8A8478] bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#E6E1D6] shadow-sm uppercase">
          Orbiting Active 3D Visualizer
        </span>
        <span className="text-[9px] text-[#6B655A] font-medium bg-[#FAF8F5]/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-[#E6E1D6]/60 w-fit">
          Drag to Rotate | Pinch to Zoom
        </span>
      </div>
    </div>
  );
}
