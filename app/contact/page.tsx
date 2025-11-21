'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Copy, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const email = 'hello@clearsprint.ai';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success('Email copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy email');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="container mx-auto max-w-4xl px-4 py-16 flex-1 flex flex-col">
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-8 pl-0 hover:bg-transparent hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Have questions, feedback, or just want to say hello? We'd love to
              hear from you.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-primary/50 to-primary/30 opacity-20 blur transition duration-500 group-hover:opacity-50" />
            <button
              type="button"
              onClick={handleCopy}
              className="relative flex items-center gap-4 rounded-2xl border bg-card px-8 py-6 text-2xl font-medium shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] md:text-4xl"
            >
              <Mail className="h-8 w-8 text-primary md:h-10 md:w-10" />
              <span>{email}</span>
              <div className="ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                {copied ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </div>
            </button>
          </div>

          <div className="text-sm text-muted-foreground">
            Click to copy or{' '}
            <a
              href={`mailto:${email}`}
              className="text-primary hover:underline"
            >
              open in email client
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
