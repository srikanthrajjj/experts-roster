import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

type UnicefLogoProps = {
  className?: string;
};

export default function UnicefLogo({ className }: UnicefLogoProps) {
  return (
    <Link
      to="/"
      aria-label="Home"
      className="flex shrink-0 items-center rounded-md outline-none transition hover:opacity-90 focus:ring-2 focus:ring-white/60"
    >
      <img
        src="/unicef-dit-logo.png"
        alt="UNICEF"
        width={120}
        height={36}
        className={cn('block h-9 w-auto shrink-0 object-contain object-left', className)}
      />
    </Link>
  );
}
