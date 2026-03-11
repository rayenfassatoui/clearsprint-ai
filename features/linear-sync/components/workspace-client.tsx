'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { WorkspaceProject, WorkspaceTicket } from '@/lib/types';
import { WorkspaceHeader } from './workspace-header';
import { WorkspaceListView } from './workspace-list-view';
import { WorkspaceKanbanView } from './workspace-kanban-view';
import { WorkspaceToolbar } from './workspace-toolbar';
import { TicketDetailSheet } from './ticket-detail-sheet';
import { BulkSelectToolbar } from './bulk-select-toolbar';
import { DiffReviewModal } from './diff-review-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, LayoutDashboard } from 'lucide-react';
import { pushToLinear } from '../actions/push-sync.server';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { filterTickets } from '../utils/filter';

interface WorkspaceClientProps {
  project: WorkspaceProject;
  initialTickets: WorkspaceTicket[];
  linearConnected: boolean;
}

export function WorkspaceClient({
  project,
  initialTickets,
}: WorkspaceClientProps) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  // Critical: Sync server data with local state when router.refresh() fetches new data
  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);
  const [pushing, setPushing] = useState(false);
  const [activeTicket, setActiveTicket] = useState<WorkspaceTicket | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const pendingChanges = tickets.filter((t) =>
    ['modified', 'new_local'].includes(t.syncStatus),
  );

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((num) => num !== id) : [...prev, id],
    );
  };

  const handlePush = useCallback(
    async (selectedIdsToPush?: number[]) => {
      if (pendingChanges.length === 0) return;
      setPushing(true);
      try {
        const res = await pushToLinear(
          project.id,
          selectedIdsToPush,
        );
        if (res.success && res.data) {
          const pushedCount = res.data.pushed;
          const failedCount = res.data.failed;

          // Optimistically update pushed tickets to 'synced' status in local state
          if (selectedIdsToPush && selectedIdsToPush.length > 0) {
            setTickets((prev) =>
              prev.map((t) =>
                selectedIdsToPush.includes(t.id)
                  ? { ...t, syncStatus: 'synced' as const, draftData: null }
                  : t,
              ),
            );
          }

          if (failedCount === 0) {
            toast.success(
              `Pushed ${pushedCount} ticket${pushedCount !== 1 ? 's' : ''} to Linear`,
            );
          } else {
            toast.warning(`Pushed ${pushedCount}, failed ${failedCount}`);
          }
          setReviewModalOpen(false);
          setSelectedIds([]);
        } else {
          toast.error(res.error || 'Failed to push to Linear');
        }
      } catch (err) {
        console.error(err);
        toast.error('An unexpected error occurred during push');
      } finally {
        setPushing(false);
      }
    },
    [pendingChanges.length, project.id],
  );

  const handlePullSuccess = useCallback(() => {
    // Refresh route to reload server-side data (tickets)
    router.refresh();
  }, [router]);

  const filtered = filterTickets(tickets, search, statusFilter);

  return (
    <div className='space-y-6 animate-in fade-in zoom-in-95 duration-500 max-w-[1200px] mx-auto pb-24 relative'>
      <WorkspaceHeader
        project={project}
        pendingChangesCount={pendingChanges.length}
        isPushing={pushing}
        onPullSuccess={handlePullSuccess}
        onPushClick={() => setReviewModalOpen(true)}
      />

      <div className='flex items-center justify-between gap-4 py-2 sticky top-0 bg-background/95 backdrop-blur-md z-10 border-b border-border/40 pb-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search tickets...'
            className='pl-9 bg-muted/30 border-muted focus-visible:ring-[--linear]'
          />
        </div>

        <div className='flex gap-2'>
          <WorkspaceToolbar
            viewMode={viewMode}
            onViewModeChange={(mode) => {
              setViewMode(mode);
              setStatusFilter('all'); // reset filter when switching views
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      </div>

      <AnimatePresence mode='wait'>
        {filtered.length === 0 ? (
          <motion.div
            key='empty-state'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className='flex flex-col items-center justify-center py-24 text-center px-4'
          >
            <div className='bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4'>
              <LayoutDashboard className='w-8 h-8 text-muted-foreground/50' />
            </div>
            <h3 className='text-lg font-semibold mb-1'>No tickets found</h3>
            <p className='text-sm text-muted-foreground max-w-sm'>
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters or search query.'
                : "This project doesn't have any tickets yet. Sync from Linear or create new ones."}
            </p>
          </motion.div>
        ) : viewMode === 'list' ? (
          <motion.div
            key='list-view'
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <WorkspaceListView
              tickets={filtered}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onClick={(ticket) => setActiveTicket(ticket)}
            />
          </motion.div>
        ) : (
          <motion.div
            key='kanban-view'
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <WorkspaceKanbanView
              tickets={filtered}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onClick={(ticket) => setActiveTicket(ticket)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Edit Toolbar */}
      <BulkSelectToolbar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onRefresh={() => setSelectedIds([])}
      />

      {/* Floating pending changes bar */}
      <AnimatePresence>
        {pendingChanges.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className='fixed bottom-6 left-1/2 -translate-x-1/2 bg-popover text-foreground border shadow-2xl px-6 py-4 rounded-2xl flex items-center justify-between min-w-[340px] z-50'
          >
            <div className='flex flex-col'>
              <span className='text-sm font-semibold'>
                {pendingChanges.length} unpublished{' '}
                {pendingChanges.length === 1 ? 'change' : 'changes'}
              </span>
              <span className='text-xs text-muted-foreground'>
                Review and sync to Linear
              </span>
            </div>
            <Button
              className='bg-[--linear] hover:bg-[--linear-hover] text-white'
              onClick={() => setReviewModalOpen(true)}
              disabled={pushing}
            >
              {pushing ? 'Pushing...' : 'Review & Push'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Sheet */}
      <TicketDetailSheet
        ticket={activeTicket}
        onClose={() => setActiveTicket(null)}
        onUpdate={(updatedTicket) => {
          setTickets(
            tickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
          );
          setActiveTicket(updatedTicket);
        }}
      />

      {/* Review & Push Modal */}
      <DiffReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        pendingTickets={pendingChanges}
        onPush={async (ids) => await handlePush(ids)}
        pushing={pushing}
      />
    </div>
  );
}
