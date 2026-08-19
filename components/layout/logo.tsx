import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { AnimatedLogoMark } from "./animated-logo-mark";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      dir="ltr"
      className={cn(
        "inline-flex items-center gap-2 font-sans text-2xl font-extrabold tracking-tight text-foreground",
        className,
      )}
    >
      <AnimatedLogoMark className="h-9 w-9" />
      <span>oor</span>
    </Link>
  );
}
