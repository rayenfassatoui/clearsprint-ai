import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-8 pl-0 hover:bg-transparent hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="mb-8 text-4xl font-bold tracking-tight lg:text-5xl">
          Terms of Service
        </h1>
        <p className="mb-12 text-lg text-muted-foreground">
          Last updated:{' '}
          {new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              By accessing and using ClearSprint AI ("the Service"), you agree
              to be bound by these Terms of Service. If you do not agree to
              these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              2. Description of Service
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              ClearSprint AI provides AI-powered sprint planning and Jira
              integration tools. We reserve the right to modify, suspend, or
              discontinue any part of the Service at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. User Accounts</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account. You agree to notify us immediately of any unauthorized
              use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Intellectual Property</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              The Service and its original content, features, and functionality
              are owned by ClearSprint AI and are protected by international
              copyright, trademark, patent, trade secret, and other intellectual
              property or proprietary rights laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              5. Limitation of Liability
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              In no event shall ClearSprint AI, nor its directors, employees,
              partners, agents, suppliers, or affiliates, be liable for any
              indirect, incidental, special, consequential, or punitive damages,
              including without limitation, loss of profits, data, use,
              goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Governing Law</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              These Terms shall be governed and construed in accordance with the
              laws, without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
