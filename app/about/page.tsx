import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
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

        <div className="space-y-16">
          <section className="text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl">
              Building the Future of{' '}
              <span className="text-primary">Sprint Planning</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              ClearSprint AI is on a mission to transform how product teams move
              from idea to execution.
            </p>
          </section>

          <section className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Our Story</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Born from the frustration of manual ticket creation and
                disjointed planning processes, ClearSprint AI was created to
                bridge the gap between Product Requirement Documents (PRDs) and
                actionable Jira tickets.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe that product managers and engineers should spend less
                time on administrative tasks and more time building great
                products.
              </p>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
              <div className="absolute inset-0 bg-grid-white/10 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
              <span className="text-9xl font-bold text-primary/20 select-none">
                AI
              </span>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center">Our Values</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: 'Efficiency',
                  description:
                    'We automate the mundane to unlock creativity and speed.',
                },
                {
                  title: 'Clarity',
                  description:
                    'We turn ambiguous requirements into clear, actionable tasks.',
                },
                {
                  title: 'Integration',
                  description:
                    'We fit seamlessly into your existing tools and workflows.',
                },
              ].map((value) => (
                <div
                  key={value.title}
                  className="rounded-xl border bg-card p-6 shadow-sm"
                >
                  <h3 className="mb-3 text-xl font-semibold">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
