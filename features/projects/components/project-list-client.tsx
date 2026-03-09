'use client';

import { useState, useMemo } from 'react';
import { ProjectCard } from '@/features/projects/components/project-card';
import type { Project } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProjectListClientProps {
  projects: Project[];
}

export function ProjectListClient({ projects }: ProjectListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      return (project.name?.toLowerCase() || '').includes(
        searchQuery.toLowerCase(),
      );
    });
  }, [projects, searchQuery]);

  if (projects.length === 0) {
    return (
      <div className='text-center p-12 border-2 border-dashed rounded-xl bg-muted/20'>
        <p className='text-muted-foreground'>
          No projects yet. Upload a document to get started.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='relative max-w-md'>
        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search your projects...'
          className='pl-9'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className='text-center p-8 border border-dashed rounded-lg'>
          <p className='text-muted-foreground'>No matching projects found.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
