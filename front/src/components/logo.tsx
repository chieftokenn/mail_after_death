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
  const blueColor = isLight ? "#60a5fa" : "#1e40af";
  const yellowColor = isLight ? "#fbbf24" : "#f59e0b";
  const darkBlue = isLight ? "#3b82f6" : "#1e3a8a";
  const textColor = isLight ? "#ffffff" : "#1e40af";

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        viewBox="0 0 200 140"
        className="h-40 w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lettre M - avec cadenas intégré - descendue */}
        <path
          d="M 30 40 L 30 80 L 40 80 L 40 60 L 45 65 L 50 60 L 50 80 L 60 80 L 60 40 L 50 40 L 45 45 L 40 40 Z"
          fill={darkBlue}
        />
        {/* Cadenas jaune sur le M */}
        <rect
          x="42"
          y="35"
          width="6"
          height="7"
          rx="1"
          fill={yellowColor}
        />
        <path
          d="M 43 35 L 43 30 Q 43 28 45 28 Q 47 28 47 30 L 47 35"
          stroke={yellowColor}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Lettre A - avec barre de sécurité jaune - descendue */}
        <path
          d="M 65 40 L 60 80 L 70 80 L 75 40 Z"
          fill={darkBlue}
        />
        <line
          x1="66"
          y1="60"
          x2="69"
          y2="60"
          stroke={yellowColor}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Lettre D - avec bouclier de sécurité - descendue */}
        <path
          d="M 80 40 L 80 80 L 95 80 Q 105 80 105 60 Q 105 40 95 40 Z"
          fill={darkBlue}
        />
        {/* Icône de bouclier jaune dans le D */}
        <path
          d="M 88 55 L 88 65 L 92 65 L 92 55 Q 92 53 90 53 Q 88 53 88 55 Z"
          fill={yellowColor}
        />
        <path
          d="M 88 55 L 90 53 L 92 55"
          stroke={yellowColor}
          strokeWidth="1"
          fill="none"
        />

        {/* Texte "Mail After Death" aligné au niveau du logo */}
        <text
          x="67.5"
          y="95"
          fill={textColor}
          fontSize="11"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="500"
          letterSpacing="0.15em"
          textAnchor="middle"
          opacity="0.7"
        >
          MAIL AFTER DEATH
        </text>
      </svg>
    </div>
  );
}
