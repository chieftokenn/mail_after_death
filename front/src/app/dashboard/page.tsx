"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { supabaseBrowserClient } from "@/lib/supabase-browser";
import { LogoText } from "@/components/logo";
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

type PackWithRecipient = Pack & {
  recipient_count: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [packs, setPacks] = useState<PackWithRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!supabaseBrowserClient) {
        router.push("/");
        return;
      }

      const {
        data: { session },
      } = await supabaseBrowserClient.auth.getSession();

      if (!session) {
        router.push("/");
        return;
      }

      setUserEmail(session.user.email || null);

      // Charger tous les packs
      const { data: packsData, error: packsError } = await supabaseBrowserClient
        .from("packs")
        .select("*")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: false });

      if (packsError) {
        console.error("Erreur chargement packs:", packsError);
        setLoading(false);
        return;
      }

      // Pour chaque pack, compter les destinataires
      const packsWithRecipients = await Promise.all(
        (packsData || []).map(async (pack) => {
          const { count } = await supabaseBrowserClient
            .from("pack_recipients")
            .select("*", { count: "exact", head: true })
            .eq("pack_id", pack.id);

          return {
            ...pack,
            recipient_count: count || 0,
          };
        }),
      );

      setPacks(packsWithRecipients);
      setLoading(false);
    };

    loadDashboard();
  }, [router]);

  const handleSignOut = async () => {
    if (supabaseBrowserClient) {
      await supabaseBrowserClient.auth.signOut();
      router.push("/");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "draft":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "released":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "draft":
        return "Brouillon";
      case "released":
        return "Libéré";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Chargement de votre dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-50/30 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950 transition-colors duration-300">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center transition-opacity hover:opacity-80">
              <LogoText />
            </Link>
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 border border-border/50">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-sm font-medium text-foreground">{userEmail}</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="gap-2 rounded-full px-4 hover:bg-muted">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Paramètres</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 rounded-full px-4 hover:bg-muted">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {packs.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Mes packs</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {packs.length} pack{packs.length > 1 ? "s" : ""} enregistré{packs.length > 1 ? "s" : ""}
                </p>
              </div>
              <Link href="/packs/new">
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer un pack
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {packs.map((pack) => {
                const handleDelete = async (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (
                    !confirm("Êtes-vous sûr de vouloir supprimer ce pack ? Cette action est irréversible.")
                  ) {
                    return;
                  }

                  if (!supabaseBrowserClient) return;

                  try {
                    const { error } = await supabaseBrowserClient
                      .from("packs")
                      .delete()
                      .eq("id", pack.id);

                    if (error) throw error;

                    window.location.reload();
                  } catch (error) {
                    console.error("Erreur suppression pack:", error);
                    alert("Erreur lors de la suppression du pack.");
                  }
                };

                return (
                  <Card
                    key={pack.id}
                    className="group transition-shadow hover:shadow-lg"
                  >
                    <Link href={`/packs/${pack.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="line-clamp-2 text-lg">
                              {pack.title}
                            </CardTitle>
                            {pack.summary && (
                              <CardDescription className="mt-2 line-clamp-2">
                                {pack.summary}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                              pack.status,
                            )}`}
                          >
                            {getStatusLabel(pack.status)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            <span>{pack.recipient_count} destinataire{pack.recipient_count > 1 ? "s" : ""}</span>
                          </div>
                          <span>
                            {new Date(pack.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-border">
                          <Link
                            href={`/packs/${pack.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Modifier
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={handleDelete}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Aucun pack</CardTitle>
              <CardDescription>
                Vous n&rsquo;avez pas encore créé de pack. Créez votre premier pack pour commencer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/onboarding">
                <Button>Créer mon premier pack</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
