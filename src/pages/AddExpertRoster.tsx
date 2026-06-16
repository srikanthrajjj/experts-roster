import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Upload, FileSpreadsheet, User, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import UnicefLogo from '../components/roster/UnicefLogo';
import { cn } from '../lib/utils';

const SKILLS = ['WASH','Programme Scale-up Management','Humanitarian Action','Health','Programme Design','Digital Infrastructure','Early Childhood Development','Policy Reform','Child Protection','Social & Behaviour Change','Financing for Scale','Education'];
const REGIONS = ['East & Southern Africa','South Asia','East Asia & Pacific','West & Central Africa','Middle East & North Africa','Latin America & Caribbean','Eastern Europe & Central Asia'];
const LANGUAGES = ['English','French','Spanish','Arabic','Swahili','German','Bemba','Hausa','Sinhala','Portuguese','Russian','Chinese'];
const COUNTRIES = ["Cote d'Ivoire",'Ethiopia','Canada','Pakistan','Uganda','Nigeria','Kenya','Senegal','South Africa','India','Bangladesh','Brazil','France','UK','USA','Germany','Japan','Australia'];
const FEE_RANGES = ['$300-400','$401-500','$500-600','$601-700','$701-800','$800+'];
const AVAILABILITY = ['Immediate','1-3 months','3-6 months','Unavailable'];
const DURATIONS = ['Flexible','Short-term','Emergency Deployments','Long-term only'];

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '',
  country: '', title: '', yearsExperience: '',
  skills: [] as string[], languages: [] as string[], regions: [] as string[],
  dailyFee: '', availability: '', duration: '',
  emergencyExperience: false, previousUnicef: false,
  summary: '',
};

