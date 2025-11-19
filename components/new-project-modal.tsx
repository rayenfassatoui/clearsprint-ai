"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { NewProjectCard } from "@/components/new-project-card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

export function NewProjectModal() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					New Project
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Create New Project</DialogTitle>
				</DialogHeader>
				<NewProjectCard />
			</DialogContent>
		</Dialog>
	);
}
