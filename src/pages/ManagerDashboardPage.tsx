import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CalendarDays,
  GanttChart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import AppHeader from '../components/roster/AppHeader';
import { DashboardHero, InsightPanel, ManagerKPICards } from '../components/roster/KPICards';
import GanttView from '../components/roster/GanttView';
import CalendarView from '../components/roster/CalendarView';
import { MOCK_IT_EXPERTS, computeKPIs } from '../data/itExperts';
import type { ITExpert } from '../types/expert';
import Avatar, { StatusBadge } from '../components/roster/SharedUI';
import { CertificationsGrid, CertificationLogoStrip } from '../components/roster/CertificationBadge';
import { getCertificationName } from '../lib/certificationLogos';
import { formatNextAvailable } from '../lib/availability';
import { isExpertRole } from '../lib/userRole';
import { cn } from '../lib/utils';

const DEMAND_SKILLS = [
  { skill: 'ServiceNow Architect', demand: 'High', gap: 2, available: 1, tone: 'from-violet-500/10 to-violet-500/5 border-violet-200' },
  { skill: 'Cybersecurity Specialist', demand: 'Critical', gap: 1, available: 1, tone: 'from-rose-500/10 to-rose-500/5 border-rose-200' },
  { skill: 'Azure Cloud Engineer', demand: 'High', gap: 3, available: 2, tone: 'from-sky-500/10 to-sky-500/5 border-sky-200' },
  { skill: 'AI/ML Specialist', demand: 'Growing', gap: 2, available: 1, tone: 'from-[#0091F9]/10 to-[#00ADEF]/5 border-sky-200' },
  { skill: 'Salesforce Consultant', demand: 'Medium', gap: 1, available: 0, tone: 'from-indigo-500/10 to-indigo-500/5 border-indigo-200' },
  { skill: 'DevOps Engineer', demand: 'Medium', gap: 1, available: 1, tone: 'from-teal-500/10 to-teal-500/5 border-teal-200' },
] as const;

