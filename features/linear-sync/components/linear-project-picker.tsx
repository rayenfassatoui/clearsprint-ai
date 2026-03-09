'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  getLinearProjects,
  createWorkspaceProject,
} from '../actions/workspace-crud.server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Plus, Layers, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export function LinearProjectPicker() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLinearProjects();
      if (res.success && res.data) {
        setProjects(res.data);
      } else {
        setError(res.error || 'Failed to fetch projects');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && projects.length === 0) {
      fetchProjects();
    }
  }, [open, projects.length, fetchProjects]);

  const handleSelectProject = async (project: any) => {
    setLoading(true);
    try {
      const res = await createWorkspaceProject({
        linearProjectId: project.id,
        linearTeamId: project.teamId,
        linearProjectName: project.name,
        linearProjectKey: project.key,
      });

      if (res.success && res.data) {
        toast.success(`Connected ${project.name}`);
        setOpen(false);
        // Initial pull sync handled when navigating or we can trigger it
        router.push(`/dashboard/workspace/${res.data.id}`);
      } else {
        toast.error(res.error || 'Failed to connect project');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='bg-[#5E6AD2] hover:bg-[#4E5BCE] text-white shadow-lg shadow-[#5E6AD2]/20'>
          <Plus className='w-4 h-4 mr-2' />
          Import Linear Project
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px] p-0 overflow-hidden bg-card border-muted/40 shadow-2xl'>
        <DialogHeader className='p-6 pb-4 bg-muted/20 border-b'>
          <DialogTitle className='flex items-center gap-2 text-xl tracking-tight'>
            <Layers className='w-5 h-5 text-[#5E6AD2]' />
            Import from Linear
          </DialogTitle>
        </DialogHeader>

        <div className='p-4 border-b bg-background sticky top-0 z-10'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search by name or key...'
              className='pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-[#5E6AD2]'
            />
          </div>
        </div>

        <ScrollArea className='max-h-[350px] overflow-auto'>
          {loading && projects.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-12 text-muted-foreground gap-4'>
              <Loader2 className='w-8 h-8 animate-spin text-[#5E6AD2]' />
              <p className='text-sm font-medium'>Fetching projects...</p>
            </div>
          ) : error ? (
            <div className='flex flex-col items-center justify-center p-12 text-destructive gap-3 text-center px-8'>
              <AlertCircle className='w-8 h-8' />
              <p className='text-sm font-medium'>{error}</p>
              <Button
                variant='outline'
                size='sm'
                onClick={fetchProjects}
                className='mt-2'
              >
                Try Again
              </Button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-12 text-muted-foreground text-center'>
              <Layers className='w-10 h-10 mb-3 opacity-20' />
              <p className='text-sm font-medium'>No projects found</p>
              {search && (
                <p className='text-xs opacity-70 mt-1'>
                  Try a different search term
                </p>
              )}
            </div>
          ) : (
            <div className='p-2 divide-y divide-border/40'>
              {filteredProjects.map((project) => (
                <button
                  type='button'
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className='w-full flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors text-left group'
                >
                  <div className='space-y-1'>
                    <p className='font-medium text-sm text-foreground group-hover:text-[#5E6AD2] transition-colors'>
                      {project.name}
                    </p>
                    <p className='text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded-sm w-fit'>
                      {project.key}
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='opacity-0 group-hover:opacity-100 transition-opacity h-8'
                  >
                    Connect
                  </Button>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
