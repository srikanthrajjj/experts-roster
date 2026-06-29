import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, CalendarDays, GanttChart, TrendingDown, TrendingUp, Users } from 'lucide-react';
import AppHeader from '../components/roster/AppHeader';
import { ManagerKPICards } from '../components/roster/KPICards';
import GanttView from '../components/roster/GanttView';
import CalendarView from '../components/roster/CalendarView';
import { MOCK_IT_EXPERTS, computeKPIs } from '../data/itExperts';
import type { ITExpert } from '../types/expert';
import Avatar, { StatusBadge } from '../components/roster/SharedUI';
import { CertificationsGrid, CertificationLogoStrip } from '../components/roster/CertificationBadge';
import { getCertificationName } from '../lib/certificationLogos';
import { formatNextAvailable } from '../lib/availability';
import { isExpertRole } from '../lib/userRole';

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
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  // Read expert data from localStorage so manager sees expert edits in real time
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

  return (
    <div className="min-h-screen bg-[#EEF5FC] text-slate-800">
      <AppHeader />

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#0F1B3D] md:text-3xl">Resource Planning Dashboard</h1>
            <p className="text-sm font-medium text-slate-500">Primary Digital Advisor · IT Talent Marketplace</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/roster/planning?view=gantt" className="rounded-lg bg-[#0072CE] px-4 py-2 text-sm font-black text-white hover:bg-[#0055A6]">
              Open Gantt Planning
            </Link>
            <Link to="/roster/planning?view=calendar" className="rounded-lg border border-[#0072CE]/30 bg-white px-4 py-2 text-sm font-black text-[#0072CE] hover:bg-sky-50">
              Open Calendar
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <ManagerKPICards kpis={kpis} />
        </div>



        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-black uppercase text-[#172554]">Availability at a glance</h2>
              <p className="mt-0.5 text-xs font-medium text-slate-500">Preview team capacity without leaving the dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-slate-200 p-1">
                <button
                  type="button"
                  onClick={() => setPreviewTab('gantt')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-black transition ${previewTab === 'gantt' ? 'bg-[#0072CE] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <GanttChart className="h-3.5 w-3.5" />
                  Gantt
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('calendar')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-black transition ${previewTab === 'calendar' ? 'bg-[#0072CE] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  Calendar
                </button>
              </div>
              <Link to={`/roster/planning?view=${previewTab}`} className="text-xs font-black text-[#0072CE] hover:underline">
                View full planning →
              </Link>
            </div>
          </div>
          <div className="h-[320px] overflow-hidden">
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
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <h2 className="text-sm font-black uppercase text-[#172554]">Available Experts</h2>
              </div>
              <Link to="/roster/planning?view=list" className="text-[10px] font-black text-[#0072CE] hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {available.slice(0, 5).map((e) => (
                <Link key={e.id} to={`/roster/planning?view=gantt`} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition hover:bg-sky-50">
                  <Avatar expert={e} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black">{e.name}</div>
                    <div className="truncate text-xs text-slate-500">{e.technologyStack[0]} · Next {formatNextAvailable(e.nextAvailableDate)}</div>
                    <CertificationLogoStrip certifications={e.certifications} max={4} size="sm" className="mt-1.5" />
                  </div>
                  <StatusBadge status={e.availabilityStatus} />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h2 className="text-sm font-black uppercase text-[#172554]">Overallocated Resources</h2>
            </div>
            <div className="space-y-3">
              {overallocated.map((e) => (
                <Link key={e.id} to="/roster/planning?view=gantt" className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 p-3 transition hover:border-amber-200">
                  <div className="flex items-center gap-3">
                    <Avatar expert={e} size="sm" />
                    <div>
                      <div className="text-sm font-black">{e.name}</div>
                      <div className="text-xs text-slate-500">{e.activeProjectsCount} active projects</div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-amber-700">{e.allocationPercent}%</span>
                </Link>
              ))}
              {overallocated.length === 0 && <p className="text-xs text-slate-500">No overallocated resources.</p>}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-sky-600" />
              <h2 className="text-sm font-black uppercase text-[#172554]">Underutilized Experts</h2>
            </div>
            <div className="space-y-3">
              {underutilized.map((e) => (
                <Link key={e.id} to="/roster/planning?view=calendar" className="flex items-center justify-between rounded-lg border border-sky-100 bg-sky-50 p-3 transition hover:border-sky-200">
                  <div className="flex items-center gap-3">
                    <Avatar expert={e} size="sm" />
                    <div>
                      <div className="text-sm font-black">{e.name}</div>
                      <div className="text-xs text-slate-500">{e.benchAvailable ? 'Bench available' : 'Low utilization'}</div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-sky-700">{e.utilizationPercent}%</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase text-[#172554]">Team Certifications</h2>
              <p className="mt-0.5 text-xs font-medium text-slate-500">Verified credentials across the IT talent pool</p>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-[#0072CE]">
              {teamCertifications.length} unique
            </span>
          </div>
          <CertificationsGrid
            certifications={teamCertifications.map((item) => item.name)}
            emptyMessage="No team certifications on record."
            size="md"
          />
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#0072CE]" />
            <h2 className="text-sm font-black uppercase text-[#172554]">High Demand Skills & Staffing Gaps</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { skill: 'ServiceNow Architect', demand: 'High', gap: 2, available: 1 },
              { skill: 'Cybersecurity Specialist', demand: 'Critical', gap: 1, available: 1 },
              { skill: 'Azure Cloud Engineer', demand: 'High', gap: 3, available: 2 },
              { skill: 'AI/ML Specialist', demand: 'Growing', gap: 2, available: 1 },
              { skill: 'Salesforce Consultant', demand: 'Medium', gap: 1, available: 0 },
              { skill: 'DevOps Engineer', demand: 'Medium', gap: 1, available: 1 },
            ].map((item) => (
              <div key={item.skill} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm font-black text-[#0F1B3D]">{item.skill}</div>
                <div className="mt-2 flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Demand: {item.demand}</span>
                  <span className="text-red-600">{item.gap} gap</span>
                </div>
                <div className="mt-1 text-xs text-emerald-700">{item.available} available now</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
