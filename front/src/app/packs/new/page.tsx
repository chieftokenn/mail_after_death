import Link from "next/link";

import { PackForm } from "@/components/packs/pack-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function NewPackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-50/30 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950 transition-colors duration-300">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Créer un nouveau pack</h1>
            <p className="text-sm text-muted-foreground">Remplissez les informations ci-dessous</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                Retour au dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <PackForm />
      </main>
    </div>
  );
}

