import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="pt-32 pb-10 min-h-[80vh]"
    >
      {children}
    </motion.main>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="mx-auto max-w-4xl px-4 text-center mb-16">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs uppercase tracking-widest text-muted-foreground mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
          {eyebrow}
        </div>
      )}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05]">
        {title.split("|").map((part, i) =>
          i === 1 ? (
            <span key={i} className="gradient-text">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </h1>
      {subtitle && (
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </section>
  );
}
