"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";


const World = dynamic(
  () => import("@/components/ui/globe").then((m) => m.World || m.default), 
  { ssr: false }
);

export default function DDoSMap() {
  const [logs, setLogs] = useState<string[]>([]);
  const [arcs, setArcs] = useState<any[]>([]);

  useEffect(() => {
    // 2. Connect to your FastAPI WebSocket backend
    const socket = new WebSocket("ws://localhost:8000/ws");

    socket.onopen = () => {
      setLogs((prev) => ["[SYSTEM] Connected to Threat Intelligence Feed", ...prev]);
    };

    socket.onmessage = (event) => {
      const newAttack = JSON.parse(event.data);
      
      // Add arc to globe and log to HUD
      setArcs((prev) => [...prev.slice(-15), newAttack]); // Keep last 15 arcs for performance
      setLogs((prev) => [
        `[ATTACK] ${newAttack.city || "Unknown"} detected - Severity: HIGH`, 
        ...prev.slice(0, 9)
      ]);
    };

    socket.onclose = () => {
      setLogs((prev) => ["[SYSTEM] Connection lost. Retrying...", ...prev]);
    };

    return () => socket.close();
  }, []);

  return (
    <main className="relative h-screen w-full bg-black overflow-hidden flex items-center justify-center">
      {/* 3. Hacker HUD Overlay */}
      <div className="absolute top-10 left-10 z-50 pointer-events-none select-none">
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-red-600 tracking-tighter uppercase italic drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            Live DDoS Monitor
          </h1>
        </div>

        {/* Real-time Log Feed */}
        <div className="mt-8 p-5 border border-red-900/30 bg-black/60 backdrop-blur-xl rounded-sm w-80 shadow-2xl">
          <div className="flex justify-between items-center mb-3 border-b border-red-900/50 pb-2">
            <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest animate-pulse">
              ● Live Feed
            </span>
            <span className="text-[10px] font-mono text-red-700 uppercase">
              System: Stable
            </span>
          </div>
          <div className="h-48 overflow-hidden">
            {logs.map((log, i) => (
              <div key={i} className="text-[11px] font-mono text-red-400/90 mb-1 leading-tight border-l-2 border-red-900/50 pl-2">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. The Globe Rendering Layer */}
      <div className="absolute inset-0 z-10 h-full w-full">
        {/* Use sampleData as a fallback if WebSocket is empty */}
        <World data={arcs.length > 0 ? arcs : sampleData} globeConfig={globeConfig} />
      </div>

      {/* Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </main>
  );
}

// Standard configuration for the GitHub Globe component
const globeConfig = {
  pointSize: 1,
  globeColor: "#070a0e",
  showAtmosphere: true,
  atmosphereColor: "#7f1d1d",
  atmosphereDayAlpha: 0.3,
  emissive: "#111827",
  emissiveIntensity: 0.5,
  shininess: 0.7,
  polygonColor: "rgba(255,255,255,0.5)",
  ambientLight: "#ef4444",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 2000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 22.3193, lng: 114.1694 },
  autoRotate: true,
  autoRotateSpeed: 0.5,
};

// Initial state data before WebSocket populates
const sampleData = [
  {
    order: 1,
    startLat: 37.7749,
    startLng: -122.4194,
    endLat: 34.0522,
    endLng: -118.2437,
    arcAlt: 0.2,
    color: "#ff0000",
  },
];