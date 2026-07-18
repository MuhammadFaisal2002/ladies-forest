export function AnnouncementBar({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="bg-forest px-4 py-2 text-center text-xs font-medium uppercase tracking-wider text-forest-foreground sm:text-sm">
      {text}
    </div>
  );
}
