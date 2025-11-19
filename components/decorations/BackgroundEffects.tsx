"use client";
import LightRays from "@/components/lightrays";
import Particles from "@/components/particles";

interface BackgroundEffectsProps {
	particleCount?: number;
	particleBaseSize?: number;
	className?: string;
}

export default function BackgroundEffects({
	particleCount = 400,
	particleBaseSize = 1,
	className = "",
}: BackgroundEffectsProps) {
	return (
		<div
			className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none ${className}`.trim()}
		>
			<div className="absolute inset-x-0 top-0 h-1/2 z-0 overflow-hidden pointer-events-none">
				<LightRays />
			</div>
			<div className="absolute inset-x-0 top-0 h-full z-0 overflow-hidden pointer-events-none">
				<Particles
					particleCount={particleCount}
					particleBaseSize={particleBaseSize}
				/>
			</div>
		</div>
	);
}