export default function AddExpertRoster() {
  const [tab, setTab] = useState<'manual' | 'excel'>('manual');
  const [form, setForm] = useState(emptyForm);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showRosterDropdown, setShowRosterDropdown] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggle = (field: 'skills' | 'languages' | 'regions', val: string) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(v => v !== val) : [...f[field], val],
    }));
  };

  const handleFile = (file: File) => {
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      setUploadedFile(file);
    }
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleSubmitUpload = () => {
    if (uploadedFile) setUploadSuccess(true);
  };

  return (
    <div className="h-screen flex flex-col bg-[#F3F4F6] font-sans text-gray-800 overflow-hidden">
      {/* Header */}
      <header className="bg-[#0091F9] text-white flex items-center justify-between px-6 py-3 shrink-0 relative z-30">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center hover:opacity-90">
            <UnicefLogo className="h-8" />
          </Link>
          <nav className="flex gap-6 text-sm font-medium items-center relative">
            <div className="relative">
              <button
                onClick={() => setShowRosterDropdown(!showRosterDropdown)}
                className="bg-white text-[#0091F9] px-4 py-1.5 rounded-full flex items-center gap-1 shadow-sm font-semibold hover:bg-gray-50"
              >
                Experts Roster <ChevronDown className="w-4 h-4" />
              </button>
              {showRosterDropdown && (
                <div className="absolute top-10 left-0 bg-white shadow-lg rounded-md border border-gray-200 overflow-hidden text-gray-800 w-48 py-1 z-50">
                  <Link to="/roster" className="block px-4 py-2 hover:bg-gray-50 text-sm font-medium" onClick={() => setShowRosterDropdown(false)}>Find Expert Roster</Link>
                  <Link to="/roster/add" className="block px-4 py-2 hover:bg-gray-50 text-sm font-medium text-[#0091F9]" onClick={() => setShowRosterDropdown(false)}>Add Expert Roster</Link>
                </div>
              )}
            </div>
          </nav>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-semibold text-sm">A</div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link to="/roster" className="hover:text-[#0099FF]">Expert Roster</Link>
              <span>/</span>
              <span className="text-gray-800 font-medium">Add Expert</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Add Expert to Roster</h1>
            <p className="text-gray-500 mt-1">Upload an Excel file or fill in the form manually to add a new expert.</p>
          </div>

          {/* Tab Toggle */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit mb-8 shadow-sm">
            <button
              onClick={() => setTab('manual')}
              className={cn('flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all', tab === 'manual' ? 'bg-[#0099FF] text-white shadow' : 'text-gray-500 hover:text-gray-800')}
            >
              <User className="w-4 h-4" /> Manual Entry
            </button>
            <button
              onClick={() => setTab('excel')}
              className={cn('flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all', tab === 'excel' ? 'bg-[#0099FF] text-white shadow' : 'text-gray-500 hover:text-gray-800')}
            >
              <FileSpreadsheet className="w-4 h-4" /> Upload Excel
            </button>
          </div>

          {/* ── EXCEL UPLOAD TAB ── */}
          {tab === 'excel' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              {uploadSuccess ? (
                <div className="flex flex-col items-center py-12 gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Upload Successful!</h2>
                  <p className="text-gray-500 text-center max-w-sm">
                    <strong>{uploadedFile?.name}</strong> has been processed. Experts will appear in the roster shortly.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => { setUploadedFile(null); setUploadSuccess(false); }} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Upload Another</button>
                    <Link to="/roster" className="px-5 py-2.5 bg-[#0099FF] text-white rounded-lg text-sm font-semibold hover:bg-[#0088EE]">View Roster</Link>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Upload Excel File</h2>
                  <p className="text-sm text-gray-500 mb-6">Accepted formats: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.xlsx</code> <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.xls</code> <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.csv</code></p>

                  {/* Drop Zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all',
                      dragOver ? 'border-[#0099FF] bg-blue-50' : 'border-gray-300 hover:border-[#0099FF] hover:bg-gray-50'
                    )}
                  >
                    <div className={cn('w-16 h-16 rounded-full flex items-center justify-center transition-colors', dragOver ? 'bg-[#0099FF]/10' : 'bg-gray-100')}>
                      <Upload className={cn('w-7 h-7', dragOver ? 'text-[#0099FF]' : 'text-gray-400')} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-700">Drag & drop your file here</p>
                      <p className="text-sm text-gray-400 mt-1">or <span className="text-[#0099FF] font-medium">browse to upload</span></p>
                    </div>
                    <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                  </div>

                  {/* Uploaded file preview */}
                  {uploadedFile && (
                    <div className="mt-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button onClick={() => setUploadedFile(null)} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  )}

                  {/* Template download hint */}
                  <div className="mt-6 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-[#0099FF] mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-600">
                      Make sure your file follows the required format.{' '}
                      <button className="text-[#0099FF] font-medium hover:underline">Download template</button>
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <Link to="/roster" className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</Link>
                    <button
                      onClick={handleSubmitUpload}
                      disabled={!uploadedFile}
                      className="px-6 py-2.5 bg-[#0099FF] text-white rounded-lg text-sm font-semibold hover:bg-[#0088EE] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      <Upload className="w-4 h-4" /> Process File
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── MANUAL ENTRY TAB ── */}
          {tab === 'manual' && (
            <>
              {submitted ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col items-center py-16 gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Expert Added Successfully!</h2>
                  <p className="text-gray-500 text-center max-w-sm">
                    <strong>{form.firstName} {form.lastName}</strong> has been added to the expert roster.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => { setForm(emptyForm); setSubmitted(false); }} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Add Another</button>
                    <Link to="/roster" className="px-5 py-2.5 bg-[#0099FF] text-white rounded-lg text-sm font-semibold hover:bg-[#0088EE]">View Roster</Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitManual} className="space-y-6">

                  {/* Personal Info */}
                  <Section title="Personal Information" icon="👤">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="First Name" required>
                        <input required value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} placeholder="e.g. Ana" className={inputCls} />
                      </Field>
                      <Field label="Last Name" required>
                        <input required value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} placeholder="e.g. Lopez" className={inputCls} />
                      </Field>
                      <Field label="Email" required>
                        <input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="name@example.com" className={inputCls} />
                      </Field>
                      <Field label="Phone">
                        <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+1 234 5678" className={inputCls} />
                      </Field>
                      <Field label="Country" required>
                        <select required value={form.country} onChange={e => setForm(f => ({...f, country: e.target.value}))} className={inputCls}>
                          <option value="">Select country</option>
                          {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </Field>
                      <Field label="Professional Title" required>
                        <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. WASH Specialist" className={inputCls} />
                      </Field>
                      <Field label="Years of Experience" required>
                        <input required type="number" min="0" max="60" value={form.yearsExperience} onChange={e => setForm(f => ({...f, yearsExperience: e.target.value}))} placeholder="e.g. 10" className={inputCls} />
                      </Field>
                    </div>
                    <Field label="Professional Summary">
                      <textarea rows={3} value={form.summary} onChange={e => setForm(f => ({...f, summary: e.target.value}))} placeholder="Brief professional background and key achievements..." className={`${inputCls} resize-none`} />
                    </Field>
                  </Section>

                  {/* Expertise */}
                  <Section title="Areas of Expertise" icon="🎯">
                    <p className="text-xs text-gray-500 mb-3">Select all that apply</p>
                    <div className="flex flex-wrap gap-2">
                      {SKILLS.map(s => (
                        <button type="button" key={s} onClick={() => toggle('skills', s)}
                          className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all', form.skills.includes(s) ? 'bg-[#0099FF] text-white border-[#0099FF]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#0099FF] hover:text-[#0099FF]')}>
                          {form.skills.includes(s) && <span className="mr-1">✓</span>}{s}
                        </button>
                      ))}
                    </div>
                  </Section>

                  {/* Languages & Regions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Section title="Languages" icon="🌐">
                      <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map(l => (
                          <button type="button" key={l} onClick={() => toggle('languages', l)}
                            className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all', form.languages.includes(l) ? 'bg-[#0099FF] text-white border-[#0099FF]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#0099FF] hover:text-[#0099FF]')}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </Section>
                    <Section title="Regional Experience" icon="📍">
                      <div className="flex flex-wrap gap-2">
                        {REGIONS.map(r => (
                          <button type="button" key={r} onClick={() => toggle('regions', r)}
                            className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all', form.regions.includes(r) ? 'bg-[#0099FF] text-white border-[#0099FF]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#0099FF] hover:text-[#0099FF]')}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </Section>
                  </div>

                  {/* Working Arrangements */}
                  <Section title="Working Arrangements" icon="💼">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="Daily Fee Range">
                        <select value={form.dailyFee} onChange={e => setForm(f => ({...f, dailyFee: e.target.value}))} className={inputCls}>
                          <option value="">Select range</option>
                          {FEE_RANGES.map(r => <option key={r}>{r}</option>)}
                        </select>
                      </Field>
                      <Field label="Availability">
                        <select value={form.availability} onChange={e => setForm(f => ({...f, availability: e.target.value}))} className={inputCls}>
                          <option value="">Select</option>
                          {AVAILABILITY.map(a => <option key={a}>{a}</option>)}
                        </select>
                      </Field>
                      <Field label="Assignment Duration">
                        <select value={form.duration} onChange={e => setForm(f => ({...f, duration: e.target.value}))} className={inputCls}>
                          <option value="">Select</option>
                          {DURATIONS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div className="flex gap-6 mt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.emergencyExperience} onChange={e => setForm(f => ({...f, emergencyExperience: e.target.checked}))} className="w-4 h-4 rounded text-[#0099FF] border-gray-300 focus:ring-[#0099FF]" />
                        <span className="text-sm font-medium text-gray-700">Emergency Experience</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.previousUnicef} onChange={e => setForm(f => ({...f, previousUnicef: e.target.checked}))} className="w-4 h-4 rounded text-[#0099FF] border-gray-300 focus:ring-[#0099FF]" />
                        <span className="text-sm font-medium text-gray-700">Previous UNICEF Experience</span>
                      </label>
                    </div>
                  </Section>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pb-8">
                    <Link to="/roster" className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</Link>
                    <button type="submit" className="px-6 py-2.5 bg-[#0099FF] text-white rounded-lg text-sm font-semibold hover:bg-[#0088EE] flex items-center gap-2 transition-colors shadow">
                      <Plus className="w-4 h-4" /> Add to Roster
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──
const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0099FF] focus:border-transparent transition-all';

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-700 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
