import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle,
  Calendar, 
  CheckCircle,
  User,
  Star,
  PlusCircle
} from 'lucide-react';
import AppHeader from '../components/roster/AppHeader';
import MonthlyCalendarView from '../components/roster/MonthlyCalendarView';
import ExpertProfileEditModal from '../components/roster/ExpertProfileEditModal';
import { CertificationsGrid } from '../components/roster/CertificationBadge';
import { MOCK_IT_EXPERTS, formatWeekLabel } from '../data/itExperts';
import type { ITExpert, AllocationBlock } from '../types/expert';
import { isExpertRole, isManagerLike } from '../lib/userRole';

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
    <div className="h-screen bg-[#EEF5FC] text-slate-800 flex flex-col overflow-hidden">
      <AppHeader />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6">
        
        {/* Navigation & Header Toggle */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Expert Workspace
              </span>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <h1 className="text-2xl font-black text-[#0F1B3D] md:text-3xl">
                  Welcome back, {activeExpert.name}!
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                  <Star className="h-4 w-4 fill-current" />
                  {activeExpert.trustRating} ({activeExpert.reviewsCount} reviews)
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#0072CE] hover:text-[#0055A6] bg-blue-50 hover:bg-blue-100/80 rounded-lg transition cursor-pointer border border-blue-100 shadow-sm"
                >
                  <User className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Dashboard Panels */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Left Panel: Gantt / Calendar Views (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
              
              {/* Header */}
              <div className="border-b border-slate-200 px-5 py-4 bg-slate-50/50">
                <h3 className="text-sm font-black text-[#0F1B3D] uppercase tracking-wider">My Assignment Timeline</h3>
                <p className="text-xs text-slate-500 mt-0.5">View and adjust your calendar commitments</p>
              </div>

              {/* View Output Wrapper */}
              <div className="min-h-[360px] relative p-5 space-y-5 bg-slate-50/20">
                {/* 3 KPI Cards Row (Matches User Profile Availability tab layout) */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-white border border-slate-200 p-3 text-center shadow-sm">
                    <div className="text-xs font-bold text-slate-400">Utilization</div>
                    <div className="text-2xl font-black text-[#0072CE]">{activeExpert.utilizationPercent}%</div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-3 text-center shadow-sm">
                    <div className="text-xs font-bold text-slate-400">Active Projects</div>
                    <div className="text-2xl font-black text-[#0F1B3D]">{activeExpert.activeProjectsCount}</div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-3 text-center shadow-sm">
                    <div className="text-xs font-bold text-slate-400">Next Available</div>
                    <div className="text-sm font-black text-[#0F1B3D]">{activeExpert.nextAvailableDate}</div>
                  </div>
                </div>

                <MonthlyCalendarView 
                  expert={activeExpert} 
                  selectedWeekStart={selectedWeek}
                  onSelectWeekStart={handleWeekChange}
                  selectedDateKeys={selectedDateKeys}
                  onSelectDateKey={handleDateKeyToggle}
                />
              </div>
            </div>

          </div>

          {/* Right Panel: Calendar Commitment Form (1/3 width) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
              
              <div className="mb-4">
                <h3 className="text-sm font-black text-[#0F1B3D] uppercase tracking-wider flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-[#0072CE]" />
                  Update Availability & Projects
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust allocation percentage or log new projects for any week in the 8-week roster timeline.
                </p>
              </div>

              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  {successMessage}
                </div>
              )}

              {selectedDateKeys.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4 text-xs font-bold text-emerald-800 animate-fade-in flex items-center justify-between shadow-sm">
                  <span>Selected {selectedDateKeys.length} days for edit</span>
                  <button 
                    type="button" 
                    onClick={() => setSelectedDateKeys([])} 
                    className="text-[10px] font-black text-rose-600 hover:text-rose-800 cursor-pointer underline decoration-dotted"
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
                  className="w-full mt-4 bg-[#0072CE] hover:bg-[#0055A6] text-white py-3 px-4 rounded-xl text-xs font-black transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  Update Week Schedule
                </button>

              </form>

              {/* Informative Help Alert */}
              <div className="mt-6 p-4 rounded-xl border border-slate-100 bg-slate-50 flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="text-[11px] leading-relaxed text-slate-500 font-semibold">
                  Adjusting these blocks changes your availability status inside the **IT Talent Marketplace**. Managers search this live index to find staffing resources.
                </div>
              </div>

            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-sm font-black text-[#0F1B3D] uppercase tracking-wider">My Certifications</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Credentials visible to hiring managers when they search the roster.
                </p>
              </div>
              <CertificationsGrid
                certifications={activeExpert.certifications}
                emptyMessage="No certifications added yet. Use Edit Profile to add credentials."
                size="md"
              />
            </div>
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

