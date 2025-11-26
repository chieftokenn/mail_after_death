import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
};

const sizeMap = {
  sm: "h-16 w-16",
  md: "h-20 w-20",
  lg: "h-32 w-32",
};

export function Logo({ className, size = "md", variant = "dark" }: LogoProps) {
  const sizeClass = sizeMap[size];
  const isLight = variant === "light";
  const blueColor = isLight ? "#60a5fa" : "#1e40af"; // Bleu principal
  const yellowColor = isLight ? "#fbbf24" : "#f59e0b"; // Jaune accent
  const darkBlue = isLight ? "#3b82f6" : "#1e3a8a"; // Bleu foncé

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        viewBox="0 0 140 100"
        className={cn("relative", sizeClass)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lettre M - avec cadenas intégré */}
        <path
          d="M 20 50 L 20 80 L 30 80 L 30 60 L 35 65 L 40 60 L 40 80 L 50 80 L 50 50 L 40 50 L 35 55 L 30 50 Z"
          fill={darkBlue}
        />
        {/* Cadenas jaune sur le M */}
        <rect
          x="32"
          y="45"
          width="6"
          height="7"
          rx="1"
          fill={yellowColor}
        />
        <path
          d="M 33 45 L 33 40 Q 33 38 35 38 Q 37 38 37 40 L 37 45"
          stroke={yellowColor}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Lettre A - avec barre de sécurité jaune */}
        <path
          d="M 55 50 L 50 80 L 60 80 L 65 50 Z"
          fill={darkBlue}
        />
        <line
          x1="56"
          y1="65"
          x2="59"
          y2="65"
          stroke={yellowColor}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Lettre D - avec bouclier de sécurité */}
        <path
          d="M 70 50 L 70 80 L 85 80 Q 95 80 95 65 Q 95 50 85 50 Z"
          fill={darkBlue}
        />
        {/* Icône de bouclier jaune dans le D */}
        <path
          d="M 78 60 L 78 68 L 82 68 L 82 60 Q 82 58 80 58 Q 78 58 78 60 Z"
          fill={yellowColor}
        />
        <path
          d="M 78 60 L 80 58 L 82 60"
          stroke={yellowColor}
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
}

export function LogoText({ className, variant = "dark" }: { className?: string; variant?: "light" | "dark" }) {
  const isLight = variant === "light";
  const textColor = isLight ? "text-white" : "text-foreground";

  return (
    <div className={cn("flex flex-col items-center justify-center gap-0.5", className)}>
      <div className="flex-shrink-0 flex items-center justify-center">
        <Logo size="lg" variant={variant} />
      </div>
      <span className={cn("text-sm font-medium tracking-wider uppercase opacity-70 text-center", textColor)}>
        Mail After Death
      </span>
    </div>
  );
}
