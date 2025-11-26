import Link from "next/link";

import { LogoText } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

import AuthPanel from "@/components/auth/auth-panel";

const features = [
  {
    title: "Chiffrement côté client",
    description:
      "Chaque fichier est scellé avant d’entrer dans nos serveurs. Nous ne voyons jamais vos secrets.",
    highlight: "Zero-knowledge",
  },
  {
    title: "Dead-man check intelligent",
    description:
      "Nous surveillons vos signes de vie par email. Sans réponse, un workflow gradué se déclenche.",
    highlight: "Inactivité guidée",
  },
  {
    title: "Libération sur-mesure",
    description:
      "Choisissez à qui envoyer vos instructions, avec un message personnalisé et des pièces jointes.",
    highlight: "Packs modulaires",
  },
];

const steps = [
  {
    title: "Créer son espace sécurisé",
    description: "Onboarding email + 2FA léger pour démarrer sans friction.",
  },
  {
    title: "Composer un pack",
    description: "Nom, description, destinataires et fichiers chiffrés.",
  },
  {
    title: "Définir la règle",
    description: "Nombre de rappels email, durée d’inactivité, validation manuelle.",
  },
  {
    title: "Prévisualiser et verrouiller",
    description: "Vous signez numériquement avant l’activation.",
  },
];

