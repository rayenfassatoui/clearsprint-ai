'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, ArrowLeft, RefreshCw, AlertTriangle, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UnifiedSyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  jiraProjectKey: string;
}

export function UnifiedSyncModal({ open, onOpenChange, projectId, jiraProjectKey }: UnifiedSyncModalProps) {
  // Mock data for now - in real implementation this would come from a hook/server action
  const pushItems = [
    { id: 1, title: 'Fix login bug', status: 'Done' },
    { id: 2, title: 'Update landing page', status: 'In Progress' },
  ];
  const pullItems = [
    { id: 'JIRA-123', title: 'API Rate Limiting', status: 'To Do' },
  ];
  const [conflicts, setConflicts] = useState([
    { id: 3, jiraId: 'JIRA-101', title: 'Refactor Auth', localStatus: 'Done', remoteStatus: 'In Progress', resolved: false, winner: null as 'local' | 'remote' | null },
  ]);

  const handleResolve = (id: number, winner: 'local' | 'remote') => {
    setConflicts(prev => prev.map(c => c.id === id ? { ...c, resolved: true, winner } : c));
  };

  const handleSync = () => {
    toast.success('Sync completed successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Sync with Jira ({jiraProjectKey})
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="push" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="push" className="gap-2">
              Push to Jira
              <Badge variant="secondary" className="ml-1">{pushItems.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pull" className="gap-2">
              Pull from Jira
              <Badge variant="secondary" className="ml-1">{pullItems.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="conflicts" className="gap-2 text-red-500 data-[state=active]:text-red-600">
              Conflicts
              <Badge variant="destructive" className="ml-1">{conflicts.filter(c => !c.resolved).length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="push" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground">
              These changes will be pushed to Jira.
            </div>
            <ScrollArea className="h-[300px] border rounded-md p-4">
                {pushItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="font-medium">{item.title}</span>
                        <Badge>{item.status}</Badge>
                    </div>
                ))}
            </ScrollArea>
            <div className="flex justify-end">
                <Button onClick={handleSync}>Push All Changes</Button>
            </div>
          </TabsContent>

          <TabsContent value="pull" className="space-y-4 mt-4">
             <div className="text-sm text-muted-foreground">
              These updates will be pulled from Jira.
            </div>
             <ScrollArea className="h-[300px] border rounded-md p-4">
                {pullItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="font-medium">{item.title}</span>
                        <Badge variant="outline">{item.status}</Badge>
                    </div>
                ))}
            </ScrollArea>
            <div className="flex justify-end">
                <Button variant="secondary" onClick={handleSync}>Pull All Updates</Button>
            </div>
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-4 mt-4">
             <div className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Resolve these conflicts to continue syncing.
            </div>
             <ScrollArea className="h-[300px] border rounded-md p-4">
                {conflicts.map(item => (
                    <div key={item.id} className={`space-y-3 py-4 border-b last:border-0 ${item.resolved ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between">
                            <div className="font-medium">{item.title}</div>
                            {item.resolved && (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                    Resolved ({item.winner === 'local' ? 'Keep Local' : 'Use Jira'})
                                </Badge>
                            )}
                        </div>
                        {!item.resolved && (
                            <div className="grid grid-cols-2 gap-4">
                                <div 
                                    onClick={() => handleResolve(item.id, 'local')}
                                    className="p-3 border rounded-md bg-muted/20 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                                >
                                    <div className="text-xs text-muted-foreground mb-1 group-hover:text-primary">Local Version</div>
                                    <div className="font-semibold">{item.localStatus}</div>
                                    <div className="mt-2 text-xs text-primary opacity-0 group-hover:opacity-100">Click to keep</div>
                                </div>
                                <div 
                                    onClick={() => handleResolve(item.id, 'remote')}
                                    className="p-3 border rounded-md bg-muted/20 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                                >
                                    <div className="text-xs text-muted-foreground mb-1 group-hover:text-primary">Jira Version</div>
                                    <div className="font-semibold">{item.remoteStatus}</div>
                                    <div className="mt-2 text-xs text-primary opacity-0 group-hover:opacity-100">Click to use</div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </ScrollArea>
            <div className="flex justify-end">
                <Button disabled={conflicts.some(c => !c.resolved)} onClick={handleSync}>
                    Sync Resolved
                </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
