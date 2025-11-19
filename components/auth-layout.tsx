"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import type React from "react";
import Particles from "@/components/particles";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
	children: React.ReactNode;
	title: string;
	subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-background font-sans text-foreground selection:bg-primary/20">
			{/* Background Particles */}
			<div className="absolute inset-0 z-0">
				<Particles
					particleCount={300}
					particleSpread={15}
					speed={0.2}
					particleBaseSize={150}
					moveParticlesOnHover={true}
					particleHoverFactor={1.5}
					alphaParticles={true}
					className="h-full w-full"
				/>
			</div>

			{/* Gradient Overlay for depth */}
			<div className="absolute inset-0 z-0 bg-gradient-to-tr from-background/80 via-background/50 to-background/80 pointer-events-none" />

			{/* Navigation Bar */}
			<div className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12">
				<Link href="/">
					<Button
						variant="ghost"
						className="group gap-2 pl-0 hover:bg-transparent hover:text-primary"
					>
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
							<ArrowLeft className="h-4 w-4" />
						</div>
						<span className="text-sm font-medium">Back to Home</span>
					</Button>
				</Link>
				<ThemeToggle />
			</div>

			{/* Main Content */}
			<main className="relative z-10 flex min-h-[calc(100vh-100px)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
					className="w-full max-w-md"
				>
					{/* Header Section */}
					<div className="mb-8 text-center">
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: 0.2, duration: 0.5 }}
							className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-xl ring-1 ring-primary/20 backdrop-blur-xl"
						>
							<Sparkles className="h-8 w-8 text-primary" />
						</motion.div>
						<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
							{title}
						</h2>
						<p className="mt-3 text-muted-foreground text-lg">{subtitle}</p>
					</div>

					{/* Form Container */}
					<div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl dark:bg-black/5 dark:border-white/5">
						{/* Inner glow effect */}
						<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />

						<div className="relative z-10">{children}</div>
					</div>
				</motion.div>
			</main>
		</div>
	);
}
