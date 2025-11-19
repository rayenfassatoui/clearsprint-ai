'use client';

import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { GenerateButton } from '@/components/generate-button';
import { SyncWithJiraModal } from '@/components/push-to-jira-modal';
import { GeneralAiEditDialog } from '@/components/refine-all-dialog';
import { RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ProjectCardProps {
  project: {
    id: number;
    name: string | null;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Link
        href={`/dashboard/projects/${project.id}`}
        className="block group h-full"
      >
        <Card className="h-full min-h-[220px] flex flex-col group-hover:border-primary/50 group-hover:shadow-lg transition-all duration-300 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <CardHeader className="pb-2 relative z-10">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle
                  className="text-lg truncate leading-tight"
                  title={project.name || 'Untitled'}
                >
                  {project.name || 'Untitled Project'}
                </CardTitle>
                <CardDescription>
                  Created on {new Date().toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-grow relative z-10">
            <div className="flex items-center text-sm text-muted-foreground mb-4 bg-muted/50 w-fit px-2 py-1 rounded-md">
              <FileText className="mr-2 h-3.5 w-3.5" />
              Document Uploaded
            </div>
          </CardContent>

          <CardFooter
            className="flex justify-between items-center pt-4 border-t bg-muted/20 relative z-10 gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <GenerateButton projectId={project.id} className="w-full" />

            <div className="flex gap-1 shrink-0">
              <TooltipProvider>
                <GeneralAiEditDialog
                  projectId={project.id}
                  trigger={
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary">
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>General AI Edit</p>
                      </TooltipContent>
                    </Tooltip>
                  }
                />

                <SyncWithJiraModal
                  projectId={project.id}
                  projectTitle={project.name || 'Untitled'}
                  trigger={
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sync with Jira</p>
                      </TooltipContent>
                    </Tooltip>
                  }
                />
              </TooltipProvider>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
