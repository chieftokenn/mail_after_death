"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { supabaseBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AuthPanel } from "@/components/auth/auth-panel";

const STEPS = [
  {
    id: "pack",
    title: "Nom du pack",
    description: "Décrivez en une phrase ce que contient ce pack post-mortem.",
  },
  {
    id: "recipient",
    title: "Destinataire principal",
    description: "Indiquez la personne qui recevra automatiquement ce pack.",
  },
  {
    id: "message",
    title: "Message & instructions",
    description: "Précisez le ton, les secrets ou les accès à transférer.",
  },
  {
    id: "trigger",
    title: "Déclenchement",
    description: "Choisissez après combien de jours d'inactivité le pack se libère.",
  },
  {
    id: "save",
    title: "Sauvegarder votre pack",
    description: "Connectez-vous pour enregistrer définitivement votre pack.",
  },
] as const;

const STORAGE_KEY = "mad_pack_draft";

const fadeVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const defaultFormData = {
  packName: "",
  packSummary: "",
  recipientName: "",
  recipientEmail: "",
  message: "",
  inactivityDays: 90,
  manualUnlock: true,
};

export function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSavePack = useCallback(async () => {
    if (!supabaseBrowserClient) {
      setSaveError("Supabase n'est pas configuré.");
      return;
    }

    const {
      data: { session },
    } = await supabaseBrowserClient.auth.getSession();

    if (!session) {
      setSaveError("Vous devez être connecté pour sauvegarder.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // 1. Créer ou récupérer le profil
      const { error: profileError } = await supabaseBrowserClient
        .from("profiles")
        .upsert(
          {
            id: session.user.id,
            display_name: session.user.email?.split("@")[0] || "Utilisateur",
          },
          { onConflict: "id" },
        )
        .select()
        .single();

      if (profileError) throw profileError;

      // 2. Créer le pack
      const { data: pack, error: packError } = await supabaseBrowserClient
        .from("packs")
        .insert({
          owner_id: session.user.id,
          title: formData.packName,
          summary: formData.packSummary,
          status: "draft",
        })
        .select()
        .single();

      if (packError) throw packError;

      // 3. Créer le destinataire
      const { data: recipient, error: recipientError } = await supabaseBrowserClient
        .from("recipients")
        .insert({
          owner_id: session.user.id,
          full_name: formData.recipientName,
          email: formData.recipientEmail,
          preferred_channel: "email",
        })
        .select()
        .single();

      if (recipientError) throw recipientError;

      // 4. Lier le pack au destinataire
      const { error: linkError } = await supabaseBrowserClient.from("pack_recipients").insert({
        pack_id: pack.id,
        recipient_id: recipient.id,
        custom_message: formData.message,
        delivery_channel: "email",
        requires_manual_confirmation: formData.manualUnlock,
      });

      if (linkError) throw linkError;

      // 5. Créer la règle de déclenchement
      const { error: ruleError } = await supabaseBrowserClient.from("trigger_rules").insert({
        pack_id: pack.id,
        type: "deadman",
        config: {
          inactivity_days: formData.inactivityDays,
        },
        notification_sequence: [
          { delay_days: 0, channel: "email" },
          { delay_days: 7, channel: "email" },
          { delay_days: 30, channel: "email" },
        ],
      });

      if (ruleError) throw ruleError;

      // Nettoyer le localStorage et rediriger
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/packs/${pack.id}/created`);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Erreur lors de la sauvegarde du pack.",
      );
      setIsSaving(false);
    }
  }, [formData, router]);

  // Charger depuis localStorage au démarrage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData({ ...defaultFormData, ...parsed });
        } catch {
          // Ignore invalid JSON
        }
      }
    }
  }, []);

  // Vérifier l'auth au chargement et à chaque changement de step
  useEffect(() => {
    const checkAuth = async () => {
      if (!supabaseBrowserClient) return;
      const {
        data: { session },
      } = await supabaseBrowserClient.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    // Écouter les changements d'auth
    if (supabaseBrowserClient) {
      const {
        data: { subscription },
      } = supabaseBrowserClient.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
        if (session && currentStep === STEPS.length - 1) {
          // Si on vient de s'authentifier et qu'on est sur l'étape de sauvegarde, sauvegarder automatiquement
          handleSavePack();
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [currentStep, handleSavePack]);

  const progressValue = ((currentStep + 1) / STEPS.length) * 100;

  const summaryItems = useMemo(
    () => [
      {
        label: "Nom du pack",
        value: formData.packName,
      },
      {
        label: "Destinataire",
        value: `${formData.recipientName} · ${formData.recipientEmail}`,
      },
      {
        label: "Inactivité",
        value: `${formData.inactivityDays} jours avant libération`,
      },
      {
        label: "Validation manuelle",
        value: formData.manualUnlock ? "Requise par MAD" : "Automatique",
      },
    ],
    [formData],
  );

  const stepDescription = STEPS[currentStep]?.description;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === STEPS.length - 1 && isAuthenticated) {
      // Si on est sur la dernière étape et authentifié, sauvegarder
      handleSavePack();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const updateField =
    <T extends keyof typeof formData>(field: T) =>
    (value: (typeof formData)[T]) => {
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };
        // Sauvegarder dans localStorage à chaque changement
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });
    };

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <TooltipProvider>
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row">
        <aside className="space-y-6 lg:w-2/5">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-amber-100/50 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
              MAD onboarding
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-foreground">
              Préparez votre premier pack post-mortem
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Chaque étape est pensée pour guider un utilisateur non technique. Nous posons une
              question à la fois, avec un bref contexte pour rester serein.
            </p>
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-4 text-sm text-primary-foreground">
              <p className="font-medium">Conseil</p>
              <p className="mt-1 text-primary-foreground/80">
                Répondez spontanément, vous pourrez toujours ajuster votre pack avant de le
                verrouiller.
              </p>
            </div>
          </div>

          <Card className="border-none bg-card/80 shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle>Parcours en 4 temps</CardTitle>
              <CardDescription>
                Téléchargez vos idées, nous orchestrons la libération plus tard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 text-sm">
                {STEPS.map((step, index) => {
                  const isActive = index === currentStep;
                  const isDone = index < currentStep;
                  return (
                    <li key={step.id} className="flex items-start gap-3 rounded-xl p-2 transition">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                          isDone
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : isActive
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p
                          className={`font-medium ${
                            isActive ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-card to-muted shadow-lg">
            <CardHeader>
              <CardTitle>Récap express</CardTitle>
              <CardDescription>Ce que vous avez déjà défini pour ce pack.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border bg-card/80 p-4 text-sm"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-base font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1">
          <Card className="border-none bg-card/90 shadow-2xl backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-500">
                    Étape {currentStep + 1} / {STEPS.length}
                  </p>
                  <CardTitle className="text-3xl text-foreground">{STEPS[currentStep]?.title}</CardTitle>
                </div>
                <motion.span
                  key={currentStep}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-muted-foreground"
                >
                  {stepDescription}
                </motion.span>
              </div>
              <Progress value={progressValue} className="h-2 rounded-full bg-muted" />
            </CardHeader>
            <CardContent className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={STEPS[currentStep]?.id}
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {currentStep === 0 && (
                    <div className="space-y-3">
                      <Label htmlFor="packName">Nom du pack</Label>
                      <Input
                        id="packName"
                        value={formData.packName}
                        onChange={(event) => updateField("packName")(event.target.value)}
                        placeholder="Ex: Accès familiaux sécurisés"
                        className="h-12 text-base"
                      />
                      <Label htmlFor="packSummary" className="text-sm text-muted-foreground">
                        Résumé rapide
                      </Label>
                      <Input
                        id="packSummary"
                        value={formData.packSummary}
                        onChange={(event) => updateField("packSummary")(event.target.value)}
                        placeholder="Quelques mots pour reconnaître facilement ce pack."
                      />
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="recipientName">Nom complet</Label>
                        <Input
                          id="recipientName"
                          value={formData.recipientName}
                          onChange={(event) => updateField("recipientName")(event.target.value)}
                          placeholder="Ex: Agnès Martin"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recipientEmail">Email sécurisé</Label>
                        <Input
                          id="recipientEmail"
                          type="email"
                          value={formData.recipientEmail}
                          onChange={(event) => updateField("recipientEmail")(event.target.value)}
                          placeholder="agnes@email.com"
                        />
                      </div>
                      <div className="md:col-span-2 rounded-2xl border border-dashed border-border bg-muted/60 p-4 text-sm text-muted-foreground">
                        Nous vérifierons ce destinataire avant libération pour éviter les erreurs et
                        garantir un audit clair.
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-3">
                      <Label htmlFor="message">Message d&rsquo;ouverture</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(event) => updateField("message")(event.target.value)}
                        placeholder="Expliquez ce que contient le pack et comment agir."
                        className="min-h-[160px] resize-none text-base"
                      />
                      <p className="text-sm text-muted-foreground">
                        Astuce : gardez un ton simple et ajoutez les instructions critiques dans les pièces
                        jointes chiffrées.
                      </p>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="inactivityDays">Délais d&rsquo;inactivité</Label>
                        <Input
                          id="inactivityDays"
                          type="number"
                          min={15}
                          max={540}
                          step={15}
                          value={formData.inactivityDays}
                          onChange={(event) =>
                            updateField("inactivityDays")(Number(event.target.value))
                          }
                        />
                        <p className="text-sm text-muted-foreground">
                          Nous envoyons plusieurs emails de réveil avant de considérer votre compte inactif.
                          Vous pouvez ajuster ce délai à tout moment.
                        </p>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/70 p-4">
                        <div>
                          <p className="font-medium text-foreground">Double validation</p>
                          <p className="text-sm text-muted-foreground">
                            Un membre de l'équipe MAD confirme chaque libération sensible.
                          </p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={formData.manualUnlock ? "default" : "outline"}
                              onClick={() => updateField("manualUnlock")(!formData.manualUnlock)}
                            >
                              {formData.manualUnlock ? "Activée" : "Désactivée"}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {formData.manualUnlock
                              ? "Vous serez contacté(e) avant toute libération."
                              : "Envoi automatique des contenus après l'inactivité définie."}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-6">
                      {!isAuthenticated ? (
                        <>
                          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
                            <p className="text-sm font-medium text-amber-900">
                              Connectez-vous pour sauvegarder votre pack
                            </p>
                            <p className="mt-2 text-sm text-amber-700">
                              Vos données sont déjà sauvegardées localement. Une fois connecté, votre pack
                              sera enregistré définitivement et vous accéderez à votre dashboard.
                            </p>
                          </div>
                          <div className="rounded-2xl border border-border bg-muted/50 p-6">
                            <AuthPanel />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
                            <p className="text-sm font-medium text-emerald-900">
                              ✓ Vous êtes connecté
                            </p>
                            <p className="mt-2 text-sm text-emerald-700">
                              Cliquez sur &ldquo;Sauvegarder mon pack&rdquo; pour finaliser la création.
                            </p>
                          </div>
                          {saveError && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                              {saveError}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="justify-center"
                >
                  Revenir
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isSaving || (isLastStep && !isAuthenticated)}
                  className="flex-1 justify-center bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving
                    ? "Sauvegarde en cours..."
                    : isLastStep && isAuthenticated
                      ? "Sauvegarder mon pack"
                      : isLastStep
                        ? "Connectez-vous pour sauvegarder"
                        : "Étape suivante"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </TooltipProvider>
  );
}

export default OnboardingFlow;

