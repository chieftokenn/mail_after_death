"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
] as const;

const fadeVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    packName: "Pack Héritage Digital",
    packSummary: "Accès essentiels & messages privés",
    recipientName: "Agnès Martin",
    recipientEmail: "agnes@example.com",
    message:
      "Bonjour Agnès, tu trouveras ici les accès bancaires, codes coffre et quelques mots pour la famille...",
    inactivityDays: 90,
    manualUnlock: true,
  });

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
      setFormData((prev) => ({ ...prev, [field]: value }));
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
            <h1 className="mt-4 text-4xl font-semibold text-slate-900">
              Préparez votre premier pack post-mortem
            </h1>
            <p className="mt-4 text-base text-slate-600">
              Chaque étape est pensée pour guider un utilisateur non technique. Nous posons une
              question à la fois, avec un bref contexte pour rester serein.
            </p>
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-sm text-white">
              <p className="font-medium">Conseil</p>
              <p className="mt-1 text-white/80">
                Répondez spontanément, vous pourrez toujours ajuster votre pack avant de le
                verrouiller.
              </p>
            </div>
          </div>

          <Card className="border-none bg-white/80 shadow-lg shadow-slate-200/60 backdrop-blur">
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
                            ? "bg-emerald-100 text-emerald-600"
                            : isActive
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p
                          className={`font-medium ${
                            isActive ? "text-slate-900" : "text-slate-600"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-slate-500">{step.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-white to-slate-50 shadow-lg shadow-slate-200/70">
            <CardHeader>
              <CardTitle>Récap express</CardTitle>
              <CardDescription>Ce que vous avez déjà défini pour ce pack.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-base font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1">
          <Card className="border-none bg-white/90 shadow-2xl shadow-slate-200/70 backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-500">
                    Étape {currentStep + 1} / {STEPS.length}
                  </p>
                  <CardTitle className="text-3xl text-slate-900">{STEPS[currentStep]?.title}</CardTitle>
                </div>
                <motion.span
                  key={currentStep}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-slate-500"
                >
                  {stepDescription}
                </motion.span>
              </div>
              <Progress value={progressValue} className="h-2 rounded-full bg-slate-100" />
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
                      <Label htmlFor="packSummary" className="text-sm text-slate-500">
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
                      <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
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
                      <p className="text-sm text-slate-500">
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
                        <p className="text-sm text-slate-500">
                          Nous envoyons plusieurs emails de réveil avant de considérer votre compte inactif.
                          Vous pouvez ajuster ce délai à tout moment.
                        </p>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <div>
                          <p className="font-medium text-slate-900">Double validation</p>
                          <p className="text-sm text-slate-500">
                            Un membre de l’équipe MAD confirme chaque libération sensible.
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
                </motion.div>
              </AnimatePresence>

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
                  className="flex-1 justify-center bg-slate-900 text-white hover:bg-slate-800"
                >
                  {isLastStep ? "Pré-valider mon pack" : "Étape suivante"}
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

