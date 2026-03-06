import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export function JiraDiscoverySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="border-muted/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
            <div className="flex items-center gap-3 w-full">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Skeleton className="h-3 w-1/3" />
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-end">
            <Skeleton className="h-8 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
