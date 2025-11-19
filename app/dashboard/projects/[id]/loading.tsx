import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectLoading() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Skeleton className="h-10 w-10 rounded-md" />
					<div>
						<Skeleton className="h-8 w-64 mb-2" />
						<Skeleton className="h-4 w-40" />
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-9 w-32" />
				</div>
			</div>

			<div className="bg-muted/30 p-6 rounded-xl border min-h-[calc(100vh-200px)]">
				<div className="flex gap-4 overflow-x-auto pb-4 h-full">
					{[1, 2, 3].map((i) => (
						<div key={i} className="w-[350px] flex-shrink-0 flex flex-col">
							<div className="flex items-center justify-between p-2 mb-4">
								<div className="flex items-center gap-2">
									<Skeleton className="h-4 w-4 rounded-full" />
									<Skeleton className="h-6 w-24" />
									<Skeleton className="h-5 w-8 rounded-full" />
								</div>
								<Skeleton className="h-8 w-8 rounded-md" />
							</div>
							<div className="space-y-3">
								<Skeleton className="h-32 w-full rounded-lg" />
								<Skeleton className="h-24 w-full rounded-lg" />
								<Skeleton className="h-40 w-full rounded-lg" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
