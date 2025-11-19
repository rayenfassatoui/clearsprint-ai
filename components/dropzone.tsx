'use client';

import {
  CheckCircle,
  FileText,
  Loader2,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadDoc } from '@/actions/upload.server';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface DropzoneProps {
  onUploadComplete?: (result: {
    url: string;
    text: string;
    projectId?: number;
  }) => void;
}

export function Dropzone({ onUploadComplete }: DropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      setUploadStatus('idle');
      setErrorMessage(null);

      const formData = new FormData();
      formData.append('mode', 'file');
      formData.append('file', file);

      try {
        const result = await uploadDoc(formData);

        if (result.error) {
          setUploadStatus('error');
          setErrorMessage(result.error);
        } else if (result.success && result.url && result.text) {
          setUploadStatus('success');
          if (onUploadComplete) {
            onUploadComplete({
              url: result.url,
              text: result.text,
              projectId: result.projectId,
            });
          }
        }
      } catch (error) {
        setUploadStatus('error');
        setErrorMessage('An unexpected error occurred.');
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadComplete],
  );

  const handleTextSubmit = async () => {
    if (!pastedText.trim()) {
      setErrorMessage('Please enter some text.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('mode', 'text');
    formData.append('text', pastedText);

    try {
      const result = await uploadDoc(formData);

      if (result.error) {
        setUploadStatus('error');
        setErrorMessage(result.error);
      } else if (result.success && result.url && result.text) {
        setUploadStatus('success');
        if (onUploadComplete) {
          onUploadComplete({
            url: result.url,
            text: result.text,
            projectId: result.projectId,
          });
        }
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-end space-x-2">
        <Switch
          id="paste-mode"
          checked={isPasteMode}
          onCheckedChange={setIsPasteMode}
        />
        <Label htmlFor="paste-mode" className="cursor-pointer">
          Paste Text Instead
        </Label>
      </div>

      {isPasteMode ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <Textarea
            placeholder="Paste your PRD content here..."
            className="min-h-[200px] resize-y"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
          />
          <Button
            onClick={handleTextSubmit}
            disabled={isUploading || !pastedText.trim()}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Import Text
              </>
            )}
          </Button>
          {errorMessage && (
            <p className="text-sm text-red-600 mt-2 text-center">
              {errorMessage}
            </p>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-top-2 duration-300',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50',
            isUploading && 'opacity-50 pointer-events-none',
            uploadStatus === 'error' && 'border-red-500 bg-red-50',
            uploadStatus === 'success' && 'border-green-500 bg-green-50',
          )}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center space-y-4 text-center p-6">
            {isUploading ? (
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            ) : uploadStatus === 'success' ? (
              <CheckCircle className="w-12 h-12 text-green-500" />
            ) : uploadStatus === 'error' ? (
              <XCircle className="w-12 h-12 text-red-500" />
            ) : (
              <div className="p-4 bg-gray-100 rounded-full">
                <UploadCloud className="w-8 h-8 text-gray-500" />
              </div>
            )}

            <div className="space-y-1">
              {isUploading ? (
                <p className="text-lg font-medium text-gray-700">
                  Uploading and processing...
                </p>
              ) : uploadStatus === 'success' ? (
                <p className="text-lg font-medium text-green-700">
                  Upload complete!
                </p>
              ) : uploadStatus === 'error' ? (
                <p className="text-lg font-medium text-red-700">
                  Upload failed
                </p>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-700">
                    {isDragActive
                      ? 'Drop the file here'
                      : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">PDF or TXT (max 10MB)</p>
                </>
              )}
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
