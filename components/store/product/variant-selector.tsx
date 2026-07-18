"use client";

import { cn } from "@/lib/utils";

export type ProductOptionData = {
  name: string;
  values: string[];
};

type VariantSelectorProps = {
  options: ProductOptionData[];
  /** Currently selected value per option name, e.g. { Size: "34", "Cup Size": "B" }. */
  selected: Record<string, string>;
  onSelect: (name: string, value: string) => void;
  /**
   * Whether picking this value (keeping the other selected values) matches at
   * least one in-stock variant. Unavailable values dim + strike through but
   * stay clickable so shoppers can still switch.
   */
  isAvailable: (name: string, value: string) => boolean;
  /** Rendered at the end of the "Size" option's label row (size guide link). */
  sizeGuide?: React.ReactNode;
};

export function VariantSelector({
  options,
  selected,
  onSelect,
  isAvailable,
  sizeGuide,
}: VariantSelectorProps) {
  return (
    <div className="space-y-5">
      {options.map((option) => (
        <div key={option.name} role="group" aria-label={option.name}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              {option.name}
              {selected[option.name] && (
                <span className="ml-1.5 font-normal text-muted-foreground">
                  — {selected[option.name]}
                </span>
              )}
            </span>
            {option.name === "Size" && sizeGuide}
          </div>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selected[option.name] === value;
              const available = isAvailable(option.name, value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(option.name, value)}
                  className={cn(
                    "min-w-11 rounded-md border px-3.5 py-2 text-sm transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/60",
                    !available && "opacity-40 line-through",
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
