"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dropzone } from "@/components/dropzone";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function NewProjectCard() {
	const router = useRouter();

	const handleUploadComplete = (result: {
		url: string;
		text: string;
		projectId?: number;
	}) => {
		if (result.projectId) {
			toast.success("Project created! Redirecting...");
			router.refresh();
			router.push(`/dashboard/projects/${result.projectId}`);
		} else {
			// Fallback if projectId is missing for some reason
			toast.success("Document uploaded.");
			router.refresh();
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Upload PRD</CardTitle>
				<CardDescription>
					Upload a PDF or text file to generate a backlog.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Dropzone onUploadComplete={handleUploadComplete} />
			</CardContent>
		</Card>
	);
}
