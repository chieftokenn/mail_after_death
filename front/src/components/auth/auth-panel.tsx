"use client";

import { useState } from "react";

import { supabaseBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthState = "idle" | "loading" | "sent" | "error";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<AuthState>("idle");
  const [message, setMessage] = useState("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabaseBrowserClient) {
      setStatus("error");
      setMessage("Supabase n’est pas configuré. Ajoutez vos clés d’environnement.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");
      const { error } = await supabaseBrowserClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (error) {
        throw error;
      }

      setStatus("sent");
      setMessage("Lien magique envoyé. Vérifiez votre boîte mail sécurisée.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Impossible d’envoyer l’email pour le moment.",
      );
    }
  };

  return (
    <Card className="border border-white/10 bg-white/5 text-white shadow-2xl shadow-slate-900/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Accès sécurisé</CardTitle>
        <CardDescription className="text-slate-200">
          Utilisez votre email pour recevoir un lien magique. Nous activerons WebAuthn plus tard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email professionnel ou personnel
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="prenom@exemple.com"
              required
              className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/60"
            />
          </div>
          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-white text-slate-900 hover:bg-amber-100"
          >
            {status === "loading" ? "Envoi en cours..." : "Recevoir le lien magique"}
          </Button>
        </form>
        {message && (
          <p
            className={`mt-4 text-sm ${
              status === "error" ? "text-rose-200" : "text-emerald-200"
            }`}
          >
            {message}
          </p>
        )}
        {status === "idle" && (
          <p className="mt-4 text-xs text-slate-300">
            Nous limiterons progressivement aux emails vérifiés (KYC) pour débloquer les packs
            sensibles.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default AuthPanel;

