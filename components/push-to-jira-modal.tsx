"use client";

import { Loader2, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	getJiraProjectsList,
	getJiraSites,
	pushToJira,
} from "@/actions/jira.server";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function PushToJiraModal({
	projectId,
	projectTitle,
}: {
	projectId: number;
	projectTitle: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [sites, setSites] = useState<any[]>([]);
	const [selectedSiteId, setSelectedSiteId] = useState<string>("");
	const [projects, setProjects] = useState<any[]>([]);
	const [selectedProjectKey, setSelectedProjectKey] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [pushing, setPushing] = useState(false);

	useEffect(() => {
		if (isOpen) {
			loadSites();
		}
	}, [isOpen]);

	useEffect(() => {
		if (selectedSiteId) {
			loadProjects(selectedSiteId);
		}
	}, [selectedSiteId]);

	async function loadSites() {
		setLoading(true);
		const res = await getJiraSites();
		if (res.success) {
			setSites(res.resources);
			if (res.resources && res.resources.length === 1) {
				setSelectedSiteId(res.resources[0].id);
			}
		} else {
			toast.error(res.error);
		}
		setLoading(false);
	}

	async function loadProjects(cloudId: string) {
		setLoading(true);
		const res = await getJiraProjectsList(cloudId);
		if (res.success) {
			setProjects(res.projects);
		} else {
			toast.error(res.error);
		}
		setLoading(false);
	}

	async function handlePush() {
		if (!selectedSiteId || !selectedProjectKey) return;
		setPushing(true);
		const res = await pushToJira(projectId, selectedSiteId, selectedProjectKey);
		if (res.success) {
			toast.success(`Successfully pushed ${res.pushedCount} tickets to Jira!`);
			setIsOpen(false);
		} else {
			toast.error(res.error);
		}
		setPushing(false);
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<UploadCloud className="mr-2 h-4 w-4" />
					Push to Jira
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Push &quot;{projectTitle}&quot; to Jira</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Select Jira Site</label>
						<Select
							value={selectedSiteId}
							onValueChange={setSelectedSiteId}
							disabled={loading || sites.length === 0}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a site" />
							</SelectTrigger>
							<SelectContent>
								{sites.map((site) => (
									<SelectItem key={site.id} value={site.id}>
										{site.name} ({site.url})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{selectedSiteId && (
						<div className="space-y-2">
							<label className="text-sm font-medium">Select Jira Project</label>
							<Select
								value={selectedProjectKey}
								onValueChange={setSelectedProjectKey}
								disabled={loading}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a project" />
								</SelectTrigger>
								<SelectContent>
									{projects.map((proj) => (
										<SelectItem key={proj.key} value={proj.key}>
											{proj.name} ({proj.key})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					<Button
						className="w-full"
						onClick={handlePush}
						disabled={pushing || !selectedProjectKey}
					>
						{pushing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
						{pushing ? "Pushing..." : "Push to Jira"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
