import { ArrowRight } from 'lucide-react';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import BackgroundEffects from '@/components/decorations/BackgroundEffects';
import { LandingNav } from '@/components/landing-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { AuthShader } from '@/components/ui/auth-shader';
import DatabaseWithRestApi from '@/components/ui/database-with-rest-api';

const capabilities = [
  {
    title: 'Priorisation automatique',
    description:
      "L'IA analyse vos sprints et ajuste les priorités en temps réel selon l'urgence et l'impact.",
  },
  {
    title: 'Détection proactive',
    description:
      "Identifie les risques et blocages avant qu'ils n'affectent votre équipe.",
  },
  {
    title: 'Métriques intelligentes',
    description:
      'Visualisez la vélocité, la charge et les tendances pour optimiser chaque sprint.',
  },
  {
    title: 'Rappels contextuels',
    description:
      'Notifications adaptées au comportement de chaque membre pour éviter les retards.',
  },
  {
    title: 'Collaboration fluide',
    description:
      "Synchronisation instantanée entre tous les appareils et membres de l'équipe.",
  },
  {
    title: 'Interface intuitive',
    description:
      'Design moderne et épuré pour une expérience utilisateur sans friction.',
  },
];

const benefits = [
  {
    metric: '45 jours',
    label: 'Déploiement complet',
    description:
      'De zéro à production avec toutes les fonctionnalités essentielles',
  },
  {
    metric: '3 sprints',
    label: 'Itérations claires',
    description: 'Fondations, intelligence, et finition avec jalons définis',
  },
  {
    metric: '100%',
    label: "Alignement d'équipe",
    description: 'Vue partagée, synchronisation temps réel, zéro ambiguïté',
  },
];

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="relative min-h-screen overflow-hidden font-sans bg-background text-foreground">
      {/* Selective gradient overlays - theme aware */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[60vh] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.03),transparent_70%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05),transparent_70%)]" />
      <div className="pointer-events-none absolute top-96 left-1/4 h-96 w-96 rounded-full bg-emerald-500/1.5 dark:bg-emerald-500/3 blur-3xl" />

      <BackgroundEffects particleCount={400} particleBaseSize={1} />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-24 px-8 py-12 md:px-12 lg:gap-32 ">
        <LandingNav isAuthenticated={!!session} />

        <section className="space-y-16">
          {/* Hero Content - Compact & Elegant */}
          <div className="relative grid gap-12 lg:grid-cols-2 lg:gap-12 items-center py-12">
            {/* Shader Background Effect */}
            <div className="absolute -inset-4 -z-10 opacity-20 dark:opacity-30 pointer-events-none overflow-hidden rounded-3xl">
              <AuthShader />
            </div>

            <div className="space-y-8 relative z-10">
              <div className="space-y-6">
                <h1 className="text-balance text-4xl font-bold leading-tight text-foreground sm:text-5xl tracking-tight">
                  Orchestrez chaque sprint avec un partenaire IA.
                </h1>
                <p className="text-pretty text-base text-muted-foreground sm:text-lg leading-relaxed max-w-lg">
                  Centralisez vos projets, automatisez la priorisation et gardez
                  une longueur d'avance sur les risques grâce à des analyses
                  prédictives.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  asChild
                  className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 hover:scale-105 text-sm font-medium px-6 py-2.5"
                >
                  <Link href="/auth/signin">Lancer un projet</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="text-foreground hover:bg-primary/5 hover:text-primary transition-colors text-sm font-medium px-6 py-2.5"
                >
                  <Link href="#">Voir le backlog produit</Link>
                </Button>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <DatabaseWithRestApi
                title="Synchronisation IA en temps réel"
                circleText="AI"
                badgeTexts={{
                  first: 'Analyse',
                  second: 'Sprint',
                  third: 'Risques',
                  fourth: 'Optimisation',
                }}
                buttonTexts={{
                  first: 'ClearSprint',
                  second: 'v1.0',
                }}
              />
            </div>
          </div>

          {/* Full Width Roadmap Cards */}
          <Card className="border-primary/20 bg-card dark:bg-card/50 backdrop-blur rounded-3xl w-full shadow-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-foreground text-lg">
                Feuille de route prête au lancement
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Conçue autour de la fenêtre de livraison de 45 jours décrite
                dans le cahier des charges.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-3">
              <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-6 hover:bg-primary/10 dark:hover:bg-primary/15 hover:scale-[1.02] transition-all duration-300">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
                  1
                </span>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground text-sm">
                    Sprint 1 — Fondations
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    Un hub projets & tâches avec gestion des rôles fournit une
                    source unique de vérité avant le jour 15.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-6 hover:bg-primary/10 dark:hover:bg-primary/15 hover:scale-[1.02] transition-all duration-300">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
                  2
                </span>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground text-sm">
                    Sprint 2 — Intelligence
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    Synchronisation temps réel, priorisation IA et rappels
                    prédictifs sont déployés entre les jours 16 et 25.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-6 hover:bg-primary/10 dark:hover:bg-primary/15 hover:scale-[1.02] transition-all duration-300">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
                  3
                </span>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground text-sm">
                    Sprint 3 — Finition & lancement
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    Finitions UI, tests et déploiement assurent une mise en
                    production maîtrisée avant le jour 45.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Showcase with Image */}
          <div className="relative rounded-3xl overflow-hidden border border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 p-1 shadow-sm">
            <div className="relative rounded-2xl overflow-hidden h-80 bg-muted">
              <Image
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=500&fit=crop"
                alt="Équipe collaborative utilisant ClearSprint"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-r from-background/95 dark:from-background/95 via-background/60 dark:via-background/60 to-transparent" />
              <div className="relative z-10 h-full flex items-center px-12">
                <div className="max-w-xl space-y-4">
                  <h3 className="text-2xl font-semibold text-foreground">
                    Pilotez vos projets avec confiance
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Transformez la complexité en clarté. ClearSprint vous donne
                    une vue d'ensemble complète de vos sprints, vous permettant
                    d'anticiper les obstacles et de maintenir votre équipe sur
                    la bonne voie.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight">
              Tout ce dont votre équipe a besoin
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Une plateforme complète qui s'adapte à votre workflow et propulse
              votre productivité
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability, index) => (
              <div
                key={capability.title}
                className="group relative rounded-2xl border border-border bg-card dark:bg-card/50 p-8 backdrop-blur-sm hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-500 hover:scale-[1.02]"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500" />

                <div className="relative space-y-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-foreground leading-snug">
                      {capability.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {capability.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-3 pt-12">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.label}
              className="relative rounded-2xl border border-border bg-card dark:bg-card/50 p-8 backdrop-blur-sm hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="absolute top-0 left-0 w-1 h-12 bg-linear-to-b from-primary to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="space-y-3">
                <p className="text-3xl font-bold text-primary">
                  {benefit.metric}
                </p>
                <h3 className="text-base font-semibold text-foreground">
                  {benefit.label}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-8 pt-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">
              Conçu pour les équipes modernes
            </h2>
            <p className="text-sm text-muted-foreground">
              Des organisations du monde entier transforment leur gestion de
              sprints
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="group relative rounded-2xl overflow-hidden border border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 p-1 hover:border-primary/40 transition-all duration-500 shadow-sm">
              <div className="relative rounded-xl overflow-hidden h-64 bg-muted">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                  alt="Équipe de développement collaborant"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background dark:from-background via-transparent to-transparent opacity-50 dark:opacity-70" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Collaboration en temps réel
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden border border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 p-1 hover:border-primary/40 transition-all duration-500 shadow-sm">
              <div className="relative rounded-xl overflow-hidden h-64 bg-muted">
                <Image
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop"
                  alt="Sprint planning réussi"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background dark:from-background via-transparent to-transparent opacity-50 dark:opacity-70" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Planification intelligente
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden border border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 p-1 hover:border-primary/40 transition-all duration-500 shadow-sm">
              <div className="relative rounded-xl overflow-hidden h-64 bg-muted">
                <Image
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop"
                  alt="Suivi des performances"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background dark:from-background via-transparent to-transparent opacity-50 dark:opacity-70" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Analyse en direct
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mt-12 rounded-3xl border border-primary/30 bg-linear-to-r from-primary/5 via-primary/3 to-primary/5 p-12 backdrop-blur-sm overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_60%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_60%)] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-foreground">
                Prêt à transformer votre gestion de sprints ?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Rejoignez les équipes qui font confiance à ClearSprint pour
                livrer à l'heure, chaque fois.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-primary text-primary-foreground shadow-[0_20px_45px_-18px_rgba(16,185,129,0.7)] dark:shadow-[0_20px_45px_-18px_rgba(16,185,129,0.4)] transition hover:bg-primary/90 hover:scale-105 text-sm font-medium px-8 py-3"
              >
                <Link href="/auth/signin">Commencer maintenant</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-primary/50 bg-primary/5 text-primary hover:bg-primary/15 hover:text-primary hover:scale-105 text-sm font-medium px-8 py-3"
              >
                <Link href="#">Voir la démo</Link>
              </Button>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between pt-16 border-t border-border/50">
          <p className="leading-relaxed">
            Conçu pour les chefs de projet internes, les collaborateurs et les
            équipes pilotées par l'IA.
          </p>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="#"
              className="inline-flex items-center gap-2 text-primary transition hover:text-primary/80 whitespace-nowrap"
            >
              Découvrir le cahier des charges
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
