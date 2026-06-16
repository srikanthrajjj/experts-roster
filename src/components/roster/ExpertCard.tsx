import React from 'react';
import {
  BadgeCheck,
  Calendar,
  Eye,
  Mail,
  MapPin,
} from 'lucide-react';
import type { ITExpert } from '../../types/expert';
import Avatar, { Badge } from './SharedUI';
import SimpleGanttPreview from './SimpleGanttPreview';
import { formatNextAvailable } from '../../lib/availability';
import { cn } from '../../lib/utils';

type ExpertCardProps = {
  expert: ITExpert;
  selected?: boolean;
  onSelect?: () => void;
  onContact?: () => void;
  onViewProfile?: () => void;
  compact?: boolean;
  key?: React.Key;
};

function skillClass(index: number) {
  const classes = [
    'bg-sky-50 text-sky-700 border-sky-100',
    'bg-cyan-50 text-cyan-700 border-cyan-100',
    'bg-indigo-50 text-indigo-700 border-indigo-100',
  ];
  return classes[index % classes.length];
}

function uniqueSkillTags(expert: ITExpert, max = 3): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const skill of expert.technologyStack) {
    const key = skill.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(skill);
    if (tags.length >= max) return tags;
  }
  for (const cert of expert.certifications) {
    const label = cert.split(' ')[0];
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(label);
    if (tags.length >= max) return tags;
  }
  return tags;
}

export default function ExpertCard({
  expert,
  selected,
  onSelect,
  onContact,
  onViewProfile,
  compact,
}: ExpertCardProps) {
  const skillTags = uniqueSkillTags(expert, 3);

  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      className={cn(
        'group rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#0072CE]/30 hover:shadow-[0_18px_45px_rgba(0,114,206,0.12)]',
        onSelect && 'cursor-pointer',
        selected && 'border-[#0072CE] ring-2 ring-[#0072CE]/15',
        compact ? 'p-4' : 'p-5',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar expert={expert} size={compact ? 'md' : 'lg'} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-black text-[#0F1B3D]">{expert.name}</h3>
              {expert.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-[#0072CE]" />}
            </div>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-500">{expert.role}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-400">
              <MapPin className="h-3 w-3 shrink-0 text-[#0072CE]" />
              {expert.country}
              <span className="text-slate-300">·</span>
              {expert.yearsExperience} yrs
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <SimpleGanttPreview expert={expert} weeks={4} />
      </div>

      {skillTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skillTags.map((skill, i) => (
            <Badge key={skill} className={skillClass(i)}>
              {skill}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile?.();
          }}
          className="flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-black text-slate-600 transition hover:border-[#0072CE]/30 hover:text-[#0072CE]"
        >
          <Eye className="h-3.5 w-3.5" />
          View Profile
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onContact?.();
          }}
          className="flex h-8 items-center gap-1 rounded-md bg-[#0072CE] px-2.5 text-xs font-black text-white transition hover:bg-[#0055A6]"
        >
          <Mail className="h-3.5 w-3.5" />
          Contact
        </button>
      </div>
    </div>
  );
}

export function ExpertListRow({
  expert,
  selected,
  onSelect,
}: {
  expert: ITExpert;
  selected?: boolean;
  onSelect?: () => void;
  key?: React.Key;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'grid w-full grid-cols-[minmax(200px,1.2fr)_minmax(160px,1fr)_120px_100px] items-center gap-3 border-t border-slate-100 px-4 py-3 text-left transition hover:bg-sky-50/70',
        selected && 'bg-sky-50/80',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar expert={expert} size="sm" />
        <div className="min-w-0">
          <div className="truncate text-sm font-black text-[#0F1B3D]">{expert.name}</div>
          <div className="truncate text-xs text-slate-500">{expert.country} · {expert.timezone}</div>
        </div>
      </div>
      <div>
        <div className="truncate text-xs font-semibold text-slate-700">{expert.role}</div>
        <div className="mt-1 flex flex-wrap gap-1">
          {expert.technologyStack.slice(0, 2).map((s, i) => (
            <Badge key={s} className={skillClass(i)}>{s}</Badge>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
        <Calendar className="h-3.5 w-3.5 shrink-0 text-[#0072CE]" />
        {formatNextAvailable(expert.nextAvailableDate, expert.availabilityStatus)}
      </div>
      <div className="text-sm font-bold text-slate-600">{expert.allocationPercent}%</div>
    </button>
  );
}
