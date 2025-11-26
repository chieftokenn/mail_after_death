"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AnimatedButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function AnimatedButton({
  href,
  children,
  className,
  variant = "primary",
  onClick,
  disabled,
}: AnimatedButtonProps) {
  const baseClasses = "relative overflow-hidden rounded-full px-6 py-3 text-center text-base font-semibold transition-all duration-300";
  
  const variantClasses = {
    primary: "bg-white text-slate-900 hover:bg-amber-50 shadow-lg hover:shadow-xl",
    secondary: "border border-white/40 text-white hover:border-white hover:bg-white/10 backdrop-blur-sm",
    ghost: "text-slate-900 hover:bg-slate-100/80",
    outline: "border border-slate-200 text-slate-900 hover:border-amber-300 hover:bg-amber-50/50",
  };

  const buttonContent = (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseClasses, variantClasses[variant], disabled && "opacity-50 cursor-not-allowed", className)}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-300/30 to-amber-400/0"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );

  if (href) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link href={href} className="inline-block">
          {buttonContent}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {buttonContent}
    </motion.div>
  );
}
