import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * The mark is a stack of three rules — the three lanes a lead moves through —
 * with the top one lit. It is drawn rather than imported so it inherits colour
 * from whatever surface it sits on.
 */
export function Logo({ className, href = '/' }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-2.5 rounded-md font-display text-[0.95rem] font-semibold tracking-tight',
        className,
      )}
    >
      <span
        aria-hidden
        className="border-primary/25 bg-primary/5 flex size-8 flex-col justify-center gap-[3px] rounded-[7px] border px-[7px]"
      >
        <span className="bg-signal h-[2px] w-full rounded-full transition-all duration-300 group-hover:w-1/2" />
        <span className="bg-primary/50 h-[2px] w-3/4 rounded-full transition-all duration-300 group-hover:w-full" />
        <span className="bg-primary/25 h-[2px] w-1/2 rounded-full transition-all duration-300 group-hover:w-3/4" />
      </span>
      LeadDesk<span className="text-muted-foreground font-normal">Mini</span>
    </Link>
  );
}
