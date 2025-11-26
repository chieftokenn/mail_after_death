"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { supabaseBrowserClient } from "@/lib/supabase-browser";
import { LogoText } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Profile = {
  id: string;
  display_name: string;
  kyc_level: string;
  default_deadman_delay: number;
  created_at: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    defaultDeadmanDelay: 90,
  });

  useEffect(() => {
    const loadSettings = async () => {
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

      // Charger le profil
      const { data: profileData, error: profileError } = await supabaseBrowserClient
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 = not found, on peut créer le profil
        console.error("Erreur chargement profil:", profileError);
      }

      if (profileData) {
        setProfile(profileData);
        setFormData({
          displayName: profileData.display_name || "",
          defaultDeadmanDelay: profileData.default_deadman_delay || 90,
        });
      } else {
        // Créer un profil par défaut
        const { data: newProfile } = await supabaseBrowserClient
          .from("profiles")
          .insert({
            id: session.user.id,
            display_name: session.user.email?.split("@")[0] || "Utilisateur",
            default_deadman_delay: 90,
          })
          .select()
          .single();

        if (newProfile) {
          setProfile(newProfile);
          setFormData({
            displayName: newProfile.display_name || "",
            defaultDeadmanDelay: newProfile.default_deadman_delay || 90,
          });
        }
      }

      setLoading(false);
    };

    loadSettings();
  }, [router]);

  const handleSave = async () => {
    if (!supabaseBrowserClient) return;

    const {
      data: { session },
    } = await supabaseBrowserClient.auth.getSession();

    if (!session) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const { error } = await supabaseBrowserClient
        .from("profiles")
        .upsert(
          {
            id: session.user.id,
            display_name: formData.displayName,
            default_deadman_delay: formData.defaultDeadmanDelay,
          },
          { onConflict: "id" },
        );

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Erreur lors de la sauvegarde des paramètres.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (supabaseBrowserClient) {
      await supabaseBrowserClient.auth.signOut();
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Chargement des paramètres...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <LogoText />
            <span className="text-sm text-slate-400">•</span>
            <p className="text-sm text-slate-500">{userEmail}</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="ghost">Retour au dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-6">
          {/* Profil */}
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>Informations personnelles et préférences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={userEmail || ""} disabled />
                <p className="text-xs text-slate-500">
                  L&rsquo;email ne peut pas être modifié depuis cette page.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Nom d&rsquo;affichage</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, displayName: event.target.value }))
                  }
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultDeadmanDelay">
                  Délai d&rsquo;inactivité par défaut (jours)
                </Label>
                <Input
                  id="defaultDeadmanDelay"
                  type="number"
                  min={15}
                  max={540}
                  step={15}
                  value={formData.defaultDeadmanDelay}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      defaultDeadmanDelay: Number(event.target.value),
                    }))
                  }
                />
                <p className="text-xs text-slate-500">
                  Ce délai sera utilisé par défaut lors de la création de nouveaux packs. Vous
                  pourrez toujours le modifier individuellement pour chaque pack.
                </p>
              </div>

              {saveError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {saveError}
                </div>
              )}

              {saveSuccess && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  Paramètres sauvegardés avec succès
                </div>
              )}

              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Sauvegarde..." : "Enregistrer les modifications"}
              </Button>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>Gestion de votre compte et authentification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">Niveau de vérification</p>
                <p className="mt-1 text-sm text-slate-600">
                  {profile?.kyc_level === "none"
                    ? "Aucune vérification"
                    : profile?.kyc_level === "basic"
                      ? "Vérification basique"
                      : "Vérification avancée"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Le niveau de vérification KYC sera disponible dans une prochaine version pour
                  débloquer les fonctionnalités premium.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Déconnexion</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Déconnectez-vous de votre compte MAD
                  </p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Vue d&rsquo;ensemble de votre activité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Compte créé</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Dernière activité
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {profile?.last_alive_ping
                      ? new Date(profile.last_alive_ping).toLocaleDateString("fr-FR")
                      : "Aujourd&rsquo;hui"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Niveau KYC</p>
                  <p className="mt-2 text-lg font-semibold capitalize text-slate-900">
                    {profile?.kyc_level || "Aucun"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mentions légales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations légales</CardTitle>
              <CardDescription>Important à connaître</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-900">
                  MAD n&rsquo;est pas un notaire
                </p>
                <p className="mt-2 text-sm text-amber-700">
                  Pour les dispositions légales de succession, consultez un professionnel. MAD
                  complète mais ne remplace pas nécessairement les actes authentiques selon la
                  juridiction.
                </p>
              </div>
              <div className="text-xs text-slate-500">
                <p>© {new Date().getFullYear()} MAD — Mail After Death</p>
                <p className="mt-1">
                  Pour toute question, contactez-nous à{" "}
                  <a href="mailto:contact@mailafterdeath.app" className="underline">
                    contact@mailafterdeath.app
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

