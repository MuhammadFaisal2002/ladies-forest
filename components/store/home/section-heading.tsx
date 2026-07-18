import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Eyebrow accent — forest by default; primary for the sale band. */
  accent?: "forest" | "primary";
  className?: string;
};

/** Centered home-section heading per DESIGN.md: eyebrow + Playfair title. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  accent = "forest",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <p
        className={cn(
          "text-xs uppercase tracking-[0.3em]",
          accent === "primary" ? "text-primary" : "text-forest",
        )}
      >
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl md:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}
