import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const featureHighlights = [
  {
    title: "Priorisation intelligente des tâches",
    description:
      "ClearSprint apprend de chaque sprint pour mettre en avant ce qui nécessite votre attention et signaler les blocages émergents avant qu'ils ne freinent l'équipe.",
  },
  {
    title: "Rappels prédictifs",
    description:
      "Des notifications adaptatives anticipent les retards et relancent les responsables quand leurs habitudes laissent présager un glissement d'échéance.",
  },
  {
    title: "Intelligence de performance en direct",
    description:
      "Des tableaux de bord en temps réel offrent une vision claire du flux, de la capacité et des risques pour rééquilibrer la charge instantanément.",
  },
];

const LogoMark = () => (
  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.35)]">
    <svg
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      className="h-9 w-9"
      fill="currentColor"
      aria-hidden
    >
      <path d="M270.31 351.85c115.23-.04 230.46-.01 345.69-.02 48.31-.07 96.61.14 144.92-.1-49.42 53.32-98.56 106.9-148.12 160.1 44.46 47.96 89.35 95.52 134.04 143.29 5.01 5.51 10.37 10.7 15.21 16.37-12.64.76-25.36.2-38.02.37-151.23-.03-302.47-.01-453.7-.01-.01-106.67-.02-213.34-.02-320m66.94 65.32c-.17 63.07-.08 126.13-.07 189.19 87.04.28 174.09.01 261.13.14-29.37-31.41-58.91-62.67-88.17-94.19 11.11-12.25 22.52-24.23 33.85-36.28 18.08-19.84 36.86-39.05 54.68-59.11-3.56.3-7.13.34-10.69.29-83.58-.04-167.16.02-250.73-.04" />
    </svg>
  </div>
);

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040b08] font-sans text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,118,110,0.2),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-20 rounded-full bg-emerald-500/5 blur-3xl" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-16 md:px-10 lg:gap-24 lg:py-24">
        <header className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <LogoMark />
            <div className="space-y-2">
              <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                ClearSprint AI
              </Badge>
              <p className="text-sm text-zinc-400">
                Espace de travail intelligent pour des équipes collaboratives livrant dans les délais.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden />
            Optimisé pour la feuille de route de lancement sur 45 jours
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Orchestrez chaque sprint avec un partenaire IA conçu pour les équipes collaboratives.
              </h1>
              <p className="text-pretty text-lg text-zinc-400 sm:text-xl">
                Centralisez vos projets, automatisez la priorisation et gardez une longueur d'avance sur les risques grâce à des analyses prédictives qui maintiennent votre équipe alignée, productive et à l'heure.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                className="bg-emerald-500 text-black shadow-[0_20px_45px_-18px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400"
              >
                <Link href="#">Lancer un projet</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-emerald-500/30 bg-transparent text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
              >
                <Link href="#">Voir le backlog produit</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-500/10 bg-white/5 px-5 py-4 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <p className="text-xs uppercase tracking-widest text-emerald-300">Synchronisation temps réel</p>
                <p className="mt-1 text-2xl font-semibold">Vue partagée</p>
                <p className="mt-1 text-sm text-zinc-400">Les mises à jour sont diffusées instantanément sur chaque appareil.</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/10 bg-white/5 px-5 py-4 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <p className="text-xs uppercase tracking-widest text-emerald-300">Relances IA</p>
                <p className="mt-1 text-2xl font-semibold">Zéro échéance manquée</p>
                <p className="mt-1 text-sm text-zinc-400">Des rappels personnalisés anticipent les risques avant qu'ils ne surviennent.</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/10 bg-white/5 px-5 py-4 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <p className="text-xs uppercase tracking-widest text-emerald-300">Analytique</p>
                <p className="mt-1 text-2xl font-semibold">Clarté des performances</p>
                <p className="mt-1 text-sm text-zinc-400">Des tableaux de bord révèlent le débit, la charge et les goulets d'étranglement à venir.</p>
              </div>
            </div>
          </div>

          <Card className="border-emerald-500/15 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Feuille de route prête au lancement</CardTitle>
              <CardDescription className="text-zinc-400">
                Conçue autour de la fenêtre de livraison de 45 jours décrite dans le cahier des charges.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-zinc-300">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                  1
                </span>
                <div>
                  <p className="font-medium text-white">Sprint 1 — Fondations</p>
                  <p className="text-sm text-zinc-400">
                    Un hub projets & tâches avec gestion des rôles fournit une source unique de vérité avant le jour 15.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                  2
                </span>
                <div>
                  <p className="font-medium text-white">Sprint 2 — Intelligence</p>
                  <p className="text-sm text-zinc-400">
                    Synchronisation temps réel, priorisation IA et rappels prédictifs sont déployés entre les jours 16 et 25.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                  3
                </span>
                <div>
                  <p className="font-medium text-white">Sprint 3 — Finition & lancement</p>
                  <p className="text-sm text-zinc-400">
                    Finitions UI, tests et déploiement assurent une mise en production maîtrisée avant le jour 45.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 rounded-3xl border border-emerald-500/15 bg-white/5 p-8 backdrop-blur lg:grid-cols-3">
          {featureHighlights.map((feature) => (
            <Card
              key={feature.title}
              className="border border-emerald-500/10 bg-transparent p-0 shadow-none"
            >
              <CardHeader className="px-6 pb-2">
                <CardTitle className="text-lg text-white">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 text-sm text-zinc-400">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </section>

        <footer className="flex flex-col gap-4 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Conçu pour les chefs de projet internes, les collaborateurs et les équipes pilotées par l'IA.
          </p>
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-emerald-300 transition hover:text-emerald-200"
          >
            Découvrir le cahier des charges complet
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </footer>
      </main>
    </div>
  );
}
