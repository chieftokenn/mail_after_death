import OnboardingFlow from "@/components/onboarding/onboarding-flow";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 py-12">
      <div className="mx-auto mb-10 max-w-5xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-500">
          Étapes guidées
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">
          Onboarding pour créer votre premier pack
        </h1>
        <p className="mt-4 text-base text-slate-600">
          Inspiré du mockup : chaque question apparaît avec une transition douce pour rassurer
          l’utilisateur. Vous pouvez enregistrer ce brouillon à tout moment avant de passer à la
          validation.
        </p>
      </div>
      <OnboardingFlow />
    </div>
  );
}

