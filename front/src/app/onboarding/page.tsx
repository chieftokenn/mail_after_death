"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingFlow from "@/components/onboarding/onboarding-flow";
import { supabaseBrowserClient } from "@/lib/supabase-browser";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabaseBrowserClient) return;
      
      const {
        data: { session },
      } = await supabaseBrowserClient.auth.getSession();

      // Si déjà connecté, rediriger vers le dashboard
      if (session) {
        router.push("/dashboard");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-50/30 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950 py-12 transition-colors duration-300">
      <div className="mx-auto mb-10 max-w-5xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-500">
          Étapes guidées
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-foreground">
          Onboarding pour créer votre premier pack
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Inspiré du mockup : chaque question apparaît avec une transition douce pour rassurer
          l'utilisateur. Vous pouvez enregistrer ce brouillon à tout moment avant de passer à la
          validation.
        </p>
      </div>
      <OnboardingFlow />
    </div>
  );
}

