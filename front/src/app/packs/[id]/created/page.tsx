"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { supabaseBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Pack = {
  id: string;
  title: string;
  summary: string | null;
  status: string;
  created_at: string;
};

type Recipient = {
  full_name: string;
  email: string;
};

type TriggerRule = {
  config: {
    inactivity_days: number;
  };
};

export default function PackCreatedPage() {
  const params = useParams();
  const router = useRouter();
  const packId = params.id as string;
  const [pack, setPack] = useState<Pack | null>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [triggerRule, setTriggerRule] = useState<TriggerRule | null>(null);
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

      // Charger le pack
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

      // Charger le destinataire
      const { data: recipientData } = await supabaseBrowserClient
        .from("pack_recipients")
        .select("recipients(full_name, email)")
        .eq("pack_id", packId)
        .limit(1)
        .single();

      if (recipientData?.recipients) {
        setRecipient(recipientData.recipients as Recipient);
      }

      // Charger la règle de déclenchement
      const { data: ruleData } = await supabaseBrowserClient
        .from("trigger_rules")
        .select("config")
        .eq("pack_id", packId)
        .limit(1)
        .single();

      if (ruleData) {
        setTriggerRule(ruleData as TriggerRule);
      }

      setLoading(false);
    };

    loadPack();
  }, [packId, router]);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-emerald-50/30 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950 transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-8 w-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-semibold text-foreground">Pack créé avec succès</h1>
          <p className="mt-2 text-muted-foreground">Votre pack post-mortem est maintenant enregistré</p>
        </div>

        <Card className="mb-6 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{pack.title}</CardTitle>
            {pack.summary && <CardDescription className="text-base">{pack.summary}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {recipient && (
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Destinataire</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{recipient.full_name}</p>
                  <p className="text-sm text-muted-foreground">{recipient.email}</p>
                </div>
              )}

              {triggerRule && (
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Règle de déclenchement
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {triggerRule.config.inactivity_days} jours d&rsquo;inactivité
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Plusieurs emails de rappel seront envoyés avant la libération
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Statut</p>
                <p className="mt-2 text-lg font-semibold capitalize text-foreground">{pack.status}</p>
                <p className="text-sm text-muted-foreground">Pack en brouillon, prêt à être activé</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Date de création</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {new Date(pack.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20 p-4">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-3">Prochaines étapes</p>
              <div className="space-y-2">
                <Link
                  href={`/packs/${packId}`}
                  className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-amber-900/30 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 transition hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Ajouter des fichiers chiffrés à votre pack</span>
                </Link>
                <Link
                  href={`/packs/${packId}/edit`}
                  className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-amber-900/30 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 transition hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Modifier les règles de déclenchement si nécessaire</span>
                </Link>
                <button
                  onClick={() => {
                    // TODO: Implémenter l'activation du pack
                    alert("Fonctionnalité d'activation à venir");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-100 dark:bg-amber-900/50 px-3 py-2 text-sm font-medium text-amber-900 dark:text-amber-200 transition hover:bg-amber-200 dark:hover:bg-amber-900/70"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Activer le pack une fois prêt</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto">
              Voir tous mes packs
            </Button>
          </Link>
          <Link href={`/packs/${packId}`}>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Voir les détails
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

