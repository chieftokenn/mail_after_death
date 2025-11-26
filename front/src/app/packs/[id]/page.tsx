"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { supabaseBrowserClient } from "@/lib/supabase-browser";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Pack = {
  id: string;
  title: string;
  summary: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function PackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const packId = params.id as string;
  const [pack, setPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPack = async () => {
      if (!supabaseBrowserClient || !packId) {
        router.push("/dashboard");
        return;
      }

      const {
        data: { session },
      } = await supabaseBrowserClient.auth.getSession();

      if (!session) {
        router.push("/");
        return;
      }

      const { data: packData, error: packError } = await supabaseBrowserClient
        .from("packs")
        .select("*")
        .eq("id", packId)
        .eq("owner_id", session.user.id)
        .single();

      if (packError || !packData) {
        router.push("/dashboard");
        return;
      }

      setPack(packData);
      setLoading(false);
    };

    loadPack();
  }, [packId, router]);

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce pack ? Cette action est irréversible.")) {
      return;
    }

    if (!supabaseBrowserClient || !packId) return;

    try {
      const { error } = await supabaseBrowserClient.from("packs").delete().eq("id", packId);

      if (error) throw error;

      router.push("/dashboard");
    } catch (error) {
      console.error("Erreur suppression pack:", error);
      alert("Erreur lors de la suppression du pack.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!pack) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-50/30 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950 transition-colors duration-300">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              ← Retour au dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href={`/packs/${packId}/edit`}>
              <Button variant="outline">Modifier</Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{pack.title}</CardTitle>
            {pack.summary && (
              <CardDescription className="text-base">{pack.summary}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Page de détail du pack. Fonctionnalités à venir : modification, activation, ajout de
              fichiers, etc.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

