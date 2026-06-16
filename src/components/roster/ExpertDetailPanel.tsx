import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import type { ITExpert } from '../../types/expert';
import { formatNextAvailable } from '../../lib/availability';
import { ExpertAvailabilityPreview } from './AvailabilityStrip';
import Avatar, { StatusBadge } from './SharedUI';
import { cn } from '../../lib/utils';

type ExpertDetailPanelProps = {
  expert: ITExpert | null;
  onClose: () => void;
  activeTab?: 'overview' | 'availability' | 'projects' | 'skills' | 'profile';
  onTabChange?: (tab: 'overview' | 'availability' | 'projects' | 'skills' | 'profile') => void;
  onViewProfile?: () => void;
  managerMode?: boolean;
};

const TABS = ['Overview', 'Availability', 'Projects', 'Skills', 'Profile'] as const;

export default function ExpertDetailPanel({
  expert,
  onClose,
  activeTab = 'availability',
  onTabChange,
  onViewProfile,
  managerMode = true,
}: ExpertDetailPanelProps) {
  const [localTab, setLocalTab] = React.useState(activeTab);
  const tab = onTabChange ? activeTab : localTab;
  const setTab = onTabChange ?? setLocalTab;

  if (!expert) return null;

  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(2025, 4, 1);
    d.setDate(d.getDate() - d.getDay() + i);
    return d;
  });

  return (
    <aside className="flex h-full min-h-0 w-[340px] shrink-0 flex-col border-l border-slate-200 bg-white shadow-[-10px_0_35px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar expert={expert} size="lg" />
            <div className="min-w-0">
              <h3 className="text-sm font-black text-[#0F1B3D]">{expert.name}</h3>
              <p className="text-xs font-semibold text-slate-500">{expert.role}</p>
              <p className="mt-0.5 text-[10px] font-bold text-slate-400">{expert.country} · {expert.timezone}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={expert.availabilityStatus} />
          <span className="text-xs font-bold text-slate-500">{expert.allocationPercent}% allocated</span>
          <span className="text-xs font-bold text-slate-400">· Next: {formatNextAvailable(expert.nextAvailableDate)}</span>
        </div>
        <button
          type="button"
          onClick={onViewProfile}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-[#0072CE]/20 bg-sky-50 px-3 py-1.5 text-xs font-black text-[#0072CE] transition hover:bg-sky-100"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View full profile
        </button>
      </div>

      <div className="flex border-b border-slate-200 px-2">
        {TABS.map((t) => {
          const key = t.toLowerCase() as typeof tab;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'flex-1 border-b-2 px-1 py-2.5 text-[10px] font-black uppercase transition',
                tab === key ? 'border-[#0072CE] text-[#0072CE]' : 'border-transparent text-slate-400 hover:text-slate-600',
              )}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
        {tab === 'overview' && (
          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-slate-600">{expert.bio}</p>
            <div>
              <div className="text-[10px] font-black uppercase text-slate-400">Team</div>
              <div className="text-xs font-bold text-[#0F1B3D]">{expert.team}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-slate-400">Utilization</div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[#0072CE]" style={{ width: `${expert.utilizationPercent}%` }} />
              </div>
              <div className="mt-1 text-xs font-bold text-slate-500">{expert.utilizationPercent}% utilized</div>
            </div>
          </div>
        )}

        {tab === 'availability' && (
          <div className="space-y-4">
            {managerMode && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-black uppercase text-slate-400">Quick summary</div>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Current status</span>
                    <span className="font-black text-[#0F1B3D]">{expert.availability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Utilization</span>
                    <span className="font-black text-[#0F1B3D]">{expert.utilizationPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Bench capacity</span>
                    <span className="font-black text-[#0F1B3D]">{expert.benchAvailable ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 text-xs font-black uppercase text-[#172554]">4-week outlook</div>
              <ExpertAvailabilityPreview expert={expert} variant="detailed" />
            </div>

            {!managerMode && (
              <>
            <div>
              <div className="mb-2 text-xs font-black uppercase text-[#172554]">Update availability</div>
              <div className="flex gap-1 rounded-lg border border-slate-200 p-1">
                <button type="button" className="flex-1 rounded-md bg-[#0072CE] py-1.5 text-[10px] font-black text-white">Calendar</button>
                <button type="button" className="flex-1 rounded-md py-1.5 text-[10px] font-black text-slate-500">Gantt</button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-black text-[#0F1B3D]">May 2025</span>
                <div className="flex gap-1">
                  <button type="button" className="flex h-6 w-6 items-center justify-center rounded hover:bg-slate-100"><ChevronLeft className="h-3 w-3" /></button>
                  <button type="button" className="flex h-6 w-6 items-center justify-center rounded hover:bg-slate-100"><ChevronRight className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] font-bold text-slate-400">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d}>{d}</div>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-0.5">
                {calendarDays.map((d) => {
                  const inMonth = d.getMonth() === 4;
                  const isToday = d.getDate() === 12 && d.getMonth() === 4;
                  return (
                    <div
                      key={d.toISOString()}
                      className={cn(
                        'flex h-7 items-center justify-center rounded text-[10px] font-semibold',
                        !inMonth && 'text-slate-300',
                        inMonth && 'text-slate-700',
                        isToday && 'bg-[#0072CE] text-white',
                        inMonth && d.getDay() === 0 && !isToday && 'bg-violet-50 text-violet-700',
                      )}
                    >
                      {d.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase text-slate-500">Status</span>
              <select className="h-9 w-full rounded-md border border-slate-200 px-2 text-xs font-semibold">
                <option>Partially available</option>
                <option>Available</option>
                <option>Fully booked</option>
                <option>On leave</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase text-slate-500">Allocation %</span>
              <select defaultValue={expert.allocationPercent} className="h-9 w-full rounded-md border border-slate-200 px-2 text-xs font-semibold">
                {[0, 20, 30, 50, 60, 70, 80, 100].map((v) => (
                  <option key={v} value={v}>{v}%</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase text-slate-500">Notes</span>
              <textarea rows={2} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs" placeholder="Add availability notes..." />
            </label>
            <div className="flex gap-2">
              <button type="button" className="flex-1 rounded-md border border-slate-200 py-2 text-xs font-black text-slate-600">Cancel</button>
              <button type="button" className="flex-1 rounded-md bg-[#0072CE] py-2 text-xs font-black text-white">Save changes</button>
            </div>
              </>
            )}

            <div>
              <div className="mb-2 text-xs font-black uppercase text-[#172554]">Upcoming commitments</div>
              <div className="space-y-2">
                {expert.upcomingCommitments.map((c) => (
                  <div key={`${c.date}-${c.label}`} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
                    <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0072CE]" />
                    <div>
                      <div className="text-[10px] font-bold text-slate-400">{c.date}</div>
                      <div className="text-xs font-semibold text-slate-700">{c.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'projects' && (
          <div className="space-y-3">
            {expert.pastMissions.map((m) => (
              <div key={m.title} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="text-xs font-black text-[#0F1B3D]">{m.title}</div>
                <div className="text-[10px] text-slate-500">{m.organization} · {m.role}</div>
                {m.impact && <div className="mt-1 text-[10px] font-semibold text-emerald-700">{m.impact}</div>}
              </div>
            ))}
            {expert.pastMissions.length === 0 && (
              <p className="text-xs text-slate-500">No active project history recorded.</p>
            )}
          </div>
        )}

        {tab === 'skills' && (
          <div className="space-y-3">
            {expert.expertiseLevels.map((item) => (
              <div key={item.skill} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex justify-between text-xs font-black">
                  <span>{item.skill}</span>
                  <span className="text-[#0072CE]">{item.level}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                  <div
                    className={cn('h-full rounded-full bg-[#0072CE]', item.level === 'Expert' ? 'w-[92%]' : item.level === 'Advanced' ? 'w-[74%]' : 'w-[56%]')}
                  />
                </div>
              </div>
            ))}
            <div className="mt-4">
              <div className="mb-2 text-[10px] font-black uppercase text-slate-400">Certifications</div>
              {expert.certifications.map((c) => (
                <div key={c} className="mb-1 text-xs font-semibold text-slate-600">· {c}</div>
              ))}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div className="space-y-3 text-xs text-slate-600">
            <p>{expert.summary}</p>
            <div><span className="font-black text-slate-800">Contract:</span> {expert.contractType}</div>
            <div><span className="font-black text-slate-800">Experience:</span> {expert.experienceLevel}</div>
            <div><span className="font-black text-slate-800">Languages:</span> {expert.languages.join(', ')}</div>
            <a href={`mailto:${expert.contact.email}`} className="block font-bold text-[#0072CE]">{expert.contact.email}</a>
          </div>
        )}
      </div>
    </aside>
  );
}
