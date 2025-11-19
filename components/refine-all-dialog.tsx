"use client";

import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { generateBacklog } from "@/actions/generate.server";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface RefineAllDialogProps {
	projectId: number;
}

export function RefineAllDialog({ projectId }: RefineAllDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleRefineAll = async () => {
		setLoading(true);
		try {
			// For now, "Refine All" will re-trigger the generation process.
			// In a more advanced version, this could take current tickets as context.
			// But per requirements "Server Action re-gen entire project".

			const result = await generateBacklog(projectId);

			if (result.success) {
				toast.success("Project refined successfully!");
				setIsOpen(false);
				router.refresh();
			} else {
				toast.error(result.error);
			}
		} catch (error) {
			toast.error("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="ml-2">
					<RefreshCw className="mr-2 h-4 w-4" />
					Refine All
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Refine Entire Project</DialogTitle>
				</DialogHeader>
				<div className="py-4">
					<p className="text-muted-foreground">
						This will re-analyze your document and regenerate the entire
						backlog. Existing tickets might be replaced or duplicated if not
						carefully managed. (Current implementation re-generates from scratch
						based on the document).
					</p>
				</div>
				<DialogFooter>
					<Button variant="ghost" onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleRefineAll} disabled={loading}>
						{loading ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Sparkles className="mr-2 h-4 w-4" />
						)}
						{loading ? "Refining..." : "Confirm Refine"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
