import { Suspense } from "react";
import { ConnectJiraButton } from "@/components/connect-jira-button";
import { NewProjectModal } from "@/components/new-project-modal";
import { ProjectList } from "@/components/project-list";
import { ProjectCardSkeleton } from "@/components/skeletons";

export default function DashboardPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Dashboard</h1>
					<p className="text-muted-foreground">Welcome to ClearSprint AI.</p>
				</div>
				<div className="flex items-center gap-2">
					<NewProjectModal />
					<ConnectJiraButton />
				</div>
			</div>

			<div className="space-y-6">
				<h2 className="text-xl font-semibold">Your Projects</h2>
				<Suspense
					fallback={
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<ProjectCardSkeleton />
							<ProjectCardSkeleton />
							<ProjectCardSkeleton />
						</div>
					}
				>
					<ProjectList />
				</Suspense>
			</div>
		</div>
	);
}
