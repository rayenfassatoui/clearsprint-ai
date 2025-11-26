'use client';

import { FileText, Upload, Type, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GenerateButton } from '@/components/generate-button';
import { Dropzone } from '@/components/dropzone';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

interface EmptyProjectStateProps {
  projectId: number;
  docUrl?: string | null;
  docName?: string | null;
}

export function EmptyProjectState({
  projectId,
  docUrl,
  docName,
}: EmptyProjectStateProps) {
  const router = useRouter();

  const handleUploadComplete = () => {
    toast.success('Document uploaded successfully');
    router.refresh();
  };

  if (!docUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-4 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/20">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Let's Build Your Backlog
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            This project is empty. Upload your PRD or paste your requirements to
            generate a comprehensive backlog with AI.
          </p>
        </div>

        <div className="w-full max-w-2xl bg-card border rounded-2xl shadow-sm overflow-hidden">
          <Tabs defaultValue="upload" className="w-full">
            <div className="border-b px-6 py-2 bg-muted/30">
              <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="paste" className="gap-2">
                  <Type className="w-4 h-4" />
                  Paste Text
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8">
              <TabsContent value="upload" className="mt-0 space-y-4">
                <div className="text-center mb-6">
                  <h3 className="font-semibold text-lg">Upload PRD Document</h3>
                  <p className="text-sm text-muted-foreground">
                    Support for PDF, DOCX, and TXT files up to 10MB
                  </p>
                </div>
                <Dropzone
                  projectId={projectId}
                  onUploadComplete={handleUploadComplete}
                />
              </TabsContent>

              <TabsContent value="paste" className="mt-0">
                <div className="text-center mb-6">
                  <h3 className="font-semibold text-lg">Paste Requirements</h3>
                  <p className="text-sm text-muted-foreground">
                    Paste your raw text requirements directly
                  </p>
                </div>
                <Dropzone
                  projectId={projectId}
                  onUploadComplete={handleUploadComplete}
                  defaultPasteMode={true}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center animate-in fade-in zoom-in duration-500">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-md mx-auto"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-20" />
          <div className="relative bg-linear-to-br from-primary/10 to-primary/5 p-8 rounded-full w-32 h-32 mx-auto flex items-center justify-center ring-1 ring-primary/20 shadow-lg">
            <FileText className="w-16 h-16 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Ready to Generate
          </h2>
          <p className="text-muted-foreground">
            Document processed successfully. Click below to generate your
            backlog.
          </p>
        </div>

        {docUrl && (
          <div className="flex items-center justify-between p-4 border rounded-xl bg-card/50 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center overflow-hidden">
              <div className="p-2 bg-primary/10 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium truncate max-w-[180px]">
                {docName || 'Uploaded Document'}
              </span>
            </div>
            <Link href={docUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-muted-foreground hover:text-primary"
              >
                Preview
              </Button>
            </Link>
          </div>
        )}
      </motion.div>

      <div className="flex flex-col items-center space-y-4 pt-4">
        <GenerateButton
          projectId={projectId}
          className="h-14 px-10 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-linear-to-r from-primary to-primary/90"
          variant="default"
        />
        <p className="text-xs text-muted-foreground max-w-xs opacity-70">
          AI will analyze your document and create Epics, Tasks, and Subtasks.
        </p>
      </div>
    </div>
  );
}
