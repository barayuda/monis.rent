'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ConfiguratorProvider } from '@/context/ConfiguratorContext';
import ConfiguratorPanel from '@/components/ConfiguratorPanel/ConfiguratorPanel';

// Dynamically import Three.js WorkspaceVisualizer with no SSR to avoid Canvas hydration issues
const WorkspaceVisualizer = dynamic(
  () => import('@/components/WorkspaceVisualizer/WorkspaceVisualizer'),
  { ssr: false, loading: () => (
    <div className="flex flex-1 min-h-[400px] md:min-h-0 justify-center items-center bg-[#F9F6F0] rounded-3xl border border-[#E6E1D6]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
        <p className="text-sm font-medium text-emerald-800 font-mono">Initializing 3D Canvas...</p>
      </div>
    </div>
  )}
);

export default function WorkspaceDesignerPage() {
  return (
    <ConfiguratorProvider>
      <div className="min-h-screen bg-[#F9F6F0] flex flex-col text-[#2D2A26] font-sans selection:bg-emerald-100 selection:text-emerald-900">
        {/* Sleek Minimalist Eco Header */}
        <header className="px-6 py-4 md:px-12 bg-white/70 backdrop-blur-md border-b border-[#E6E1D6] sticky top-0 z-40 flex justify-between items-center transition-all duration-300">
          <div className="flex items-center gap-3">
            {/* Green Leaf Icon simulating monis.rent eco branding */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#1C1A17] flex items-center gap-1.5 font-sans">
                monis<span className="text-emerald-600">.rent</span>
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#8A8478] -mt-0.5">Workspace Configurator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Bali Hub Operations
            </span>
          </div>
        </header>

        {/* Main Dashboard Layout */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-8 lg:p-12 flex flex-col md:flex-row gap-6 md:gap-8 h-[calc(100vh-73px)] overflow-hidden">
          {/* Visualizer Canvas Panel (takes more space on desktop) */}
          <section className="flex-[5] flex flex-col h-[50vh] md:h-full relative rounded-3xl overflow-hidden bg-white border border-[#E6E1D6] shadow-sm transition-all duration-500 hover:shadow-md">
            <WorkspaceVisualizer />
          </section>

          {/* Configurator Controls Panel */}
          <section className="flex-[4] flex flex-col h-auto md:h-full bg-white rounded-3xl border border-[#E6E1D6] shadow-sm overflow-hidden transition-all duration-500 hover:shadow-md">
            <ConfiguratorPanel />
          </section>
        </main>
      </div>
    </ConfiguratorProvider>
  );
}
