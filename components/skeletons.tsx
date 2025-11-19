import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<Skeleton className="h-6 w-3/4 mb-2" />
				<Skeleton className="h-4 w-1/2" />
			</CardHeader>
			<CardContent>
				<div className="flex items-center mb-4">
					<Skeleton className="h-4 w-4 mr-2" />
					<Skeleton className="h-4 w-1/3" />
				</div>
			</CardContent>
			<CardFooter className="flex justify-between pt-0">
				<Skeleton className="h-9 w-24" />
				<Skeleton className="h-9 w-24" />
			</CardFooter>
		</Card>
	);
}

export function KanbanBoardSkeleton() {
	return (
		<div className="space-y-4">
			{[1, 2, 3].map((i) => (
				<div
					key={i}
					className="flex items-center p-3 mb-2 rounded-lg border bg-white shadow-sm"
				>
					<Skeleton className="h-4 w-4 mr-2" />
					<Skeleton className="h-5 w-12 mr-3 rounded" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
					<div className="flex space-x-1 ml-2">
						<Skeleton className="h-8 w-8 rounded-md" />
						<Skeleton className="h-8 w-8 rounded-md" />
					</div>
				</div>
			))}
		</div>
	);
}
