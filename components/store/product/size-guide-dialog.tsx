"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SIZE_ROWS = [
  { size: "32", cm: "66–71", inches: "26–28" },
  { size: "34", cm: "71–76", inches: "28–30" },
  { size: "36", cm: "76–81", inches: "30–32" },
  { size: "38", cm: "81–86", inches: "32–34" },
  { size: "40", cm: "86–91", inches: "34–36" },
  { size: "42", cm: "91–97", inches: "36–38" },
];

type SizeGuideDialogProps = {
  /** The product's own size-chart image (URL containing "SizeChart"), if any. */
  image: string | null;
};

export function SizeGuideDialog({ image }: SizeGuideDialogProps) {
  return (
    <Dialog>
      <DialogTrigger className="text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-150 hover:text-primary">
        Size Guide
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Size Guide</DialogTitle>
          <DialogDescription>
            Measure snugly around your underbust and match it to your band
            size below.
          </DialogDescription>
        </DialogHeader>

        {image ? (
          <Image
            src={image}
            alt="Bra size chart"
            width={1200}
            height={900}
            sizes="(max-width: 640px) 100vw, 512px"
            className="h-auto w-full rounded-lg bg-muted"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Size</th>
                  <th className="py-2 pr-4 font-medium">Underbust (cm)</th>
                  <th className="py-2 font-medium">Underbust (in)</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_ROWS.map((row) => (
                  <tr key={row.size} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{row.size}</td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {row.cm}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {row.inches}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
