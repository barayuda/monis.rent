'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
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
  } = useConfigurator();

  const controls = useThree((state: any) => state.controls);

  const groupRef = useRef<THREE.Group>(null);
  const [localDragging, setLocalDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Cached math references to avoid garbage collection overhead in the high-frequency frame loop
  const parentWorldPos = useRef(new THREE.Vector3());
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectPoint = useRef(new THREE.Vector3());

  // Custom position tracks the OFFSET [ox, oy, oz] relative to parentPosition
  const savedOffset = customPositions[itemId];
  const currentOffset = savedOffset || [0, 0, 0];

  // Apply custom offset updates smoothly when not actively dragging
  useEffect(() => {
    if (groupRef.current && !localDragging) {
      groupRef.current.position.set(currentOffset[0], currentOffset[1], currentOffset[2]);
    }
  }, [currentOffset, localDragging]);

  // Robust global pointerup listener to prevent stuck dragging/locked OrbitControls when pointerup fires outside the viewport
  useEffect(() => {
    if (localDragging) {
      const handleGlobalPointerUp = () => {
        setLocalDragging(false);
        if (controls) {
          controls.enabled = true;
        }
        document.body.style.cursor = hovered ? 'grab' : 'auto';

        if (groupRef.current) {
          const { x, y, z } = groupRef.current.position;
          updateCustomPosition(itemId, [x, y, z]);
        }
      };

      window.addEventListener('pointerup', handleGlobalPointerUp);
      return () => {
        window.removeEventListener('pointerup', handleGlobalPointerUp);
      };
    }
  }, [localDragging, hovered, itemId, updateCustomPosition, controls]);

  // Buttery-smooth, frame-locked raycasting inside R3F useFrame loop.
  // This uses canvas-wide pointer events, meaning the asset tracks the mouse smoothly
  // even if the cursor moves extremely fast and leaves the mesh's visual bounding box.
  useFrame((state) => {
    if (!localDragging || !groupRef.current || !groupRef.current.parent) return;

    // Query parent's actual world position to dynamically support vertical table height transitions
    groupRef.current.parent.getWorldPosition(parentWorldPos.current);
    const targetWorldY = parentWorldPos.current.y;

    // Update drag plane constant (altitude offset)
    dragPlane.current.constant = -targetWorldY;

    // Compute pointer raycast intersection on the plane
    const hasIntersection = state.raycaster.ray.intersectPlane(dragPlane.current, intersectPoint.current);
    if (!hasIntersection) return;

    // Clamped coordinates to enforce physical room boundaries
    let clampedWorldX = intersectPoint.current.x;
    let clampedWorldZ = intersectPoint.current.z;

    if (surface === 'desk') {
      clampedWorldX = Math.max(-1.18, Math.min(1.18, intersectPoint.current.x));
      clampedWorldZ = Math.max(-0.52, Math.min(0.52, intersectPoint.current.z));
    } else {
      clampedWorldX = Math.max(-2.2, Math.min(2.2, intersectPoint.current.x));
      clampedWorldZ = Math.max(-1.6, Math.min(1.6, intersectPoint.current.z));
    }

    // Convert world coordinates to local offset coordinates relative to the parent
    const offsetX = clampedWorldX - parentWorldPos.current.x;
    const offsetZ = clampedWorldZ - parentWorldPos.current.z;

    // Direct matrix coordinates updates for maximum frame performance
    groupRef.current.position.x = offsetX;
    groupRef.current.position.z = offsetZ;
  });

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
    if (controls) {
      controls.enabled = false;
    }
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    setLocalDragging(false);
    if (controls) {
      controls.enabled = true;
    }
    document.body.style.cursor = hovered ? 'grab' : 'auto';

    if (groupRef.current) {
      const { x, y, z } = groupRef.current.position;
      updateCustomPosition(itemId, [x, y, z]);
    }
  };

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
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
