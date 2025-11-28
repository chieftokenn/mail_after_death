"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { supabaseBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const STEPS = [
  {
    id: "pack",
    title: "Nom du pack",
    description: "Décrivez ce que contient ce pack.",
  },
  {
    id: "recipient",
    title: "Destinataire",
    description: "Personne qui recevra ce pack.",
  },
  {
    id: "message",
    title: "Message",
    description: "Instructions pour le destinataire.",
  },
  {
    id: "trigger",
    title: "Déclenchement",
    description: "Règles de libération.",
  },
] as const;

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

type PackFormProps = {
  packId?: string;
};

export function PackForm({ packId }: PackFormProps = {}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(!!packId);

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
      router.push("/onboarding");
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

      router.push(`/packs/${pack.id}/created`);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Erreur lors de la sauvegarde du pack.",
      );
      setIsSaving(false);
    }
  }, [formData, router]);

  // Charger les données du pack si édition
  useEffect(() => {
    const loadPackData = async () => {
      if (!packId || !supabaseBrowserClient) {
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabaseBrowserClient.auth.getSession();

      if (!session) {
        router.push("/");
        return;
      }

      try {
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

        // Charger le destinataire
        const { data: recipientData } = await supabaseBrowserClient
          .from("pack_recipients")
          .select("recipients(full_name, email), custom_message, requires_manual_confirmation")
          .eq("pack_id", packId)
          .limit(1)
          .single();

        // Charger la règle de déclenchement
        const { data: ruleData } = await supabaseBrowserClient
          .from("trigger_rules")
          .select("config")
          .eq("pack_id", packId)
          .limit(1)
          .single();

        setFormData({
          packName: packData.title || "",
          packSummary: packData.summary || "",
          recipientName: (recipientData?.recipients as { full_name: string } | null)?.full_name || "",
          recipientEmail: (recipientData?.recipients as { email: string } | null)?.email || "",
          message: recipientData?.custom_message || "",
          inactivityDays: (ruleData?.config as { inactivity_days?: number })?.inactivity_days || 90,
          manualUnlock: recipientData?.requires_manual_confirmation ?? true,
        });
      } catch (error) {
        console.error("Erreur chargement pack:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadPackData();
  }, [packId, router]);

  // Vérifier l'auth au chargement
  useEffect(() => {
    const checkAuth = async () => {
      if (!supabaseBrowserClient) return;
      const {
        data: { session },
      } = await supabaseBrowserClient.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    if (supabaseBrowserClient) {
      const {
        data: { subscription },
      } = supabaseBrowserClient.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const progressValue = ((currentStep + 1) / STEPS.length) * 100;
  const isEditMode = !!packId;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (isAuthenticated) {
      handleSavePack();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSave = () => {
    if (isAuthenticated) {
      handleSavePack();
    }
  };

  const updateField =
    <T extends keyof typeof formData>(field: T) =>
    (value: (typeof formData)[T]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const isLastStep = currentStep === STEPS.length - 1;

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Chargement du pack...</p>
      </div>
    );
  }

  // Mode édition : formulaire compact en une seule vue
  if (isEditMode) {
    return (
      <TooltipProvider>
        <div className="space-y-6">
          {/* Section 1: Informations du pack */}
          <div className="space-y-4">
            <div className="border-b border-border pb-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Informations du pack
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="packName">Nom du pack</Label>
                <Input
                  id="packName"
                  value={formData.packName}
                  onChange={(event) => updateField("packName")(event.target.value)}
                  placeholder="Ex: Accès familiaux sécurisés"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packSummary">Résumé rapide</Label>
                <Input
                  id="packSummary"
                  value={formData.packSummary}
                  onChange={(event) => updateField("packSummary")(event.target.value)}
                  placeholder="Quelques mots pour reconnaître ce pack."
                  className="bg-input border-border"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Destinataire */}
          <div className="space-y-4">
            <div className="border-b border-border pb-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Destinataire
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Nom complet</Label>
                <Input
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={(event) => updateField("recipientName")(event.target.value)}
                  placeholder="Ex: Agnès Martin"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Email</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(event) => updateField("recipientEmail")(event.target.value)}
                  placeholder="agnes@email.com"
                  className="bg-input border-border"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Message */}
          <div className="space-y-4">
            <div className="border-b border-border pb-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Message d&rsquo;ouverture
              </h3>
            </div>
            <div className="space-y-2">
              <Textarea
                id="message"
                value={formData.message}
                onChange={(event) => updateField("message")(event.target.value)}
                placeholder="Expliquez ce que contient le pack et comment agir."
                className="min-h-[120px] resize-none dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Section 4: Règles de déclenchement */}
          <div className="space-y-4">
            <div className="border-b border-border pb-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Règles de déclenchement
              </h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inactivityDays">Délais d&rsquo;inactivité (jours)</Label>
                <Input
                  id="inactivityDays"
                  type="number"
                  min={15}
                  max={540}
                  step={15}
                  value={formData.inactivityDays}
                  onChange={(event) => updateField("inactivityDays")(Number(event.target.value))}
                  className="bg-input border-border"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Double validation</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Confirmation manuelle requise avant libération.
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={formData.manualUnlock ? "default" : "outline"}
                      onClick={() => updateField("manualUnlock")(!formData.manualUnlock)}
                      size="sm"
                    >
                      {formData.manualUnlock ? "Activée" : "Désactivée"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {formData.manualUnlock
                      ? "Vous serez contacté(e) avant toute libération."
                      : "Envoi automatique après l'inactivité définie."}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {saveError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
              {saveError}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
            <Button
              onClick={handleSave}
              disabled={isSaving || !isAuthenticated}
              className="min-w-[180px] bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Mode création : formulaire avec étapes animées
  return (
    <TooltipProvider>
      <Card className="border border-border/70 bg-card shadow-2xl shadow-amber-900/10 dark:shadow-black/30">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-500">
                Étape {currentStep + 1} / {STEPS.length}
              </p>
              <CardTitle className="text-2xl text-slate-900">{STEPS[currentStep]?.title}</CardTitle>
            </div>
          </div>
          <Progress value={progressValue} className="h-2 rounded-full bg-slate-100" />
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={STEPS[currentStep]?.id}
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-4"
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
                  <Label htmlFor="packSummary" className="text-sm text-slate-500">
                    Résumé rapide
                  </Label>
                  <Input
                    id="packSummary"
                    value={formData.packSummary}
                    onChange={(event) => updateField("packSummary")(event.target.value)}
                    placeholder="Quelques mots pour reconnaître ce pack."
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
                    <Label htmlFor="recipientEmail">Email</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      value={formData.recipientEmail}
                      onChange={(event) => updateField("recipientEmail")(event.target.value)}
                      placeholder="agnes@email.com"
                    />
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
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="inactivityDays">Délais d&rsquo;inactivité (jours)</Label>
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
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div>
                      <p className="font-medium text-slate-900">Double validation</p>
                      <p className="text-sm text-slate-500">
                        Confirmation manuelle requise avant libération.
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
                          : "Envoi automatique après l'inactivité définie."}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {saveError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {saveError}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
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
              className="flex-1 justify-center bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isSaving
                ? "Sauvegarde en cours..."
                : isLastStep
                  ? packId
                    ? "Enregistrer les modifications"
                    : "Créer le pack"
                  : "Étape suivante"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

