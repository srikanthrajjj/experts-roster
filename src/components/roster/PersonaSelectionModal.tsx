import { useEffect, useId, useRef } from 'react';
import { ArrowRight, Code, User, Users } from 'lucide-react';
import UnicefDitOneBrand from './UnicefDitOneBrand';
import { getRoleLabel, type UserRole } from '../../lib/userRole';

type PersonaSelectionModalProps = {
  onSelect: (role: UserRole) => void;
  onClose?: () => void;
  currentRole?: string | null;
  allowDismiss?: boolean;
};

const PERSONAS = [
  {
    role: 'manager' as const,
    icon: Users,
    description: 'Search experts and staff programmes.',
  },
  {
    role: 'normal_user' as const,
    icon: User,
    description: 'Browse the roster and request support.',
  },
  {
    role: 'expert' as const,
    icon: Code,
    description: 'Manage your profile and availability.',
  },
] as const;

export default function PersonaSelectionModal({
  onSelect,
  onClose,
  currentRole,
  allowDismiss = true,
}: PersonaSelectionModalProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && allowDismiss) onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [allowDismiss, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={() => allowDismiss && onClose?.()}
        aria-hidden
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-y-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8 focus:outline-none"
      >
        <div className="mb-6 text-center">
          <UnicefDitOneBrand className="mx-auto mb-4 h-14 w-auto max-w-[min(100%,340px)] sm:h-16 sm:max-w-[380px]" />
          <h2 id={titleId} className="text-xl font-black text-slate-900 sm:text-2xl">
            Choose your role
          </h2>
          <p id={descId} className="mt-2 text-sm text-slate-500">
            This sets your default view. You can change it anytime from the header.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PERSONAS.map(({ role, icon: Icon, description }) => (
            <button
              key={role}
              type="button"
              onClick={() => onSelect(role)}
              className="group flex flex-col rounded-xl border-2 border-slate-100 bg-white p-4 text-left transition hover:border-[#0091F9]/40 hover:bg-sky-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] cursor-pointer"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-[#0091F9]">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-sm font-black text-slate-900">{getRoleLabel(role)}</h3>
              <p className="mt-1 flex-1 text-xs text-slate-500">{description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#0091F9]">
                Continue <ArrowRight className="h-3 w-3" aria-hidden />
              </span>
            </button>
          ))}
        </div>

        {currentRole && allowDismiss && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-5 text-center text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] rounded"
          >
            Keep {getRoleLabel(currentRole)}
          </button>
        )}
      </div>
    </div>
  );
}
