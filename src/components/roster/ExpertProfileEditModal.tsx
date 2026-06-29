import React, { useState } from 'react';
import { X, Award, Briefcase, Calendar, CheckCircle, Mail, MapPin, Plus, Trash2, User, Paperclip, Clock } from 'lucide-react';
import type { ITExpert } from '../../types/expert';
import Avatar from './SharedUI';
import { ExpertResourceBadges } from './LeafBadges';
import CertificationBadge, { CertificationThumbnail } from './CertificationBadge';
import { getCertificationName } from '../../lib/certificationLogos';

type ExpertProfileEditModalProps = {
  expert: ITExpert;
  onClose: () => void;
  onSave: (updatedExpert: ITExpert) => void;
};

const TABS = ['Profile', 'Skills & Interests', 'History', 'Certifications'] as const;

export default function ExpertProfileEditModal({ expert, onClose, onSave }: ExpertProfileEditModalProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Profile');

  // Form State
  const [name, setName] = useState(expert.name);
  const [role, setRole] = useState(expert.role);
  const [email, setEmail] = useState(expert.contact.email);
  const [phone, setPhone] = useState(expert.contact.phone || '');
  const [country, setCountry] = useState(expert.country);
  const [timezone, setTimezone] = useState(expert.timezone);
  const [team, setTeam] = useState(expert.team);
  const [bio, setBio] = useState(expert.bio);
  const [businessUnit, setBusinessUnit] = useState(expert.businessUnit || '');
  const [contractType, setContractType] = useState(expert.contractType || '');

  // Skills State
  const [skillsList, setSkillsList] = useState(expert.expertiseLevels || []);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Advanced');

  // History State
  const [missionsList, setMissionsList] = useState(expert.pastMissions || []);
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionOrg, setNewMissionOrg] = useState('');
  const [newMissionRole, setNewMissionRole] = useState('');
  const [newMissionTechnologies, setNewMissionTechnologies] = useState('');
  const [newMissionImpact, setNewMissionImpact] = useState('');
  const [newMissionRating, setNewMissionRating] = useState(5.0);
  const [newMissionCompletedDate, setNewMissionCompletedDate] = useState('');

  // Certifications State
  const [certificationsList, setCertificationsList] = useState(expert.certifications || []);
  const [newCertName, setNewCertName] = useState('');
  const [selectedCertFile, setSelectedCertFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    if (skillsList.some(s => s.skill.toLowerCase() === newSkillName.trim().toLowerCase())) return;
    
    setSkillsList([...skillsList, { skill: newSkillName.trim(), level: newSkillLevel }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkillsList(skillsList.filter(s => s.skill !== skillName));
  };

  const handleUpdateSkillLevel = (skillName: string, level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert') => {
    setSkillsList(skillsList.map(s => s.skill === skillName ? { ...s, level } : s));
  };

  const handleAddMission = () => {
    if (!newMissionTitle.trim() || !newMissionOrg.trim()) return;
    const newMission = {
      title: newMissionTitle.trim(),
      organization: newMissionOrg.trim(),
      role: newMissionRole.trim() || 'Consultant',
      technologies: newMissionTechnologies.split(',').map(s => s.trim()).filter(Boolean),
      impact: newMissionImpact.trim() || undefined,
      rating: newMissionRating,
      completedDate: newMissionCompletedDate.trim() || undefined,
    };
    setMissionsList([...missionsList, newMission]);
    setNewMissionTitle('');
    setNewMissionOrg('');
    setNewMissionRole('');
    setNewMissionTechnologies('');
    setNewMissionImpact('');
    setNewMissionCompletedDate('');
    setNewMissionRating(5.0);
  };

  const handleRemoveMission = (title: string) => {
    setMissionsList(missionsList.filter(m => m.title !== title));
  };

  const handleAddCert = () => {
    if (!newCertName.trim()) return;
    const exists = certificationsList.some(c => {
      const name = typeof c === 'string' ? c : c.name;
      return name.toLowerCase() === newCertName.trim().toLowerCase();
    });
    if (exists) return;

    const newCert = selectedCertFile
      ? { name: newCertName.trim(), attachmentName: selectedCertFile.name }
      : newCertName.trim();

    setCertificationsList([...certificationsList, newCert]);
    setNewCertName('');
    setSelectedCertFile(null);
  };

  const handleRemoveCert = (certName: string) => {
    setCertificationsList(certificationsList.filter(c => {
      const name = typeof c === 'string' ? c : c.name;
      return name !== certName;
    }));
  };

  const handleSave = () => {
    const isSkillsChanged = JSON.stringify(skillsList) !== JSON.stringify(expert.expertiseLevels);
    const updatedExpert: ITExpert = {
      ...expert,
      name,
      role,
      country,
      location: country,
      timezone,
      team,
      bio,
      businessUnit,
      contractType,
      contact: {
        ...expert.contact,
        email,
        phone,
      },
      expertiseLevels: skillsList,
      technologyStack: skillsList.map(s => s.skill),
      pastMissions: missionsList,
      certifications: certificationsList,
      skillsLastUpdated: isSkillsChanged
        ? `${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
        : expert.skillsLastUpdated,
    };
    onSave(updatedExpert);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ServiceNow-style Success Notification Toast */}
        {showSuccess && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[70] flex w-[380px] items-start gap-3 rounded border border-emerald-200 border-l-4 border-l-emerald-500 bg-white p-3.5 shadow-xl animate-fade-in">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Success</span>
              <p className="text-xs font-bold text-slate-700 mt-1">Profile details updated successfully.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="text-slate-400 hover:text-slate-600 transition cursor-pointer shrink-0"
              aria-label="Close alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Header Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-md transition hover:bg-white hover:text-slate-800 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Profile Card Header (Blue Theme) */}
        <div className="relative overflow-hidden bg-[#0066B3] px-6 py-8 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.15),transparent_40%)]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <Avatar expert={expert} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black">{name || 'Unnamed Expert'}</h1>
                  <ExpertResourceBadges expert={expert} size="md" variant="onDark" max={5} />
                </div>
                <p className="mt-1 text-lg font-bold text-sky-100">{role || 'No Role Assigned'}</p>
                <p className="mt-1 text-sm text-white/80">{team || 'No Organisation Assigned'}</p>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="ml-auto flex flex-wrap gap-8 border-l border-white/20 pl-8 hidden lg:flex">
              <div>
                <div className="text-2xl font-black">5.0</div>
                <div className="text-[10px] font-bold text-sky-100 uppercase tracking-widest mt-0.5">Rating Score</div>
              </div>
              <div>
                <div className="text-2xl font-black">{missionsList.length}</div>
                <div className="text-[10px] font-bold text-sky-100 uppercase tracking-widest mt-0.5">Missions Logged</div>
              </div>
              <div>
                <div className="text-2xl font-black">{certificationsList.length}</div>
                <div className="text-[10px] font-bold text-sky-100 uppercase tracking-widest mt-0.5">Certifications</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-4 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTab === tab ? 'border-[#0072CE] text-[#0072CE]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable Form Content */}
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* PROFILE TAB */}
          {activeTab === 'Profile' && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Card 1: Basic Information */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase text-[#172554]">
                  <User className="h-4 w-4 text-[#0072CE]" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Location / Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Timezone</label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Work & Organization Preferences */}
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase text-[#172554]">
                    <Briefcase className="h-4 w-4 text-[#0072CE]" />
                    Work & Organization
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Occupation / Role</label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Organisation / Team</label>
                      <input
                        type="text"
                        value={team}
                        onChange={(e) => setTeam(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Business Unit</label>
                      <input
                        type="text"
                        value={businessUnit}
                        onChange={(e) => setBusinessUnit(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Contract Type</label>
                      <input
                        type="text"
                        value={contractType}
                        onChange={(e) => setContractType(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Biography</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SKILLS & INTERESTS TAB */}
          {activeTab === 'Skills & Interests' && (
            <div className="space-y-6">
              {/* Add New Skill Form */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-black uppercase text-[#172554]">Add Technical Skill</h3>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Skill Name</label>
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g. Kubernetes, React, Python"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Proficiency Level</label>
                    <select
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
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
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#0072CE] px-5 text-sm font-bold text-white hover:bg-[#0055A6] cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add Skill
                  </button>
                </div>
              </div>

              {/* Skills List */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-2 border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black uppercase text-[#172554]">Current Technical Skills</h3>
                  {expert.skillsLastUpdated && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0072CE] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      <Clock className="w-3.5 h-3.5" />
                      Last updated: {expert.skillsLastUpdated}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {skillsList.map((item) => (
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
                  {skillsList.length === 0 && (
                    <p className="text-center py-6 text-sm text-slate-400 font-semibold">No skills listed. Add some above.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'History' && (
            <div className="space-y-6">
              {/* Add New Mission */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-black uppercase text-[#172554]">Add Past Mission / Project</h3>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Project Title *</label>
                      <input
                        type="text"
                        value={newMissionTitle}
                        onChange={(e) => setNewMissionTitle(e.target.value)}
                        placeholder="e.g. ERP System Migration"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Organization *</label>
                      <input
                        type="text"
                        value={newMissionOrg}
                        onChange={(e) => setNewMissionOrg(e.target.value)}
                        placeholder="e.g. UNICEF SA"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Role</label>
                      <input
                        type="text"
                        value={newMissionRole}
                        onChange={(e) => setNewMissionRole(e.target.value)}
                        placeholder="e.g. Cloud Lead Architect"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Technologies (comma separated)</label>
                      <input
                        type="text"
                        value={newMissionTechnologies}
                        onChange={(e) => setNewMissionTechnologies(e.target.value)}
                        placeholder="e.g. Azure, DevOps, Terraform"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Impact Description</label>
                      <input
                        type="text"
                        value={newMissionImpact}
                        onChange={(e) => setNewMissionImpact(e.target.value)}
                        placeholder="e.g. Reduced program delivery delay by 25%"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Completed Date</label>
                      <input
                        type="text"
                        value={newMissionCompletedDate}
                        onChange={(e) => setNewMissionCompletedDate(e.target.value)}
                        placeholder="e.g. Jan 2025"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Rating</label>
                      <select
                        value={newMissionRating}
                        onChange={(e) => setNewMissionRating(parseFloat(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                      >
                        <option value="5.0">5.0</option>
                        <option value="4.9">4.9</option>
                        <option value="4.8">4.8</option>
                        <option value="4.7">4.7</option>
                        <option value="4.6">4.6</option>
                        <option value="4.5">4.5</option>
                        <option value="4.4">4.4</option>
                        <option value="4.3">4.3</option>
                        <option value="4.2">4.2</option>
                        <option value="4.1">4.1</option>
                        <option value="4.0">4.0</option>
                        <option value="3.5">3.5</option>
                        <option value="3.0">3.0</option>
                        <option value="2.0">2.0</option>
                        <option value="1.0">1.0</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddMission}
                      className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#0072CE] px-5 text-sm font-bold text-white hover:bg-[#0055A6] cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add Mission
                    </button>
                  </div>
                </div>
              </div>

              {/* Missions List */}
              <div className="space-y-4">
                {missionsList.map((m) => (
                  <div key={m.title} className="flex justify-between items-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black text-[#0F1B3D]">{m.title}</h3>
                        {m.rating && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-600 border border-amber-100">
                            ★ {m.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span>{m.organization}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 font-bold">{m.role}</span>
                        {m.completedDate && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-400 font-medium bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/50 text-[10px]">Completed {m.completedDate}</span>
                          </>
                        )}
                      </p>
                      {m.technologies && m.technologies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {m.technologies.map((t) => (
                            <span key={t} className="px-2 py-0.5 text-xs font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">{t}</span>
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
                    <button
                      type="button"
                      onClick={() => handleRemoveMission(m.title)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors ml-4 cursor-pointer"
                      title="Remove mission"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {missionsList.length === 0 && (
                  <p className="text-center py-12 text-sm text-slate-400 border border-slate-200 border-dashed rounded-xl bg-white font-semibold">No past missions logged.</p>
                )}
              </div>
            </div>
          )}

          {/* CERTIFICATIONS TAB */}
          {activeTab === 'Certifications' && (
            <div className="space-y-6">
              {/* Add New Cert */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-black uppercase text-[#172554]">Add Certification</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Certification Title *</label>
                      <input
                        type="text"
                        value={newCertName}
                        onChange={(e) => setNewCertName(e.target.value)}
                        placeholder="e.g. AWS Certified Solutions Architect, ITIL v4"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0072CE] focus:ring-1 focus:ring-[#0072CE] focus:outline-none"
                      />
                    </div>
                    
                    <div className="w-full md:w-80">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Attachment (optional)</label>
                      <div className="relative flex h-9 items-center justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50/50 px-3 hover:bg-slate-50 transition">
                        <span className="truncate text-xs font-semibold text-slate-500">
                          {selectedCertFile ? selectedCertFile.name : 'No file selected'}
                        </span>
                        <label className="cursor-pointer rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-800 hover:border-slate-300 transition shadow-sm ml-2">
                          Browse
                          <input
                            type="file"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setSelectedCertFile(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        {selectedCertFile && (
                          <button
                            type="button"
                            onClick={() => setSelectedCertFile(null)}
                            className="text-red-500 hover:text-red-700 font-bold text-[10px] ml-1.5 cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddCert}
                      className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#0072CE] px-5 text-sm font-bold text-white hover:bg-[#0055A6] cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add Certificate
                    </button>
                  </div>
                </div>
              </div>

              {/* Certifications List */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-black uppercase text-[#172554]">Active Certifications</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {certificationsList.map((cert) => (
                    <div key={getCertificationName(cert)} className="relative">
                      <CertificationBadge certification={cert} size="md" />
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(getCertificationName(cert))}
                        className="absolute right-2 top-2 rounded-md p-1 text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                        title="Remove certification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {certificationsList.length === 0 && (
                    <p className="text-center py-6 text-sm text-slate-400 font-semibold col-span-2">No certifications listed.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex h-10 items-center justify-center rounded-lg bg-[#0072CE] px-5 text-sm font-bold text-white hover:bg-[#0055A6] transition cursor-pointer shadow-sm"
          >
            Save Profile Details
          </button>
        </div>

      </div>
    </div>
  );
}