const securityPoints = [
  "Chiffrement E2EE optionnel + clé utilisateur",
  "Journal d’audit immuable pour chaque notification",
  "Aucune donnée bancaire en clair autorisée",
  "Suppression et purge automatique configurables",
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-blue-950 text-white dark:bg-blue-950 transition-colors duration-300">
      <header className="relative overflow-hidden bg-blue-950 dark:bg-blue-950">
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.1),rgba(30,58,138,0.95))]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20 lg:flex-row lg:items-center">
          <div className="space-y-8 lg:w-1/2">
            <LogoText variant="light" />
            <h1 className="text-4xl font-semibold leading-tight text-white lg:text-5xl">
              Préparez ce que vous voulez transmettre — simplement, en toute sécurité.
            </h1>
            <p className="text-lg text-blue-100">
              Nous gardons vos messages, accès critiques et preuves numériques jusqu'au moment où vos
              règles le demandent. Une alternative moderne et complémentaire à vos démarches
              notariales.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/onboarding"
                className="rounded-full bg-amber-400 px-6 py-3 text-center text-base font-semibold text-blue-950 transition hover:bg-amber-300"
              >
                Commencer mon pack
              </Link>
              <Link
                href="#parcours"
                className="rounded-full border border-amber-400/40 px-6 py-3 text-center text-base font-semibold text-amber-100 transition hover:border-amber-400"
              >
                Voir le parcours
              </Link>
            </div>
            <div className="grid gap-6 border-t border-amber-400/20 pt-6 text-sm text-blue-200 sm:grid-cols-3">
              <div>
                <p className="text-3xl font-semibold text-white">4</p>
                <p>Paliers de vérification avant libération</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-white">15+</p>
                <p>Destinataires par pack (avec contenus uniques)</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-white">90 j</p>
                <p>Workflow d’inactivité recommandé, ajustable</p>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 shadow-[0_20px_80px_rgba(15,23,42,0.45)] backdrop-blur">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-200">prototype</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Dashboard en preview</h2>
              <p className="mt-4 text-sm text-blue-200">
                Surveillez vos packs, vos rappels d'activité et les confirmations manuelles en un
                coup d'œil. Chaque action est journalisée pour conserver une preuve.
              </p>
              <div className="mt-6 space-y-4 text-sm text-blue-200">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Pack actif</p>
                  <p className="text-base font-medium text-white">"Accès entreprise – 2025"</p>
                  <p className="text-xs text-blue-300">
                    Dernier ping : il y a 10 jours • 2 rappels programmés
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Destinataires</p>
                  <p className="text-base font-medium text-white">Agnès Martin, Hugo Perez + 2</p>
                  <p className="text-xs text-blue-300">Accès différenciés, messages privés</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Règle</p>
                  <p className="text-base font-medium text-white">
                    Inactivité 90j + confirmation MAD
                  </p>
                  <p className="text-xs text-blue-300">Libération estimée : 12 décembre 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="parcours" className="bg-white text-blue-950 dark:bg-blue-900 dark:text-blue-50 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="lg:w-1/3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-500">
                Parcours guidé
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-blue-950 dark:text-blue-50">4 écrans, pas un de plus</h2>
              <p className="mt-4 text-base text-blue-700 dark:text-blue-200">
                Inspiré du mockup : Landing, onboarding, création de pack, règles de déclenchement. On
                vous accompagne du premier clic jusqu'à la prévalidation.
              </p>
            </div>
            <div className="grid flex-1 gap-6 md:grid-cols-2">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-blue-100 dark:border-blue-800 p-6 shadow-sm bg-blue-50/50 dark:bg-blue-900/50">
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
                    Étape {index + 1}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-blue-950 dark:text-blue-50">{step.title}</h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-200">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-amber-50 text-blue-950 dark:bg-blue-900 dark:text-blue-50 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">Offre</p>
            <h2 className="mt-2 text-3xl font-semibold">Prix fluide & add-ons optionnels</h2>
            <p className="mt-4 text-base text-blue-700 dark:text-blue-200">
              Le PDF recommande un modèle basé sur la durée et les options premium. Voici la base pour
              la V1.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-amber-100 bg-white dark:bg-blue-800 p-6 shadow-lg shadow-amber-100/40"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-amber-500">
                  {feature.highlight}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-blue-950 dark:text-blue-50">{feature.title}</h3>
                <p className="mt-3 text-sm text-blue-700 dark:text-blue-200">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-3xl border border-dashed border-amber-200 p-6 text-sm text-blue-700 dark:text-blue-200">
            <p>
              Exemple : 5 ans de couverture + 3 packs actifs + 10 destinataires + add-on “KYC avancé”.
              Le simulateur tarifaire viendra dans une itération suivante.
            </p>
          </div>
        </div>
      </section>

      <section id="auth" className="bg-blue-950 py-16 text-white dark:bg-blue-950 transition-colors duration-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:flex-row lg:items-center">
          <div className="space-y-4 lg:w-2/5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
              Authentification v1
            </p>
            <h2 className="text-3xl font-semibold">
              Connectez-vous pour créer, tester ou prévalider un pack.
            </h2>
            <p className="text-base text-blue-200">
              Nous commençons simple avec un lien magique (email). WebAuthn et KYC arriveront ensuite
              pour les comptes premium, comme décrit dans le PDF.
            </p>
            <ul className="list-disc space-y-2 pl-4 text-sm text-blue-300">
              <li>Redirection directe vers l'onboarding après validation.</li>
              <li>Sessions persistantes (Supabase Auth) avec résiliation possible depuis le dashboard.</li>
              <li>Journalisation de chaque connexion pour les futures preuves légales.</li>
            </ul>
          </div>
          <div className="flex-1">
            <AuthPanel />
          </div>
        </div>
      </section>

      <section className="bg-white text-blue-950 dark:bg-blue-900 dark:text-blue-50 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
                Sécurité & conformité
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Ce que nous affichons clairement</h2>
              <p className="mt-4 text-base text-blue-700 dark:text-blue-200">
                Inspiré de la section "Sécurité technique" du document : nous parlons la même langue que
                nos utilisateurs et leur notaire.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-blue-700 dark:text-blue-200">
                {securityPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-800/50 p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-600">Mention légale</p>
              <p className="mt-3 text-lg font-medium text-blue-950 dark:text-blue-50">
                "MAD n'est pas un notaire. Pour les dispositions légales de succession, consultez un
                professionnel."
              </p>
              <p className="mt-4 text-sm text-blue-700 dark:text-blue-200">
                Extrait du PDF à afficher dans l'app. Nous le rappellerons sur l'onboarding et dans les
                settings.
              </p>
              <div className="mt-6 rounded-2xl bg-blue-100 dark:bg-blue-800 p-4 text-sm text-blue-700 dark:text-blue-200">
                Logs immuables, traces cryptographiques et suppression programmée sont prévus dans notre
                backlog.
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-amber-400/20 bg-blue-950 px-6 py-10 text-sm text-blue-300 dark:bg-blue-950 dark:border-blue-800 transition-colors duration-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MAD — Mail After Death</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/onboarding" className="hover:text-white">
              Créer un pack
            </Link>
            <a href="mailto:contact@mailafterdeath.app" className="hover:text-white">
              Contact support
            </a>
            <a
              href="https://nextjs.org/docs"
              className="hover:text-white"
              target="_blank"
              rel="noreferrer"
            >
              Roadmap produit
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
