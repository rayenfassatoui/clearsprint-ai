'use client';

import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { GenerateButton } from '@/components/generate-button';
import { PushToJiraModal } from '@/components/push-to-jira-modal';
import { RefineAllDialog } from '@/components/refine-all-dialog';
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
        <Card className="h-full flex flex-col group-hover:border-primary/50 group-hover:shadow-lg transition-all duration-300 overflow-hidden relative">
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
            className="flex justify-between pt-4 border-t bg-muted/20 relative z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <GenerateButton projectId={project.id} />
            <div className="flex gap-2">
              <RefineAllDialog projectId={project.id} />
              <PushToJiraModal
                projectId={project.id}
                projectTitle={project.name || 'Untitled'}
              />
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
