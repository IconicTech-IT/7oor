import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 font-sans text-2xl font-extrabold tracking-tight text-foreground",
        className,
      )}
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        7
        <span className="absolute -end-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
      <span>oor</span>
    </Link>
  );
}
