'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ArrowRight,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type { SyncChange } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

interface SyncPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changes: SyncChange[];
  isSyncing: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

export function SyncPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  changes,
  isSyncing,
}: SyncPreviewModalProps) {
  const toCreate = useMemo(
    () => changes.filter((c) => c.changeType === 'create'),
    [changes],
  );
  const toUpdate = useMemo(
    () => changes.filter((c) => c.changeType === 'update'),
    [changes],
  );
  const toDelete = useMemo(
    () => changes.filter((c) => c.changeType === 'soft_delete'),
    [changes],
  );

  const totalChanges = changes.length;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !isSyncing && !open && onClose()}
    >
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold">Sync Preview</DialogTitle>
          <DialogDescription className="text-base">
            {changes.length === 0
              ? 'Everything is in sync! No changes to apply.'
              : `Review ${totalChanges} change${totalChanges !== 1 ? 's' : ''} before syncing to Jira.`}
          </DialogDescription>

          {/* Stats Bar */}
          {totalChanges > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 p-4 bg-muted/50 rounded-lg border"
            >
              {toCreate.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {toCreate.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Create</p>
                  </div>
                </div>
              )}

              {toUpdate.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      {toUpdate.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Update</p>
                  </div>
                </div>
              )}

              {toDelete.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Trash2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-600 dark:text-orange-400">
                      {toDelete.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Delete</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <AnimatePresence>
              {changes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-lg font-medium mb-1">All synced up!</p>
                  <p className="text-sm text-muted-foreground">
                    No changes detected
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {/* Create Section */}
                  {toCreate.length > 0 && (
                    <motion.div variants={itemVariants}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Plus className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-green-600 dark:text-green-400">
                          Create in Jira ({toCreate.length})
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {toCreate.map((c, idx) => (
                          <motion.div
                            key={c.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group p-4 border rounded-lg bg-green-50/50 dark:bg-green-900/10 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1">
                                <p className="font-medium text-sm mb-1">
                                  {c.title}
                                </p>
                                {c.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {c.description}
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 shrink-0"
                              >
                                New
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Update Section */}
                  {toUpdate.length > 0 && (
                    <motion.div variants={itemVariants}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Edit3 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          Update in Jira ({toUpdate.length})
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {toUpdate.map((c, idx) => (
                          <motion.div
                            key={c.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex justify-between items-start gap-3 mb-2">
                              <p className="font-medium text-sm">{c.title}</p>
                              <Badge
                                variant="outline"
                                className="text-xs shrink-0"
                              >
                                {c.jiraId}
                              </Badge>
                            </div>
                            {c.diff && c.diff.length > 0 && (
                              <div className="space-y-1.5 mt-3 p-3 bg-white dark:bg-slate-950 rounded border">
                                {c.diff.map((d, i) => (
                                  <div
                                    key={`${c.id}-diff-${i}`}
                                    className="flex items-center gap-2 text-xs"
                                  >
                                    <span className="text-muted-foreground min-w-[60px] font-medium">
                                      {d.field}:
                                    </span>
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <span className="line-through text-red-500 truncate flex-1">
                                        {d.oldValue}
                                      </span>
                                      <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                                      <span className="text-green-600 dark:text-green-400 truncate flex-1 font-medium">
                                        {d.newValue}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Delete Section */}
                  {toDelete.length > 0 && (
                    <motion.div variants={itemVariants}>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                          Mark as [DELETED] in Jira ({toDelete.length})
                        </h3>
                      </div>
                      <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-3">
                        <div className="flex gap-2">
                          <Info className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-orange-700 dark:text-orange-300">
                            These tickets will be marked as [DELETED] in Jira to
                            preserve history.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {toDelete.map((c, idx) => (
                          <motion.div
                            key={c.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group p-4 border rounded-lg bg-orange-50/30 dark:bg-orange-900/5 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex justify-between items-center gap-3">
                              <span className="line-through text-muted-foreground text-sm">
                                {c.title}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs shrink-0"
                              >
                                {c.jiraId}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSyncing}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSyncing || changes.length === 0}
            className="min-w-[140px] relative overflow-hidden group"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <span className="relative z-10">Confirm Sync</span>
                <motion.div
                  className="absolute inset-0 bg-primary-foreground/10"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
