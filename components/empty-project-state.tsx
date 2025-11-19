import { FileText } from 'lucide-react';
import { GenerateButton } from '@/components/generate-button';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyProjectStateProps {
    projectId: number;
    docUrl?: string | null;
    docName?: string | null;
}

export function EmptyProjectState({
    projectId,
    docUrl,
    docName,
}: EmptyProjectStateProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="space-y-4 max-w-md mx-auto">
                <div className="bg-primary/10 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                    <FileText className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                    Document Uploaded Successfully
                </h2>
                <p className="text-muted-foreground">
                    We have processed your document and are ready to generate your backlog.
                </p>

                {docUrl && (
                    <div className="flex items-center justify-center p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <FileText className="w-5 h-5 mr-3 text-muted-foreground" />
                        <span className="text-sm font-medium truncate max-w-[200px]">
                            {docName || 'Uploaded Document'}
                        </span>
                        <div className="ml-4 pl-4 border-l">
                            <Link href={docUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="link" size="sm" className="h-auto p-0">
                                    Preview
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center space-y-4">
                <GenerateButton
                    projectId={projectId}
                    className="h-14 px-8 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    variant="default"
                />
                <p className="text-xs text-muted-foreground max-w-xs">
                    Click to generate Epics, Tasks, and Subtasks based on your document.
                </p>
            </div>
        </div>
    );
}
