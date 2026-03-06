'use client';

import { useState, useMemo } from 'react';
import { JiraProjectCard } from './jira-project-card';
import type { JiraProjectDiscovery } from '@/types/jira';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface JiraProjectsListProps {
  projects: JiraProjectDiscovery[];
}

export function JiraProjectsList({ projects }: JiraProjectsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.key.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || project.syncStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="synced">Synced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No matching projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <JiraProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
