'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { GenerateButton } from '@/components/generate-button';
import { SyncWithJiraModal } from '@/features/jira/components/push-to-jira-modal';
import { GeneralAiEditDialog } from '@/features/tickets/components/refine-all-dialog';
import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectCardProps {
  project: {
    id: number;
    name: string | null;
    description?: string | null;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Link
        href={`/dashboard/projects/${project.id}`}
        className="block group h-full"
      >
        <Card className="group relative flex h-full flex-col overflow-hidden border-muted/40 bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <CardHeader className="relative pb-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="line-clamp-1 text-xl font-semibold tracking-tight">
                  {project.name || 'Untitled Project'}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm">
                  {project.description || 'No description provided'}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditOpen(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="relative grow pb-2">
            <div className="p-4 flex flex-col grow">
              <div className="flex items-center text-sm text-muted-foreground mb-4 bg-muted/50 w-fit px-2 py-1 rounded-md">
                <FileText className="mr-2 h-3.5 w-3.5" />
                Document Uploaded
              </div>
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
              <GeneralAiEditDialog
                projectId={project.id}
                tooltip="General AI Edit"
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                }
              />

              <SyncWithJiraModal
                projectId={project.id}
                projectTitle={project.name || 'Untitled'}
                tooltip="Sync with Jira"
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
