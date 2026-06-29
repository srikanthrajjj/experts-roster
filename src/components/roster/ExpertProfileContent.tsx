import React, { useState } from 'react';
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Download,
  Mail,
  MapPin,
  Star,
  Edit2,
  Plus,
  Trash2,
  Check,
  X,
  Clock,
} from 'lucide-react';
import type { ITExpert } from '../../types/expert';
import { MOCK_IT_EXPERTS } from '../../data/itExperts';
import Avatar, { Badge, StatusBadge } from './SharedUI';
import { ExpertResourceBadges } from './LeafBadges';
import SendEmailModal from './SendEmailModal';
import MonthlyCalendarView from './MonthlyCalendarView';
import { CertificationsGrid, CertificationThumbnail } from './CertificationBadge';
import { cn } from '../../lib/utils';

const SECTIONS = ['Overview', 'Technical Skills', 'Experience', 'Availability'] as const;

type textType = string;

type ExpertProfileContentProps = {
  expert: ITExpert;
  isModal?: boolean;
};

export default function ExpertProfileContent({ expert, isModal = false }: ExpertProfileContentProps) {
  const [activeSection, setActiveSection] = useState<(typeof SECTIONS)[number]>('Overview');
  const [showEmail, setShowEmail] = useState(false);

  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Advanced');

  const userRole = localStorage.getItem('userRole');
  const isOwnProfile = userRole === 'expert' && expert.id === '1';

  const saveSkills = (updatedSkills: typeof expert.expertiseLevels) => {
    const saved = localStorage.getItem('expert_dashboard_data');
    const list: ITExpert[] = saved ? JSON.parse(saved) : MOCK_IT_EXPERTS;
    const updatedList = list.map(e => {
      if (e.id === expert.id) {
        return {
          ...e,
          expertiseLevels: updatedSkills,
          technologyStack: updatedSkills.map(s => s.skill),
          skillsLastUpdated: `${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
        };
      }
      return e;
    });
    localStorage.setItem('expert_dashboard_data', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateSkillLevel = (skillName: string, level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert') => {
    const updatedSkills = expert.expertiseLevels.map(s => s.skill === skillName ? { ...s, level } : s);
    saveSkills(updatedSkills);
  };

  const handleRemoveSkill = (skillName: string) => {
    const updatedSkills = expert.expertiseLevels.filter(s => s.skill !== skillName);
    saveSkills(updatedSkills);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    if (expert.expertiseLevels.some(s => s.skill.toLowerCase() === newSkillName.trim().toLowerCase())) return;

    const updatedSkills = [
      ...expert.expertiseLevels,
      { skill: newSkillName.trim(), level: newSkillLevel }
    ];
    saveSkills(updatedSkills);
    setNewSkillName('');
  };

  return (
    <>
      <div className={cn(
        "bg-white",
        isModal
          ? "rounded-none border-none shadow-none"
          : "rounded-2xl border border-slate-200 shadow-[0_22px_65px_rgba(15,23,42,0.08)]"
      )}>
        <div className="relative overflow-hidden rounded-t-2xl bg-[#0066B3] px-5 py-5 pr-14 text-white sm:px-6 sm:py-6 md:pr-16">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.20),transparent_35%,rgba(4,120,87,0.22))]" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 gap-4">
              <Avatar expert={expert} size="lg" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black">{expert.name}</h1>
                  <ExpertResourceBadges expert={expert} size="md" variant="onDark" max={5} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-black text-yellow-300">
                    <Star className="h-4 w-4 fill-current" />
                    {expert.trustRating} ({expert.reviewsCount} reviews)
                  </span>
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
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-black uppercase text-[#172554]">Skills Matrix</h2>
                      {isOwnProfile && (
                        <button
                          type="button"
                          onClick={() => setIsEditingSkills(!isEditingSkills)}
                          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-black rounded-lg border transition-all cursor-pointer ${
                            isEditingSkills
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-blue-50 border-blue-100 text-[#0072CE] hover:bg-blue-100'
                          }`}
                        >
                          {isEditingSkills ? (
                            <>
                              <Check className="w-3 h-3" /> Done Editing
                            </>
                          ) : (
                            <>
                              <Edit2 className="w-3 h-3" /> Quick Edit
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {expert.skillsLastUpdated && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0072CE] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        <Clock className="w-3.5 h-3.5" />
                        Last updated: {expert.skillsLastUpdated}
                      </span>
                    )}
                  </div>

                  {isEditingSkills ? (
                    <div className="space-y-4">
                      {/* Skills List */}
                      <div className="space-y-3">
                        {expert.expertiseLevels.map((item) => (
                          <div key={item.skill} className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 flex-1 items-center gap-3 pr-4">
                              <CertificationThumbnail name={item.skill} size="sm" title={item.skill} showFallback={false} />
                              <div className="min-w-0 flex-1">
                              <div className="flex justify-between mb-1.5">
                                <span className="text-sm font-black text-slate-800">{item.skill}</span>
                                <span className="text-xs font-black text-[#0072CE]">{item.level}</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-white border border-slate-100">
                                <div
                                  className="h-full rounded-full bg-[#0072CE] transition-all duration-300"
                                  style={{
                                    width: item.level === 'Expert' ? '100%' : item.level === 'Advanced' ? '75%' : item.level === 'Intermediate' ? '50%' : '25%'
                                  }}
                                />
                              </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <div className="flex rounded-lg bg-white p-0.5 border border-slate-200 shadow-sm">
                                {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map((lvl) => {
                                  const isSelected = item.level === lvl;
                                  return (
                                    <button
                                      key={lvl}
                                      type="button"
                                      onClick={() => handleUpdateSkillLevel(item.skill, lvl)}
                                      className={`px-2 py-1 text-[10px] font-black rounded transition-all cursor-pointer ${
                                        isSelected
                                          ? "bg-[#0072CE] text-white shadow-sm font-extrabold"
                                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                                      }`}
                                    >
                                      {lvl}
                                    </button>
                                  );
                                })}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(item.skill)}
                                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                                title="Remove skill"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {expert.expertiseLevels.length === 0 && (
                          <p className="text-center py-6 text-sm text-slate-400 font-semibold">No skills listed. Add some below.</p>
                        )}
                      </div>

                      {/* Add New Skill Form Inline */}
                      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-xs font-black uppercase text-[#172554]">Add Technical Skill</h3>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Skill Name</label>
                            <input
                              type="text"
                              value={newSkillName}
                              onChange={(e) => setNewSkillName(e.target.value)}
                              placeholder="e.g. Kubernetes, React, Python"
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                            />
                          </div>
                          <div className="w-full sm:w-48">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Proficiency Level</label>
                            <select
                              value={newSkillLevel}
                              onChange={(e) => setNewSkillLevel(e.target.value as any)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                              <option value="Expert">Expert</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddSkill}
                            className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#0072CE] px-4 text-xs font-bold text-white hover:bg-[#0055A6] cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {expert.expertiseLevels.map((item) => (
                        <div key={item.skill} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                          <div className="mb-2 flex items-center gap-3">
                            <CertificationThumbnail name={item.skill} size="sm" title={item.skill} showFallback={false} />
                            <div className="min-w-0 flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-black text-slate-800">{item.skill}</span>
                            <span className="text-xs font-black text-[#0072CE]">{item.level}</span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white border border-slate-100">
                            <div 
                              className="h-full rounded-full bg-[#0072CE] transition-all duration-300" 
                              style={{
                                width: item.level === 'Expert' ? '100%' : item.level === 'Advanced' ? '75%' : item.level === 'Intermediate' ? '50%' : '25%'
                              }}
                            />
                          </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {expert.expertiseLevels.length === 0 && (
                        <p className="text-center py-6 text-sm text-slate-400 font-semibold">No skills listed.</p>
                      )}
                    </div>
                  )}
                </section>
                <section>
                  <h2 className="mb-4 text-sm font-black uppercase text-[#172554]">Certifications</h2>
                  <CertificationsGrid certifications={expert.certifications} size="lg" />
                </section>
              </div>
            )}

            {activeSection === 'Experience' && (
              <div className="space-y-8 animate-fade-in">
                {/* Platform Capabilities Highlights */}
                {expert.specialCapabilities && expert.specialCapabilities.length > 0 && (
                  <section className="pb-2">
                    <h3 className="mb-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Core Platform & Project Capabilities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {expert.specialCapabilities.map((cap) => (
                        <span
                          key={cap}
                          className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200/50 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Project History Timeline */}
                <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-8">
                  {expert.pastMissions.map((m) => (
                    <div key={m.title} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-[#0072CE] transition-all group-hover:bg-[#0072CE] group-hover:scale-110">
                        <span className="h-1 w-1 rounded-full bg-[#0072CE] transition-all group-hover:bg-white" />
                      </span>

                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-black text-[#0F1B3D] tracking-tight">{m.title}</h3>
                            {m.rating && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-600 border border-amber-100">
                                ★ {m.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
                            <span>{m.organization}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-500 font-bold">{m.role}</span>
                            {m.completedDate && (
                              <>
                                <span className="text-slate-300">·</span>
                                <span className="inline-flex items-center gap-1 text-[#0072CE] font-black bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 text-[10px]">
                                  <Calendar className="w-3 h-3" />
                                  Completed {m.completedDate}
                                </span>
                              </>
                            )}
                          </p>
                          
                          {/* Business impact - styled cleanly with a left accent border rather than a full box */}
                          {m.impact && (
                            <div className="mt-3 border-l-2 border-emerald-500 pl-3 py-0.5 max-w-xl">
                              <span className="block text-[9px] uppercase tracking-wider text-emerald-600 font-black mb-0.5">Impact delivered</span>
                              <p className="text-xs font-semibold text-emerald-800 leading-relaxed">
                                {m.impact}
                              </p>
                            </div>
                          )}

                          {m.technologies && m.technologies.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {m.technologies.map((t) => (
                                <Badge key={t} className="border-sky-100 bg-sky-50 text-sky-700 text-[10px] px-2 py-0.5 font-bold">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {expert.pastMissions.length === 0 && (
                    <div className="text-center py-8 text-sm text-slate-400 font-semibold bg-white border border-slate-200 border-dashed rounded-xl">
                      No project history logged.
                    </div>
                  )}
                </div>
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
                <div className="mb-4">
                  <h3 className="text-sm font-black uppercase text-[#172554]">Availability calendar</h3>
                </div>
                <MonthlyCalendarView expert={expert} />
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
