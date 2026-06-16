import { cn } from '../../lib/utils';

type UnicefLogoProps = {
  className?: string;
};

export default function UnicefLogo({ className }: UnicefLogoProps) {
  return (
    <img
      src="/unicef-logo.png"
      alt="UNICEF"
      width={120}
      height={36}
      className={cn('block h-9 w-auto shrink-0 object-contain', className)}
    />
  );
}
