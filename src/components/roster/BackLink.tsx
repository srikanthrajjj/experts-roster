import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

type BackLinkProps = {
  to: string;
  label?: string;
  className?: string;
};

export default function BackLink({ to, label = 'Back', className }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg text-sm font-bold text-[#0091F9] transition hover:text-[#0072CE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] focus-visible:ring-offset-2',
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}
