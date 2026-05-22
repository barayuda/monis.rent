'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useConfigurator } from '@/context/ConfiguratorContext';
import * as THREE from 'three';

interface DraggableAssetProps {
  itemId: string;
  surface: 'desk' | 'floor';
  parentPosition: [number, number, number];
  children: React.ReactNode;
}

export default function DraggableAsset({
  itemId,
  surface,
  parentPosition,
  children,
}: DraggableAssetProps) {
  const {
    customPositions,
    updateCustomPosition,
    isDragging,
    setIsDragging,
    selectedDeskId,
  } = useConfigurator();

  const groupRef = useRef<THREE.Group>(null);
  const [localDragging, setLocalDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const { raycaster } = useThree();

  // Custom position tracks the OFFSET [ox, oy, oz] relative to parentPosition
  const savedOffset = customPositions[itemId];
  const currentOffset = savedOffset || [0, 0, 0];

  const deskBamboo = selectedDeskId === 'desk-bamboo';
  const deskHeight = deskBamboo ? 1.15 : 0.72;

  // Tabletop surface Y coordinate in world space (relative to platform floor Y = -0.5)
  const targetWorldY = surface === 'desk' ? (deskHeight - 0.5) : -0.5;

  // Apply custom offset updates smoothly
  useEffect(() => {
    if (groupRef.current && !localDragging) {
      groupRef.current.position.set(currentOffset[0], currentOffset[1], currentOffset[2]);
    }
  }, [currentOffset, localDragging]);

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'grab';
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setLocalDragging(true);
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    setLocalDragging(false);
    setIsDragging(false);
    document.body.style.cursor = hovered ? 'grab' : 'auto';

    if (groupRef.current) {
      const { x, y, z } = groupRef.current.position;
      updateCustomPosition(itemId, [x, y, z]);
    }
  };

  const handlePointerMove = (e: any) => {
    if (!localDragging || !groupRef.current) return;
    e.stopPropagation();

    // Raycast on infinite horizontal plane at surface world height
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -targetWorldY);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane, intersectPoint);

    // Calculate clamped world position boundaries to prevent items from flying out of grid
    let clampedWorldX = intersectPoint.x;
    let clampedWorldZ = intersectPoint.z;

    if (surface === 'desk') {
      // Tabletop boundaries (2.6 width by 1.3 depth)
      clampedWorldX = Math.max(-1.18, Math.min(1.18, intersectPoint.x));
      clampedWorldZ = Math.max(-0.52, Math.min(0.52, intersectPoint.z));
    } else {
      // Floor grid boundaries
      clampedWorldX = Math.max(-2.2, Math.min(2.2, intersectPoint.x));
      clampedWorldZ = Math.max(-1.6, Math.min(1.6, intersectPoint.z));
    }

    // Convert from world coordinate to local coordinate offset
    const offsetX = clampedWorldX - parentPosition[0];
    const offsetZ = clampedWorldZ - parentPosition[2];

    // Update relative offset position directly for 60 FPS performance
    groupRef.current.position.x = offsetX;
    groupRef.current.position.z = offsetZ;
  };

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      {/* Sleek R3F overlay tooltip */}
      {(hovered || localDragging) && (
        <Html position={[0, 0.45, 0]} center distanceFactor={2.5}>
          <div className="flex flex-col items-center gap-1 select-none pointer-events-none transition-all duration-300">
            <span className={`text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border shadow-md backdrop-blur-sm transition-all duration-200 ${
              localDragging 
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20 scale-105' 
                : 'bg-slate-900/95 border-emerald-500/40 text-emerald-400'
            }`}>
              {localDragging ? 'Placing... 🫳' : 'Grab to drag 🎯'}
            </span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          </div>
        </Html>
      )}

      {/* Renders nested procedural model with mild grab hover state */}
      <group 
        scale={hovered && !localDragging ? [1.02, 1.02, 1.02] : [1, 1, 1]}
        rotation={hovered && !localDragging ? [0, 0.05, 0] : [0, 0, 0]}
      >
        {children}
      </group>
    </group>
  );
}
