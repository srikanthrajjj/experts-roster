import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  PlusCircle,
  Star,
  User,
} from 'lucide-react';
import AppHeader from '../components/roster/AppHeader';
import MonthlyCalendarView from '../components/roster/MonthlyCalendarView';
import ExpertProfileEditModal from '../components/roster/ExpertProfileEditModal';
import { CertificationsGrid } from '../components/roster/CertificationBadge';
import { DashboardHero, InsightPanel, UtilizationRing } from '../components/roster/KPICards';
import Avatar, { StatusBadge } from '../components/roster/SharedUI';
import { ExpertResourceBadges } from '../components/roster/LeafBadges';
import { MOCK_IT_EXPERTS, formatWeekLabel } from '../data/itExperts';
import type { ITExpert, AllocationBlock } from '../types/expert';
import { isExpertRole, isManagerLike } from '../lib/userRole';
import { formatNextAvailable } from '../lib/availability';
import { cn } from '../lib/utils';

export default function TechExpertDashboard() {
  const navigate = useNavigate();

  // Local storage listener for redirecting if role switches to manager
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (isManagerLike(role)) {
      navigate('/roster/planning', { replace: true });
    }

    const checkRole = () => {
      const currentRole = localStorage.getItem('userRole');
      if (isManagerLike(currentRole)) {
        navigate('/roster/planning', { replace: true });
      }
    };
    window.addEventListener('storage', checkRole);
    return () => window.removeEventListener('storage', checkRole);
  }, [navigate]);

  // Maintain local state of experts to allow dynamic calendar updates in memory
  const [expertsData, setExpertsData] = useState<ITExpert[]>(() => {
    const saved = localStorage.getItem('expert_dashboard_data');
    return saved ? JSON.parse(saved) : MOCK_IT_EXPERTS;
  });

  const [selectedExpertId] = useState('1'); // Default: Ahmed Garcia
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    const handleOpenEdit = () => {
      setIsEditProfileOpen(true);
    };
    window.addEventListener('open-profile-edit', handleOpenEdit);
    return () => window.removeEventListener('open-profile-edit', handleOpenEdit);
  }, []);

  const handleSaveProfile = (updatedExpert: ITExpert) => {
    const updatedList = expertsData.map(e => e.id === updatedExpert.id ? updatedExpert : e);
    persistData(updatedList);
    // Modal is kept open (active) on save to allow viewing the updated status/timestamp
  };

  // Form State for updating commitments
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedDateKeys, setSelectedDateKeys] = useState<string[]>([]);
  const [allocationType, setAllocationType] = useState<AllocationBlock['type']>('project');
  const [projectName, setProjectName] = useState('');
  const [percentage, setPercentage] = useState(100);
  const [successMessage, setSuccessMessage] = useState('');

  const handleDateKeyToggle = (dateKey: string) => {
    setSelectedDateKeys(prev => {
      if (prev.includes(dateKey)) {
        return prev.filter(k => k !== dateKey);
      } else {
        return [...prev, dateKey];
      }
    });
  };

  // Persist edits to localStorage for persistence across reloads
  const persistData = (updatedData: ITExpert[]) => {
    setExpertsData(updatedData);
    localStorage.setItem('expert_dashboard_data', JSON.stringify(updatedData));
    window.dispatchEvent(new Event('storage'));
  };

  const activeExpert = useMemo(() => {
    return expertsData.find(e => e.id === selectedExpertId) || expertsData[0];
  }, [expertsData, selectedExpertId]);

  // Set the default selected week when changing experts
  useEffect(() => {
    if (activeExpert && activeExpert.allocations.length > 0) {
      setSelectedWeek(activeExpert.allocations[0].weekStart);
      
      // Auto fill form based on current value for that week
      const currentBlock = activeExpert.allocations[0];
      setAllocationType(currentBlock.type);
      setProjectName(currentBlock.projectName || '');
      setPercentage(currentBlock.percentage);
    }
  }, [selectedExpertId]);

  // Auto fill form when selected week changes
  const handleWeekChange = (week: string) => {
    setSelectedWeek(week);
    const block = activeExpert.allocations.find(a => a.weekStart === week);
    if (block) {
      setAllocationType(block.type);
      setProjectName(block.projectName || '');
      setPercentage(block.percentage);
    }
  };

  // Submit Handler to update the calendar/project block
  const handleUpdateCommitment = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData = expertsData.map(expert => {
      if (expert.id !== selectedExpertId) return expert;

      let updatedAllocations = expert.allocations;
      let updatedDailyAllocations = { ...(expert.dailyAllocations || {}) };

      if (selectedDateKeys.length > 0) {
        // Daily override update
        selectedDateKeys.forEach(dateKey => {
          let label = 'Available 100%';
          if (allocationType === 'project') {
            label = `${projectName || 'Project'} ${percentage}%`;
          } else if (allocationType === 'partial') {
            label = `Partially available ${percentage}%`;
          } else if (allocationType === 'leave') {
            label = 'Leave';
          } else if (allocationType === 'available') {
            label = `Available ${percentage}%`;
          }

          updatedDailyAllocations[dateKey] = {
            type: allocationType,
            percentage: allocationType === 'leave' ? 0 : percentage,
            label,
            projectName: allocationType === 'project' ? projectName : undefined,
          };
        });
      } else {
        // Standard weekly block update
        updatedAllocations = expert.allocations.map(block => {
          if (block.weekStart !== selectedWeek) return block;

          // Generate customized label based on type
          let label = 'Available 100%';
          if (allocationType === 'project') {
            label = `${projectName || 'Project'} ${percentage}%`;
          } else if (allocationType === 'partial') {
            label = `Partially available ${percentage}%`;
          } else if (allocationType === 'leave') {
            label = 'Leave';
          } else if (allocationType === 'available') {
            label = `Available ${percentage}%`;
          }

          return {
            ...block,
            type: allocationType,
            projectName: allocationType === 'project' ? projectName : undefined,
            percentage: allocationType === 'leave' ? 0 : percentage,
            label,
          };
        });
      }

      // Recalculate average utilization rate (taking daily overrides into account)
      let totalPercentage = 0;
      const count = updatedAllocations.length;
      
      updatedAllocations.forEach(block => {
        const start = new Date(block.weekStart);
        let weekSum = 0;
        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const key = d.toISOString().split('T')[0];
          if (updatedDailyAllocations[key]) {
            weekSum += updatedDailyAllocations[key].percentage;
          } else {
            weekSum += block.percentage;
          }
        }
        totalPercentage += Math.round(weekSum / 7);
      });
      const avgAllocation = Math.round(totalPercentage / count);

      // Determine new availability based on first week's first day pattern
      const firstWeekStart = updatedAllocations[0]?.weekStart;
      let firstDayType = updatedAllocations[0]?.type || 'available';
      let firstDayPercentage = updatedAllocations[0]?.percentage || 100;

      if (firstWeekStart) {
        const d = new Date(firstWeekStart);
        const key = d.toISOString().split('T')[0];
        if (updatedDailyAllocations[key]) {
          firstDayType = updatedDailyAllocations[key].type;
          firstDayPercentage = updatedDailyAllocations[key].percentage;
        }
      }

      let availability = 'Available';
      let availabilityStatus: ITExpert['availabilityStatus'] = 'available';

      if (firstDayType === 'leave') {
        availability = 'On leave';
        availabilityStatus = 'on_leave';
      } else if (firstDayPercentage >= 100) {
        availability = 'Fully booked';
        availabilityStatus = 'fully_booked';
      } else if (firstDayPercentage > 0) {
        availability = 'Partially available';
        availabilityStatus = 'partially_allocated';
      }

      // Compute active projects count
      const activeProjectsSet = new Set<string>();
      updatedAllocations.forEach(block => {
        if (block.type === 'project' && block.projectName) {
          activeProjectsSet.add(block.projectName);
        }
      });
      Object.keys(updatedDailyAllocations).forEach(k => {
        const item = updatedDailyAllocations[k];
        if (item.type === 'project' && item.projectName) {
          activeProjectsSet.add(item.projectName);
        }
      });

      // Rebuild upcoming commitments list
      const upcomingCommitments = updatedAllocations.slice(0, 3).map((a, idx) => {
        const start = new Date(a.weekStart);
        const key = start.toISOString().split('T')[0];
        const dayInfo = updatedDailyAllocations[key] || a;

        let labelStr = 'Available';
        if (dayInfo.type === 'project') {
          labelStr = `${dayInfo.projectName} (${dayInfo.percentage}%)`;
        } else if (dayInfo.type === 'leave') {
          labelStr = 'Annual Leave';
        } else if (dayInfo.type === 'partial') {
          labelStr = `Partially Available (${dayInfo.percentage}%)`;
        }
        
        // Dynamic dates formatting for upcoming commitments labels
        const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        const formattedRange = `${fmt(start)}–${fmt(end)}`;

        return {
          date: formattedRange,
          label: labelStr,
          type: dayInfo.type === 'partial' ? 'available' : dayInfo.type === 'leave' ? 'leave' : 'project',
          allocation: dayInfo.percentage
        };
      });

      const nextAvailableBlock = updatedAllocations.find(a => {
        const start = new Date(a.weekStart);
        let isFullyBooked = true;
        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const key = d.toISOString().split('T')[0];
          const pct = updatedDailyAllocations[key] ? updatedDailyAllocations[key].percentage : a.percentage;
          if (pct < 100) {
            isFullyBooked = false;
            break;
          }
        }
        return !isFullyBooked;
      });
      const nextAvailableDate = nextAvailableBlock ? nextAvailableBlock.weekStart : expert.nextAvailableDate;

      return {
        ...expert,
        allocations: updatedAllocations,
        dailyAllocations: updatedDailyAllocations,
        allocationPercent: firstDayPercentage,
        utilizationPercent: avgAllocation,
        availability,
        availabilityStatus,
        activeProjectsCount: activeProjectsSet.size,
        upcomingCommitments,
        nextAvailableDate,
        benchAvailable: avgAllocation < 80,
      };
    });

    persistData(updatedData);
    setSuccessMessage('Schedule updated successfully!');
    setSelectedDateKeys([]);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Dynamic KPI calculation
  const stats = useMemo(() => {
    // Unique active projects
    const uniqueProjects = new Set(
      activeExpert.allocations
        .filter(a => a.type === 'project' && a.projectName)
        .map(a => a.projectName)
    );

    // Total busy weeks (weeks with non-available/non-leave allocations)
    const busyWeeks = activeExpert.allocations.filter(
      a => a.type === 'project' || a.type === 'partial'
    ).length;

    // Remaining bench weeks in the next 8 weeks
    const availableWeeks = activeExpert.allocations.filter(
      a => a.type === 'available' || a.type === 'partial'
    ).length;

    return {
      activeProjectsCount: uniqueProjects.size,
      busyWeeks,
      availableWeeks,
      utilizationRate: activeExpert.utilizationPercent,
    };
  }, [activeExpert]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#EEF5FC] text-slate-800">
      <AppHeader />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <DashboardHero
            eyebrow="Digital Advisor · Expert Workspace"
            title={`Welcome back, ${activeExpert.name.split(' ')[0]}!`}
            subtitle={`${activeExpert.role} · ${activeExpert.team}`}
            className="mb-6"
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <UtilizationRing
                value={activeExpert.utilizationPercent}
                size={100}
                label="Utilized"
              />
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-[#0072CE] shadow-lg transition hover:bg-sky-50"
                >
                  <User className="h-4 w-4" aria-hidden />
                  Edit Profile
                </button>
                <span className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-xs font-black text-white backdrop-blur-sm">
                  <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" aria-hidden />
                  {activeExpert.trustRating} · {activeExpert.reviewsCount} reviews
                </span>
              </div>
            </div>
          </DashboardHero>

          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <Avatar expert={activeExpert} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-[#0F1B3D]">{activeExpert.name}</span>
                <ExpertResourceBadges expert={activeExpert} max={4} />
                <StatusBadge status={activeExpert.availabilityStatus} />
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Next available {formatNextAvailable(activeExpert.nextAvailableDate, activeExpert.availabilityStatus)}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: 'Utilization', value: `${activeExpert.utilizationPercent}%`, tone: 'text-[#0091F9]' },
                { label: 'Projects', value: String(stats.activeProjectsCount), tone: 'text-[#0F1B3D]' },
                { label: 'Open weeks', value: String(stats.availableWeeks), tone: 'text-emerald-600' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-2.5 text-center">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{stat.label}</div>
                  <div className={cn('text-xl font-black tabular-nums', stat.tone)}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <InsightPanel title="My Assignment Timeline" icon={Calendar} className="overflow-hidden">
              <div className="space-y-5">
                <MonthlyCalendarView
                  expert={activeExpert}
                  selectedWeekStart={selectedWeek}
                  onSelectWeekStart={handleWeekChange}
                  selectedDateKeys={selectedDateKeys}
                  onSelectDateKey={handleDateKeyToggle}
                />
              </div>
            </InsightPanel>
          </div>

          <div className="flex flex-col gap-6">
            <InsightPanel title="Update Availability" icon={PlusCircle}>
              {successMessage && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 animate-fade-in">
                  <CheckCircle className="h-4 w-4 text-emerald-600" aria-hidden />
                  {successMessage}
                </div>
              )}

              {selectedDateKeys.length > 0 && (
                <div className="mb-4 flex animate-fade-in items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 shadow-sm">
                  <span>Selected {selectedDateKeys.length} days for edit</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDateKeys([])}
                    className="cursor-pointer text-[10px] font-black text-rose-600 underline decoration-dotted hover:text-rose-800"
                  >
                    Clear
                  </button>
                </div>
              )}

              <form onSubmit={handleUpdateCommitment} className="space-y-4">
                
                {/* Week Selection */}
                {selectedDateKeys.length === 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Target Week
                    </label>
                    <select
                      value={selectedWeek}
                      onChange={(e) => handleWeekChange(e.target.value)}
                      className="w-full text-xs font-semibold rounded-lg border-slate-200 bg-white p-2.5 shadow-sm focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE]"
                    >
                      {activeExpert.allocations.map(block => (
                        <option key={block.weekStart} value={block.weekStart}>
                          {formatWeekLabel(block.weekStart)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Allocation Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Allocation Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'project', label: 'Project Work' },
                      { type: 'partial', label: 'Partial Availability' },
                      { type: 'available', label: 'Fully Available' },
                      { type: 'leave', label: 'On Leave' }
                    ].map(opt => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => {
                          setAllocationType(opt.type as AllocationBlock['type']);
                          if (opt.type === 'leave') {
                            setPercentage(0);
                          } else if (opt.type === 'available') {
                            setPercentage(100);
                          }
                        }}
                        className={`px-3 py-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                          allocationType === opt.type
                            ? 'border-[#0072CE] bg-sky-50 text-[#0072CE] shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Name (Only visible if type is Project) */}
                {allocationType === 'project' && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Project / Assignment Name
                    </label>
                    <input
                      type="text"
                      required
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. S/4HANA Migration, Donor CRM Rollout"
                      className="w-full text-xs font-semibold rounded-lg border-slate-200 p-2.5 shadow-sm focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE]"
                    />
                  </div>
                )}

                {/* Allocation Percentage (Hidden for leave) */}
                {allocationType !== 'leave' && (
                  <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Allocation Percentage
                      </label>
                      <span className="text-xs font-black text-[#0072CE]">{percentage}%</span>
                    </div>
                    
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="10"
                      value={percentage}
                      onChange={(e) => setPercentage(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0072CE]"
                    />
                    
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                      <span>10% (Low)</span>
                      <span>50%</span>
                      <span>100% (Full)</span>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0091F9] to-[#0072CE] py-3 px-4 text-xs font-black text-white shadow-md transition hover:shadow-lg"
                >
                  <PlusCircle className="h-4 w-4" aria-hidden />
                  Update Week Schedule
                </button>
              </form>

              <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#0091F9]" aria-hidden />
                <p className="text-[11px] font-semibold leading-relaxed text-slate-500">
                  Changes update your live availability in the IT Talent Marketplace so managers can find and book you.
                </p>
              </div>
            </InsightPanel>

            <InsightPanel title="My Certifications" icon={Award} iconClassName="bg-[#00ADEF]/10 text-[#0072CE]">
              <CertificationsGrid
                certifications={activeExpert.certifications}
                emptyMessage="No certifications added yet. Use Edit Profile to add credentials."
                size="md"
              />
            </InsightPanel>
          </div>
        </div>
      </div>
      </div>

      {isEditProfileOpen && (
        <ExpertProfileEditModal
          expert={activeExpert}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}

