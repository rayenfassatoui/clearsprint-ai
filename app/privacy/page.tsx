import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
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
          Privacy Policy
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
            <h2 className="text-2xl font-semibold">
              1. Information We Collect
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We collect information you provide directly to us, such as when
              you create an account, update your profile, or communicate with
              us. This may include your name, email address, and any other
              information you choose to provide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              2. How We Use Your Information
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We use the information we collect to provide, maintain, and
              improve our services, to communicate with you, and to monitor and
              analyze trends, usage, and activities in connection with our
              services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Data Security</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We take reasonable measures to help protect information about you
              from loss, theft, misuse, and unauthorized access, disclosure,
              alteration, and destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Third-Party Services</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We may use third-party services, such as Jira (Atlassian), to
              provide certain features. Your use of these services is subject to
              their respective privacy policies and terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Cookies</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to collect information
              about your activity, browser, and device. You can instruct your
              browser to refuse all cookies or to indicate when a cookie is
              being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              6. Changes to this Policy
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. If we make
              changes, we will notify you by revising the date at the top of the
              policy and, in some cases, we may provide you with additional
              notice.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
