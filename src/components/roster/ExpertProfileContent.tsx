import React, { useState } from 'react';
import {
  Award,
  Briefcase,
  Calendar,
  CheckCircle,
  Download,
  Mail,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import type { ITExpert } from '../../types/expert';
import Avatar, { Badge, StatusBadge } from './SharedUI';
import SendEmailModal from './SendEmailModal';
import CalendarView from './CalendarView';
import MonthlyCalendarView from './MonthlyCalendarView';
import { cn } from '../../lib/utils';

const SECTIONS = ['Overview', 'Technical Skills', 'Experience', 'Availability'] as const;

type ExpertProfileContentProps = {
  expert: ITExpert;
};

export default function ExpertProfileContent({ expert }: ExpertProfileContentProps) {
  const [activeSection, setActiveSection] = useState<(typeof SECTIONS)[number]>('Overview');
  const [showEmail, setShowEmail] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'weekly' | 'monthly'>('monthly');

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_22px_65px_rgba(15,23,42,0.08)]">
        <div className="relative overflow-hidden rounded-t-2xl bg-[#0066B3] px-5 py-5 pr-14 text-white sm:px-6 sm:py-6 md:pr-16">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.20),transparent_35%,rgba(4,120,87,0.22))]" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 gap-4">
              <Avatar expert={expert} size="lg" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black">{expert.name}</h1>
                  {expert.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-black">
                      <ShieldCheck className="h-4 w-4" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="mt-1 text-lg font-bold text-sky-100">{expert.role}</p>
                <p className="mt-1 text-sm text-white/80">{expert.team}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-sm font-bold">
                    <MapPin className="h-4 w-4" />
                    {expert.country} · {expert.timezone}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-sm font-bold">
                    <Briefcase className="h-4 w-4" />
                    {expert.yearsExperience} years
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={expert.availabilityStatus} />
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">{expert.allocationPercent}% allocated</span>
            </div>
          </div>
        </div>

        <div className="custom-scrollbar flex overflow-x-auto border-b border-slate-200 px-4 sm:px-6">
          {SECTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setActiveSection(s)}
              className={cn(
                'shrink-0 border-b-2 px-3 py-3 text-xs font-black uppercase transition sm:px-4',
                activeSection === s ? 'border-[#0072CE] text-[#0072CE]' : 'border-transparent text-slate-400 hover:text-slate-600',
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]">
          <div className="min-w-0">
            {activeSection === 'Overview' && (
              <div className="space-y-6">
                <section>
                  <h2 className="mb-3 text-sm font-black uppercase text-[#172554]">Bio</h2>
                  <p className="text-sm leading-7 text-slate-600">{expert.bio}</p>
                </section>
                <section>
                  <h2 className="mb-3 text-sm font-black uppercase text-[#172554]">Role & Team</h2>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs font-bold text-slate-400">Role</dt><dd className="font-black text-[#0F1B3D]">{expert.role}</dd></div>
                    <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs font-bold text-slate-400">Team</dt><dd className="font-black text-[#0F1B3D]">{expert.team}</dd></div>
                    <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs font-bold text-slate-400">Business Unit</dt><dd className="font-black text-[#0F1B3D]">{expert.businessUnit}</dd></div>
                    <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs font-bold text-slate-400">Contract</dt><dd className="font-black text-[#0F1B3D]">{expert.contractType}</dd></div>
                  </dl>
                </section>
                <section>
                  <h2 className="mb-3 text-sm font-black uppercase text-[#172554]">Technology Stack</h2>
                  <div className="flex flex-wrap gap-2">
                    {expert.technologyStack.map((t) => (
                      <Badge key={t} className="border-sky-100 bg-sky-50 text-sky-700">{t}</Badge>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeSection === 'Technical Skills' && (
              <div className="space-y-6">
                <section>
                  <h2 className="mb-4 text-sm font-black uppercase text-[#172554]">Skills Matrix</h2>
                  <div className="space-y-3">
                    {expert.expertiseLevels.map((item) => (
                      <div key={item.skill} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                        <div className="mb-2 flex justify-between">
                          <span className="text-sm font-black">{item.skill}</span>
                          <span className="text-xs font-black text-[#0072CE]">{item.level}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white">
                          <div className={cn('h-full rounded-full bg-[#0072CE]', item.level === 'Expert' ? 'w-[92%]' : item.level === 'Advanced' ? 'w-[74%]' : 'w-[56%]')} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h2 className="mb-4 text-sm font-black uppercase text-[#172554]">Certifications</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {expert.certifications.map((cert) => (
                      <div key={cert} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
                        <Award className="h-5 w-5 text-[#0072CE]" />
                        <span className="text-sm font-bold">{cert}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeSection === 'Experience' && (
              <div className="space-y-4">
                {expert.pastMissions.map((m) => (
                  <div key={m.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-black text-[#0F1B3D]">{m.title}</h3>
                    <p className="text-sm font-semibold text-slate-500">{m.organization} · {m.role}</p>
                    {m.technologies && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {m.technologies.map((t) => (
                          <Badge key={t} className="border-sky-100 bg-sky-50 text-sky-700">{t}</Badge>
                        ))}
                      </div>
                    )}
                    {m.impact && (
                      <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-emerald-700">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {m.impact}
                      </p>
                    )}
                  </div>
                ))}
                {expert.pastMissions.length === 0 && (
                  <p className="text-sm text-slate-500">Project history will appear here.</p>
                )}
              </div>
            )}

            {activeSection === 'Availability' && (
              <div className="min-w-0">
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-3 text-center">
                    <div className="text-xs font-bold text-slate-400">Utilization</div>
                    <div className="text-2xl font-black text-[#0072CE]">{expert.utilizationPercent}%</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-center">
                    <div className="text-xs font-bold text-slate-400">Active Projects</div>
                    <div className="text-2xl font-black text-[#0F1B3D]">{expert.activeProjectsCount}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-center">
                    <div className="text-xs font-bold text-slate-400">Next Available</div>
                    <div className="text-sm font-black text-[#0F1B3D]">{expert.nextAvailableDate}</div>
                  </div>
                </div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-black uppercase text-[#172554]">Availability calendar</h3>
                  <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setCalendarMode('weekly')}
                      className={cn(
                        'rounded-md px-3 py-1 text-xs font-black transition',
                        calendarMode === 'weekly' ? 'bg-[#0072CE] text-white' : 'text-slate-600 hover:bg-slate-50',
                      )}
                    >
                      Weekly
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarMode('monthly')}
                      className={cn(
                        'rounded-md px-3 py-1 text-xs font-black transition',
                        calendarMode === 'monthly' ? 'bg-[#0072CE] text-white' : 'text-slate-600 hover:bg-slate-50',
                      )}
                    >
                      Monthly
                    </button>
                  </div>
                </div>
                {calendarMode === 'weekly' ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <CalendarView experts={[expert]} compact />
                    <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 px-4 py-2 text-[10px] font-bold text-slate-600">
                      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Available</span>
                      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-500" /> Partially available</span>
                      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-sky-500" /> Fully booked</span>
                      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-violet-500" /> On leave</span>
                    </div>
                  </div>
                ) : (
                  <MonthlyCalendarView expert={expert} />
                )}
                <div className="mt-4">
                  <h3 className="mb-2 text-sm font-black uppercase text-[#172554]">Upcoming Commitments</h3>
                  {expert.upcomingCommitments.map((c) => (
                    <div key={`${c.date}-${c.label}`} className="mb-2 flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                      <Calendar className="h-4 w-4 text-[#0072CE]" />
                      <span className="font-bold text-slate-400">{c.date}</span>
                      <span className="font-semibold">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="min-w-0 space-y-4 lg:sticky lg:top-0 lg:self-start">
            <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-4 text-sm font-black uppercase text-[#172554]">Contact</h3>
              <a
                href={`mailto:${expert.contact.email}`}
                className="flex min-w-0 items-center gap-2 text-sm font-bold text-[#0072CE] hover:underline"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{expert.contact.email}</span>
              </a>
            </section>
            <section className="min-w-0 rounded-xl border border-[#0072CE]/35 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-4 text-sm font-black uppercase text-[#172554]">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowEmail(true)}
                  className="box-border flex h-10 w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-[#0072CE] px-3 text-sm font-black text-white hover:bg-[#0055A6]"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  Send Email
                </button>
                <button
                  type="button"
                  className="box-border flex h-10 w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  Download CV
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <SendEmailModal
        expert={showEmail ? expert : null}
        onClose={() => setShowEmail(false)}
      />
    </>
  );
}
