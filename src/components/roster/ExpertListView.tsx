import { BadgeCheck, Calendar, Eye, Globe, Mail } from 'lucide-react';
import type { ITExpert } from '../../types/expert';
import Avatar, { Badge } from './SharedUI';
import { formatNextAvailable } from '../../lib/availability';
import { countryFlagCode, languageClass, skillClass } from '../../lib/expertDisplay';
import { cn } from '../../lib/utils';

const GRID_COLS =
  'grid-cols-[minmax(220px,1.2fr)_130px_minmax(160px,1fr)_140px_150px_140px_120px_170px]';

type ExpertListViewProps = {
  experts: ITExpert[];
  onContact?: (expert: ITExpert) => void;
  onViewProfile?: (expert: ITExpert) => void;
};

export default function ExpertListView({
  experts,
  onContact,
  onViewProfile,
}: ExpertListViewProps) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1100px]">
        <div
          className={cn(
            'sticky top-0 z-10 grid items-center border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase text-[#172554] shadow-[0_1px_0_rgba(15,23,42,0.04)]',
            GRID_COLS,
          )}
        >
          <div>Expert</div>
          <div>Country</div>
          <div>Technology Stack</div>
          <div>Functional Area</div>
          <div>Languages</div>
          <div>Region</div>
          <div>Availability</div>
          <div>Actions</div>
        </div>

        {experts.map((expert) => (
          <div
            key={expert.id}
            className={cn(
              'grid items-center border-t border-slate-100 px-4 py-3 transition hover:bg-sky-50/70',
              GRID_COLS,
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar expert={expert} size="sm" />
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-sm font-black text-[#0F1B3D]">{expert.name}</span>
                  {expert.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#0072CE]" />}
                </div>
                <div className="mt-0.5 truncate text-xs font-semibold text-slate-500">{expert.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <span className="flex h-3.5 w-[18px] items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
                {countryFlagCode(expert.country) ? (
                  <img
                    src={`https://flagcdn.com/w40/${countryFlagCode(expert.country)}.png`}
                    srcSet={`https://flagcdn.com/w80/${countryFlagCode(expert.country)}.png 2x`}
                    alt={`${expert.country} flag`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Globe className="h-3 w-3 text-slate-400" />
                )}
              </span>
              <span className="truncate">{expert.country}</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {expert.technologyStack.slice(0, 2).map((skill, index) => (
                <Badge key={skill} className={skillClass(index)}>{skill}</Badge>
              ))}
              {expert.technologyStack.length > 2 && (
                <Badge className="border-slate-200 bg-white text-slate-600">
                  +{expert.technologyStack.length - 2}
                </Badge>
              )}
            </div>

            <div className="truncate text-sm font-semibold text-slate-600">{expert.functionalArea}</div>

            <div className="flex flex-wrap gap-1.5">
              {expert.languages.slice(0, 2).map((language, index) => (
                <Badge key={language} className={languageClass(index)}>{language}</Badge>
              ))}
              {expert.languages.length > 2 && (
                <Badge className="border-slate-200 bg-white text-slate-600">
                  +{expert.languages.length - 2}
                </Badge>
              )}
            </div>

            <div className="truncate">
              <Badge className="border-slate-100 bg-slate-50 text-slate-600">
                {expert.regions[0]}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 truncate text-xs font-semibold text-slate-600">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-[#0072CE]" />
              {formatNextAvailable(expert.nextAvailableDate, expert.availabilityStatus)}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onContact?.(expert)}
                className="flex h-9 items-center gap-1.5 rounded-md bg-[#0072CE] px-3 text-xs font-black text-white shadow-sm transition hover:bg-[#0055A6]"
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </button>
              <button
                type="button"
                onClick={() => onViewProfile?.(expert)}
                className="flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-[#0072CE]/30 hover:text-[#0072CE]"
              >
                <Eye className="h-3.5 w-3.5" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
