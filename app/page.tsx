import Link from "next/link";
import Image from "next/image";
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
import { DottedSurface } from "@/components/ui/dotted-surface";

const capabilities = [
  {
    title: "Priorisation automatique",
    description: "L'IA analyse vos sprints et ajuste les priorités en temps réel selon l'urgence et l'impact."
  },
  {
    title: "Détection proactive",
    description: "Identifie les risques et blocages avant qu'ils n'affectent votre équipe."
  },
  {
    title: "Métriques intelligentes",
    description: "Visualisez la vélocité, la charge et les tendances pour optimiser chaque sprint."
  },
  {
    title: "Rappels contextuels",
    description: "Notifications adaptées au comportement de chaque membre pour éviter les retards."
  },
  {
    title: "Collaboration fluide",
    description: "Synchronisation instantanée entre tous les appareils et membres de l'équipe."
  },
  {
    title: "Interface intuitive",
    description: "Design moderne et épuré pour une expérience utilisateur sans friction."
  }
];

const benefits = [
  {
    metric: "45 jours",
    label: "Déploiement complet",
    description: "De zéro à production avec toutes les fonctionnalités essentielles"
  },
  {
    metric: "3 sprints",
    label: "Itérations claires",
    description: "Fondations, intelligence, et finition avec jalons définis"
  },
  {
    metric: "100%",
    label: "Alignement d'équipe",
    description: "Vue partagée, synchronisation temps réel, zéro ambiguïté"
  }
];

