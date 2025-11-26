"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { PackForm } from "@/components/packs/pack-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogoText } from "@/components/logo";

export default function EditPackPage() {
  const params = useParams();
  const packId = params.id as string;
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header compact avec logo */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/dashboard">
            <LogoText variant="dark" />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href={`/packs/${packId}`}>
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Annuler
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu avec style différent - plus compact et professionnel */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* En-tête de section avec icône */}
        <div className="mb-8 flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Pencil className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Modifier le pack</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Mettez à jour les informations de votre pack post-mortem
            </p>
          </div>
        </div>

        {/* Formulaire avec style compact */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <PackForm packId={packId} />
        </div>
      </main>
    </div>
  );
}

