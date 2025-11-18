"use client";;
import LightRays from "@/components/lightrays";
import Particles from "@/components/particles";

interface BackgroundEffectsProps {
  particleCount?: number;
  particleBaseSize?: number;
}

export default function BackgroundEffects({
  particleCount = 400,
  particleBaseSize = 1,
}: BackgroundEffectsProps) {
  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <LightRays />
      </div>
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <Particles particleCount={particleCount} particleBaseSize={particleBaseSize} />
      </div>
    </>
  );
}
