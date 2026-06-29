import { cn } from '../../lib/utils';

type UnicefDitOneBrandProps = {
  className?: string;
};

export default function UnicefDitOneBrand({ className }: UnicefDitOneBrandProps) {
  return (
    <img
      src="/unicef-dit-one-logo.png"
      alt="UNICEF Digital Impact Team One"
      width={360}
      height={72}
      className={cn('block h-auto w-auto max-w-[min(100%,360px)] object-contain object-left', className)}
    />
  );
}