const LogoMark = () => (
  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 shadow-[0_0_45px_rgba(16,185,129,0.4)]">
    <svg
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12"
      fill="currentColor"
      aria-hidden
    >
      <path d="M270.31 351.85c115.23-.04 230.46-.01 345.69-.02 48.31-.07 96.61.14 144.92-.1-49.42 53.32-98.56 106.9-148.12 160.1 44.46 47.96 89.35 95.52 134.04 143.29 5.01 5.51 10.37 10.7 15.21 16.37-12.64.76-25.36.2-38.02.37-151.23-.03-302.47-.01-453.7-.01-.01-106.67-.02-213.34-.02-320m66.94 65.32c-.17 63.07-.08 126.13-.07 189.19 87.04.28 174.09.01 261.13.14-29.37-31.41-58.91-62.67-88.17-94.19 11.11-12.25 22.52-24.23 33.85-36.28 18.08-19.84 36.86-39.05 54.68-59.11-3.56.3-7.13.34-10.69.29-83.58-.04-167.16.02-250.73-.04" />
    </svg>
  </div>
);

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden font-sans text-zinc-100">
      {/* Selective gradient overlays - only in specific regions */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[60vh] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.03),transparent_70%)]" />
      <div className="pointer-events-none absolute top-96 left-1/4 h-96 w-96 rounded-full bg-emerald-500/1.5 blur-3xl" />

      {/* Dotted Surface Effect - positioned slightly below center */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 top-[40%]">
          <DottedSurface />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 size-full -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_50%)] blur-3xl"
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-24 px-8 py-24 md:px-12 lg:gap-32 lg:py-32">
        <header className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-6">
            <LogoMark />
            <div className="space-y-3 pt-1">
              <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs">
                ClearSprint AI
              </Badge>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                Espace de travail intelligent pour des équipes collaboratives livrant dans les délais.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-500 whitespace-nowrap">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden />
            <span>Optimisé pour la feuille de route de lancement sur 45 jours</span>
          </div>
        </header>

        <section className="space-y-16">
          {/* Hero Content - Two Column Layout */}
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
            <div className="space-y-10">
              <div className="space-y-8">
                <h1 className="text-balance text-5xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl tracking-tight">
                  Orchestrez chaque sprint avec un partenaire IA conçu pour les équipes collaboratives.
                </h1>
                <p className="text-pretty text-base text-zinc-400 sm:text-lg leading-relaxed">
                  Centralisez vos projets, automatisez la priorisation et gardez une longueur d'avance sur les risques grâce à des analyses prédictives qui maintiennent votre équipe alignée, productive et à l'heure.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  asChild
                  className="bg-emerald-500 text-black shadow-[0_20px_45px_-18px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400 hover:scale-105 text-sm font-medium px-6 py-2.5"
                >
                  <Link href="#">Lancer un projet</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-emerald-500/30 bg-transparent text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 hover:scale-105 text-sm font-medium px-6 py-2.5"
                >
                  <Link href="#">Voir le backlog produit</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 content-start">
              <div className="rounded-3xl border border-emerald-500/10 bg-white/5 px-8 py-8 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm hover:bg-white/8 hover:scale-[1.02] transition-all duration-300">
                <p className="text-xs uppercase tracking-widest text-emerald-300 font-medium">Synchronisation temps réel</p>
                <p className="mt-4 text-xl font-semibold leading-snug">Vue partagée</p>
                <p className="mt-3 text-xs text-zinc-400 leading-relaxed">Les mises à jour sont diffusées instantanément sur chaque appareil.</p>
              </div>
              <div className="rounded-3xl border border-emerald-500/10 bg-white/5 px-8 py-8 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm hover:bg-white/8 hover:scale-[1.02] transition-all duration-300">
                <p className="text-xs uppercase tracking-widest text-emerald-300 font-medium">Relances IA</p>
                <p className="mt-4 text-xl font-semibold leading-snug">Zéro échéance manquée</p>
                <p className="mt-3 text-xs text-zinc-400 leading-relaxed">Des rappels personnalisés anticipent les risques avant qu'ils ne surviennent.</p>
              </div>
              <div className="rounded-3xl border border-emerald-500/10 bg-white/5 px-8 py-8 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm hover:bg-white/8 hover:scale-[1.02] transition-all duration-300">
                <p className="text-xs uppercase tracking-widest text-emerald-300 font-medium">Analytique</p>
                <p className="mt-4 text-xl font-semibold leading-snug">Clarté des performances</p>
                <p className="mt-3 text-xs text-zinc-400 leading-relaxed">Des tableaux de bord révèlent le débit, la charge et les goulets d'étranglement à venir.</p>
              </div>
            </div>
          </div>

          {/* Full Width Roadmap Card */}
          <Card className="border-emerald-500/15 bg-white/5 backdrop-blur rounded-3xl w-full">
            <CardHeader className="pb-6">
              <CardTitle className="text-white text-lg">Feuille de route prête au lancement</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">
                Conçue autour de la fenêtre de livraison de 45 jours décrite dans le cahier des charges.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-3">
              <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-6 hover:bg-emerald-500/10 hover:scale-[1.02] transition-all duration-300">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 font-semibold text-sm">
                  1
                </span>
                <div className="space-y-2">
                  <p className="font-semibold text-white text-sm">Sprint 1 — Fondations</p>
                  <p className="text-zinc-400 leading-relaxed text-xs">
                    Un hub projets & tâches avec gestion des rôles fournit une source unique de vérité avant le jour 15.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-6 hover:bg-emerald-500/10 hover:scale-[1.02] transition-all duration-300">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 font-semibold text-sm">
                  2
                </span>
                <div className="space-y-2">
                  <p className="font-semibold text-white text-sm">Sprint 2 — Intelligence</p>
                  <p className="text-zinc-400 leading-relaxed text-xs">
                    Synchronisation temps réel, priorisation IA et rappels prédictifs sont déployés entre les jours 16 et 25.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-6 hover:bg-emerald-500/10 hover:scale-[1.02] transition-all duration-300">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 font-semibold text-sm">
                  3
                </span>
                <div className="space-y-2">
                  <p className="font-semibold text-white text-sm">Sprint 3 — Finition & lancement</p>
                  <p className="text-zinc-400 leading-relaxed text-xs">
                    Finitions UI, tests et déploiement assurent une mise en production maîtrisée avant le jour 45.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Showcase with Image */}
          <div className="relative rounded-3xl overflow-hidden border border-emerald-500/20 bg-linear-to-br from-emerald-500/5 to-teal-500/5 p-1">
            <div className="relative rounded-2xl overflow-hidden h-80 bg-zinc-900">
              <Image
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=500&fit=crop"
                alt="Équipe collaborative utilisant ClearSprint"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-r from-[#040b08]/95 via-[#040b08]/60 to-transparent" />
              <div className="relative z-10 h-full flex items-center px-12">
                <div className="max-w-xl space-y-4">
                  <h3 className="text-2xl font-semibold text-white">
                    Pilotez vos projets avec confiance
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Transformez la complexité en clarté. ClearSprint vous donne une vue d'ensemble complète de vos sprints, vous permettant d'anticiper les obstacles et de maintenir votre équipe sur la bonne voie.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-semibold text-white tracking-tight">
              Tout ce dont votre équipe a besoin
            </h2>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Une plateforme complète qui s'adapte à votre workflow et propulse votre productivité
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability, index) => (
              <div
                key={capability.title}
                className="group relative rounded-2xl border border-zinc-800 bg-linear-to-br from-white/3 to-white/1 p-8 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-500 hover:scale-[1.02]"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/3 group-hover:to-transparent transition-all duration-500" />
                
                <div className="relative space-y-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-all duration-300">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-white leading-snug">
                      {capability.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
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
              className="relative rounded-2xl border border-zinc-800 bg-white/2 p-8 backdrop-blur-sm hover:border-zinc-700 transition-all duration-300 group"
            >
              <div className="absolute top-0 left-0 w-1 h-12 bg-linear-to-b from-emerald-500 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="space-y-3">
                <p className="text-3xl font-bold text-emerald-400">{benefit.metric}</p>
                <h3 className="text-base font-semibold text-white">{benefit.label}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-8 pt-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-semibold text-white">Conçu pour les équipes modernes</h2>
            <p className="text-sm text-zinc-400">Des organisations du monde entier transforment leur gestion de sprints</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="group relative rounded-2xl overflow-hidden border border-teal-600/20 bg-linear-to-br from-teal-500/5 to-emerald-500/5 p-1 hover:border-teal-500/40 transition-all duration-500">
              <div className="relative rounded-xl overflow-hidden h-64 bg-zinc-900">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                  alt="Équipe de développement collaborant"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#040b08] via-transparent to-transparent opacity-50" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-semibold text-white">Collaboration en temps réel</p>
                </div>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden border border-emerald-600/20 bg-linear-to-br from-emerald-500/5 to-teal-500/5 p-1 hover:border-emerald-500/40 transition-all duration-500">
              <div className="relative rounded-xl overflow-hidden h-64 bg-zinc-900">
                <Image
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop"
                  alt="Sprint planning réussi"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#040b08] via-transparent to-transparent opacity-50" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-semibold text-white">Planification intelligente</p>
                </div>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden border border-cyan-600/20 bg-linear-to-br from-cyan-500/5 to-emerald-500/5 p-1 hover:border-cyan-500/40 transition-all duration-500">
              <div className="relative rounded-xl overflow-hidden h-64 bg-zinc-900">
                <Image
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop"
                  alt="Suivi des performances"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#040b08] via-transparent to-transparent opacity-50" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-semibold text-white">Analyse en direct</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mt-12 rounded-3xl border border-emerald-600/30 bg-linear-to-r from-emerald-500/5 via-teal-500/3 to-cyan-500/5 p-12 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-white">
                Prêt à transformer votre gestion de sprints ?
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Rejoignez les équipes qui font confiance à ClearSprint pour livrer à l'heure, chaque fois.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-emerald-500 text-black shadow-[0_20px_45px_-18px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400 hover:scale-105 text-sm font-medium px-8 py-3"
              >
                <Link href="#">Commencer maintenant</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-teal-500/50 bg-teal-500/5 text-teal-300 hover:bg-teal-500/15 hover:text-teal-200 hover:scale-105 text-sm font-medium px-8 py-3"
              >
                <Link href="#">Voir la démo</Link>
              </Button>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between pt-16 border-t border-zinc-800/50">
          <p className="leading-relaxed">
            Conçu pour les chefs de projet internes, les collaborateurs et les équipes pilotées par l'IA.
          </p>
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-emerald-300 transition hover:text-emerald-200 whitespace-nowrap"
          >
            Découvrir le cahier des charges
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </footer>
      </main>
    </div>
  );
}