export default function ManagerDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isExpertRole(localStorage.getItem('userRole'))) {
      navigate('/roster/expert-dashboard', { replace: true });
    }

    const handleStorageChange = () => {
      if (isExpertRole(localStorage.getItem('userRole'))) {
        navigate('/roster/expert-dashboard', { replace: true });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const [expertsData, setExpertsData] = useState<ITExpert[]>(() => {
    const saved = localStorage.getItem('expert_dashboard_data');
    return saved ? JSON.parse(saved) : MOCK_IT_EXPERTS;
  });

  useEffect(() => {
    const syncData = () => {
      const saved = localStorage.getItem('expert_dashboard_data');
      if (saved) setExpertsData(JSON.parse(saved));
    };
    window.addEventListener('storage', syncData);
    return () => window.removeEventListener('storage', syncData);
  }, []);

  const kpis = useMemo(() => computeKPIs(expertsData), [expertsData]);
  const [previewTab, setPreviewTab] = useState<'gantt' | 'calendar'>('gantt');
  const [currentMonth] = useState(new Date());
  const [zoom] = useState<'weekly' | 'monthly'>('weekly');

  const overallocated = expertsData.filter((e) => e.allocationPercent > 80);
  const underutilized = expertsData.filter((e) => e.utilizationPercent < 30 && e.availabilityStatus !== 'on_leave');
  const available = expertsData.filter((e) => e.availabilityStatus === 'available');
  const previewExperts = expertsData.slice(0, 5);

  const teamCertifications = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    expertsData.forEach((expert) => {
      expert.certifications.forEach((cert) => {
        const name = getCertificationName(cert);
        const existing = map.get(name);
        if (existing) existing.count += 1;
        else map.set(name, { name, count: 1 });
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [expertsData]);

  const capacityPercent = Math.round((kpis.availableThisWeek / Math.max(kpis.total, 1)) * 100);

  return (
    <div className="min-h-screen bg-[#EEF5FC] text-slate-800">
      <AppHeader />

      <div className="mx-auto max-w-7xl px-4 py-6">
        <DashboardHero
          eyebrow="TeamOne · Primary Digital Advisor"
          title="Resource Planning Dashboard"
          subtitle={`${kpis.total} experts in the pool · ${kpis.availableThisWeek} staffable this week · ${capacityPercent}% immediate capacity`}
        >
          <Link
            to="/roster/planning?view=gantt"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-[#0072CE] transition hover:bg-sky-50"
          >
            <GanttChart className="h-4 w-4" aria-hidden />
            Gantt Planning
          </Link>
          <Link
            to="/roster/planning?view=calendar"
            className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <CalendarDays className="h-4 w-4" aria-hidden />
            Calendar
          </Link>
        </DashboardHero>

        <div className="mb-8">
          <ManagerKPICards kpis={kpis} />
        </div>

        <InsightPanel
          title="Availability at a glance"
          icon={GanttChart}
          className="mb-6"
          action={
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setPreviewTab('gantt')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition',
                    previewTab === 'gantt' ? 'bg-[#0091F9] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <GanttChart className="h-3.5 w-3.5" aria-hidden />
                  Gantt
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('calendar')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition',
                    previewTab === 'calendar' ? 'bg-[#0091F9] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  Calendar
                </button>
              </div>
              <Link
                to={`/roster/planning?view=${previewTab}`}
                className="hidden items-center gap-1 text-xs font-black text-[#0091F9] hover:underline sm:inline-flex"
              >
                Full view <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          }
        >
          <div className="h-[320px] overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50">
            {previewTab === 'gantt' ? (
              <GanttView
                experts={previewExperts}
                onSelectExpert={() => {}}
                currentMonth={currentMonth}
                onMonthChange={() => {}}
                zoom={zoom}
                onZoomChange={() => {}}
                compact
              />
            ) : (
              <CalendarView experts={previewExperts} compact />
            )}
          </div>
        </InsightPanel>

        <div className="grid gap-6 lg:grid-cols-3">
          <InsightPanel
            title="Available Experts"
            icon={Users}
            iconClassName="bg-emerald-500/10 text-emerald-600"
            action={
              <Link to="/roster/planning?view=list" className="text-[10px] font-black text-[#0091F9] hover:underline">
                View all
              </Link>
            }
          >
            <div className="space-y-3">
              {available.slice(0, 5).map((e) => (
                <Link
                  key={e.id}
                  to="/roster/planning?view=gantt"
                  className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-gradient-to-r from-white to-emerald-50/30 p-3 transition hover:border-emerald-200 hover:shadow-md"
                >
                  <Avatar expert={e} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-[#0F1B3D]">{e.name}</div>
                    <div className="truncate text-xs text-slate-500">
                      {e.technologyStack[0]} · Next {formatNextAvailable(e.nextAvailableDate)}
                    </div>
                    <CertificationLogoStrip certifications={e.certifications} max={4} size="sm" className="mt-1.5" />
                  </div>
                  <StatusBadge status={e.availabilityStatus} />
                </Link>
              ))}
            </div>
          </InsightPanel>

          <InsightPanel
            title="Overallocated"
            icon={AlertTriangle}
            iconClassName="bg-amber-500/10 text-amber-600"
          >
            <div className="space-y-3">
              {overallocated.map((e) => (
                <Link
                  key={e.id}
                  to="/roster/planning?view=gantt"
                  className="flex items-center justify-between rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-white p-3 transition hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <Avatar expert={e} size="sm" />
                    <div>
                      <div className="text-sm font-black">{e.name}</div>
                      <div className="text-xs text-slate-500">{e.activeProjectsCount} active projects</div>
                    </div>
                  </div>
                  <span className="rounded-lg bg-amber-100 px-2 py-1 text-sm font-black text-amber-700">{e.allocationPercent}%</span>
                </Link>
              ))}
              {overallocated.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                  No overallocated resources — capacity looks healthy.
                </p>
              )}
            </div>
          </InsightPanel>

          <InsightPanel
            title="Underutilized"
            icon={TrendingDown}
            iconClassName="bg-sky-500/10 text-sky-600"
          >
            <div className="space-y-3">
              {underutilized.map((e) => (
                <Link
                  key={e.id}
                  to="/roster/planning?view=calendar"
                  className="flex items-center justify-between rounded-xl border border-sky-200/80 bg-gradient-to-r from-sky-50 to-white p-3 transition hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <Avatar expert={e} size="sm" />
                    <div>
                      <div className="text-sm font-black">{e.name}</div>
                      <div className="text-xs text-slate-500">{e.benchAvailable ? 'Bench available' : 'Low utilization'}</div>
                    </div>
                  </div>
                  <span className="rounded-lg bg-sky-100 px-2 py-1 text-sm font-black text-sky-700">{e.utilizationPercent}%</span>
                </Link>
              ))}
            </div>
          </InsightPanel>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <InsightPanel
            title="Team Certifications"
            icon={Award}
            iconClassName="bg-[#0091F9]/10 text-[#0091F9]"
            action={
              <span className="rounded-full bg-[#0091F9]/10 px-3 py-1 text-xs font-black text-[#0091F9]">
                {teamCertifications.length} unique
              </span>
            }
          >
            <CertificationsGrid
              certifications={teamCertifications.map((item) => item.name)}
              emptyMessage="No team certifications on record."
              size="md"
            />
          </InsightPanel>

          <InsightPanel
            title="High Demand Skills"
            icon={TrendingUp}
            iconClassName="bg-violet-500/10 text-violet-600"
            action={
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-black text-violet-600">
                <Sparkles className="h-3 w-3" aria-hidden />
                Live gaps
              </span>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {DEMAND_SKILLS.map((item) => (
                <div
                  key={item.skill}
                  className={cn(
                    'rounded-xl border bg-gradient-to-br p-4 transition hover:shadow-md',
                    item.tone,
                  )}
                >
                  <div className="text-sm font-black text-[#0F1B3D]">{item.skill}</div>
                  <div className="mt-2 flex justify-between text-xs font-bold">
                    <span className="text-slate-500">{item.demand}</span>
                    <span className="text-rose-600">{item.gap} gap</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0091F9] to-[#00ADEF]"
                      style={{ width: `${Math.min(100, (item.available / Math.max(item.gap + item.available, 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-1.5 text-xs font-semibold text-emerald-700">{item.available} available now</div>
                </div>
              ))}
            </div>
          </InsightPanel>
        </div>
      </div>
    </div>
  );
}
