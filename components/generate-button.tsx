"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { generateBacklog } from "@/actions/generate.server";
import { GenerationLoadingState } from "@/components/generation-loading-state";
import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
	projectId: number;
}

export function GenerateButton({ projectId }: GenerateButtonProps) {
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const router = useRouter();

	const handleGenerate = async () => {
		setStatus("loading");
		try {
			// Simulate steps for better UX (optional, but good for feeling)
			// In a real app, we might stream status updates

			const result = await generateBacklog(projectId);

			if (result.success) {
				setStatus("success");
				toast.success("Backlog generated successfully!");
				// Wait a bit for the success animation
				setTimeout(() => {
					setStatus("idle");
					router.refresh();
				}, 1500);
			} else {
				setStatus("error");
				toast.error(result.error);
				setTimeout(() => setStatus("idle"), 2000);
			}
		} catch (error) {
			setStatus("error");
			toast.error("An unexpected error occurred");
			setTimeout(() => setStatus("idle"), 2000);
		}
	};

	return (
		<>
			<GenerationLoadingState status={status} />
			<Button
				variant="secondary"
				size="sm"
				onClick={handleGenerate}
				disabled={status === "loading"}
				className="transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
			>
				<Sparkles className="mr-2 h-4 w-4" />
				Generate
			</Button>
		</>
	);
}
