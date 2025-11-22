'use client';

import { motion } from 'framer-motion';
import {
  BrainCircuit,
  CheckCircle2,
  ListTodo,
  Loader2,
  PenTool,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoadingStateProps {
  status: 'idle' | 'loading' | 'success' | 'error';
}

const steps = [
  { id: 'analyzing', label: 'Analyzing Document', icon: BrainCircuit },
  { id: 'drafting', label: 'Drafting Epics', icon: PenTool },
  { id: 'finalizing', label: 'Structuring Backlog', icon: ListTodo },
];

export function GenerationLoadingState({ status }: LoadingStateProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (status === 'loading') {
      const interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev + 1) % steps.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [status]);

  if (status === 'idle') return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card border shadow-xl rounded-xl p-8 max-w-md w-full space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            {status === 'success' ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-4 bg-green-100 rounded-full text-green-600 dark:bg-green-900/30 dark:text-green-400"
              >
                <CheckCircle2 className="w-8 h-8" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="p-4 bg-primary/10 rounded-full text-primary"
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
            )}
          </div>
          <h3 className="text-xl font-semibold">
            {status === 'success' ? 'Backlog Generated!' : 'AI is working...'}
          </h3>
          <p className="text-muted-foreground">
            {status === 'success'
              ? 'Your project is ready. Redirecting...'
              : 'We are crafting your Jira backlog from the uploaded document.'}
          </p>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0.5, x: -10 }}
                  animate={{
                    opacity: isActive || isCompleted ? 1 : 0.4,
                    x: 0,
                    scale: isActive ? 1.02 : 1,
                  }}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary/5 border border-primary/20' : ''
                  }`}
                >
                  <div
                    className={`mr-3 p-2 rounded-full ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`font-medium ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <motion.div layoutId="active-indicator" className="ml-auto">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
