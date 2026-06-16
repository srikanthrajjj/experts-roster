import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { ITExpert } from '../../types/expert';
import { cn } from '../../lib/utils';

const avatarPalette = [
  'bg-sky-100 text-sky-700 ring-sky-200',
  'bg-emerald-100 text-emerald-700 ring-emerald-200',
  'bg-amber-100 text-amber-800 ring-amber-200',
  'bg-violet-100 text-violet-700 ring-violet-200',
  'bg-rose-100 text-rose-700 ring-rose-200',
  'bg-cyan-100 text-cyan-700 ring-cyan-200',
];

export default function Avatar({ expert, size = 'md' }: { expert: Pick<ITExpert, 'id' | 'initials'>; size?: 'sm' | 'md' | 'lg' }) {
  const palette = avatarPalette[Number(expert.id) % avatarPalette.length];
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-lg' : size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11 text-sm';

  return (
    <div className={cn('shrink-0 rounded-full ring-1 flex items-center justify-center font-bold', palette, sizeClass)}>
      {expert.initials}
    </div>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string; key?: React.Key }) {
  return (
    <span className={cn('inline-flex h-6 items-center rounded-md border px-2 text-xs font-semibold', className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: ITExpert['availabilityStatus'] }) {
  const classes = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    partially_allocated: 'bg-amber-50 text-amber-700 border-amber-200',
    fully_booked: 'bg-sky-50 text-sky-700 border-sky-200',
    on_leave: 'bg-violet-50 text-violet-700 border-violet-200',
  };
  const labels = {
    available: 'Available',
    partially_allocated: 'Partially available',
    fully_booked: 'Fully booked',
    on_leave: 'On leave',
  };

  return <Badge className={classes[status]}>{labels[status]}</Badge>;
}

export function FilterCheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; count?: number }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <fieldset className="block">
      <legend className="mb-1.5 block text-xs font-bold text-[#172554]">{label}</legend>
      <div className="space-y-1.5">
        {options.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-xs transition',
                checked ? 'border-[#0072CE]/30 bg-sky-50 text-[#0072CE]' : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200 hover:bg-white',
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(option.value)}
                className="h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-[#0072CE] focus:ring-[#0072CE]/20"
              />
              <span className="min-w-0 flex-1 font-semibold">{option.label}</span>
              {option.count !== undefined && (
                <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-black', checked ? 'bg-[#0072CE]/15 text-[#0072CE]' : 'bg-slate-200/80 text-slate-500')}>
                  {option.count}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-[#172554]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-[#0072CE] focus:ring-2 focus:ring-[#0072CE]/15"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function FilterMultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = 'All',
}: {
  label: string;
  options: { value: string; label: string; count?: number }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const displayText = React.useMemo(() => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) {
      return options.find((option) => option.value === selected[0])?.label ?? selected[0];
    }
    if (selected.length === 2) {
      return selected
        .map((value) => options.find((option) => option.value === value)?.label ?? value)
        .join(', ');
    }
    return `${selected.length} selected`;
  }, [selected, options, placeholder]);

  return (
    <div ref={containerRef} className="relative block">
      <span className="mb-1.5 block text-xs font-bold text-[#172554]">{label}</span>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-left text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-[#0072CE] focus:ring-2 focus:ring-[#0072CE]/15',
          open && 'border-[#0072CE] ring-2 ring-[#0072CE]/15',
        )}
      >
        <span className={cn('min-w-0 truncate', selected.length === 0 && 'text-slate-500')}>{displayText}</span>
        <ChevronDown className={cn('ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-multiselectable
          className="custom-scrollbar absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          {options.map((option) => {
            const checked = selected.includes(option.value);
            return (
              <label
                key={option.value}
                role="option"
                aria-selected={checked}
                className={cn(
                  'flex cursor-pointer items-center gap-2 px-3 py-2 text-xs transition hover:bg-slate-50',
                  checked && 'bg-sky-50 text-[#0072CE]',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option.value)}
                  className="h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-[#0072CE] focus:ring-[#0072CE]/20"
                />
                <span className="min-w-0 flex-1 font-semibold">{option.label}</span>
                {option.count !== undefined && (
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-black',
                      checked ? 'bg-[#0072CE]/15 text-[#0072CE]' : 'bg-slate-200/80 text-slate-500',
                    )}
                  >
                    {option.count}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
