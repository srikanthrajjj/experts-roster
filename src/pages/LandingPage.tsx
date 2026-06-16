import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Book, 
  Users, 
  ClipboardCheck, 
  ArrowRight,
  PlusCircle,
  Clock,
  MessageSquare,
  Download,
  FileText,
  GanttChart,
  BarChart3,
} from 'lucide-react';
import { SUGGESTED_SEARCHES } from '../data/constants';
import { rosterPlanningPath } from '../lib/rosterView';
import UnicefLogo from '../components/roster/UnicefLogo';

export default function LandingPage() {
  const [heroSearch, setHeroSearch] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-[#0091F9] text-white flex items-center justify-between px-6 py-3 shrink-0 relative z-30">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center hover:opacity-90">
            <UnicefLogo className="h-8" />
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium items-center relative">
            <Link
              to="/roster/planning"
              className="text-white hover:text-white/80 font-semibold"
            >
              Resource availability & planning
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
            <input 
              type="text" 
              placeholder="Search portal..." 
              className="pl-9 pr-4 py-1.5 rounded-full bg-white/20 border border-transparent focus:bg-white text-sm focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 w-64 transition-all placeholder:text-white/70 focus:placeholder:text-gray-400" 
            />
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-semibold text-sm cursor-pointer hover:bg-white/30 transition-colors">
            A
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003366] to-[#0052A3] py-20 px-6 relative overflow-hidden flex flex-col items-center text-center">
        {/* Decorative subtle background overlay if needed... */}
        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
          <span className="border border-white/30 text-white/90 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded mb-8">
            IT & Technology Talent Marketplace
          </span>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
            Welcome to the <span className="text-[#66C2FF]">TAHub!</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mb-8 leading-relaxed">
            Discover, evaluate, and engage technical experts across UNICEF. Plan resources, track availability, and request assignments.
          </p>

          <div className="w-full max-w-2xl relative flex items-center group mb-4">
            <Search className="w-5 h-5 absolute left-5 text-gray-400 group-focus-within:text-[#0099FF] transition-colors" />
            <input 
              type="text"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="Search by name, technology, skill, certification..."
              className="w-full pl-14 pr-32 py-4 rounded-full bg-white/10 border border-white/20 text-white focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all placeholder:text-white/60"
            />
            <Link
              to={heroSearch ? rosterPlanningPath('list', { search: heroSearch }) : rosterPlanningPath('list')}
              className="absolute right-2 px-8 py-2.5 bg-white text-[#0052A3] hover:text-[#003366] font-bold rounded-full transition-colors"
            >
              Search
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
            {SUGGESTED_SEARCHES.map((term) => (
              <Link
                key={term}
                to={rosterPlanningPath('list', { search: term })}
                className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold text-white/90 hover:bg-white/20"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-6 py-12 flex flex-col lg:flex-row gap-10">
        
        {/* Left Column - Main Services */}
        <div className="flex-1">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold text-gray-900">Our Digital Services</h2>
             <a href="#" className="text-[#0099FF] font-semibold hover:underline">Explore all</a>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
             
             {/* Card 1 */}
             <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0099FF] flex items-center justify-center mb-6">
                  <Book className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Knowledge Core</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Access curated technical guidelines, policy documents, and peer-reviewed resources to support programme design and delivery.
                </p>
             </div>

             {/* Card 2 - Blue Focus Card */}
             <div className="bg-[#0066CC] border border-[#0052A3] rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center mb-6 backdrop-blur-sm">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">IT Talent Marketplace</h3>
                <p className="text-sm text-blue-100 leading-relaxed mb-6 flex-1">
                  Discover and engage IT & technology experts. View profiles, check availability, and request assignments.
                </p>
                <Link to={rosterPlanningPath('list')} className="text-white font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                  Discover Experts <ArrowRight className="w-4 h-4" />
                </Link>
             </div>

             {/* Card - Resource Planning */}
             <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow md:col-span-1">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0099FF] flex items-center justify-center mb-6">
                  <GanttChart className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Resource Planning</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  Gantt-based allocation timeline, capacity overview, and weekly availability calendar for IT experts.
                </p>
                <Link to={rosterPlanningPath('gantt')} className="text-[#0099FF] font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                  Open Planning View <ArrowRight className="w-4 h-4" />
                </Link>
             </div>

             {/* Card - Manager Dashboard */}
             <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow md:col-span-1">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0099FF] flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Manager Dashboard</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  KPIs for staffing gaps, overallocated resources, high-demand skills, and bench availability.
                </p>
                <Link to="/roster/manager" className="text-[#0099FF] font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                  View Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
             </div>

             {/* Card 3 */}
             <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0099FF] flex items-center justify-center mb-6">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">TA Requests</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Submit and track Technical Assistance requests, monitor progress, and coordinate with programme teams.
                </p>
             </div>

           </div>

           {/* Featured Resources */}
           <div className="mb-6">
             <h2 className="text-2xl font-bold text-gray-900">Featured Resources</h2>
           </div>
           
           <div className="space-y-4">
             {/* Resource Item */}
             <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row gap-5 hover:border-gray-300 transition-colors cursor-pointer group">
               <div className="w-full sm:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
                 {/* Placeholder for image */}
                 <img src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=600" alt="City" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               </div>
               <div className="flex-1 flex flex-col">
                 <div className="flex justify-between items-start mb-2">
                   <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0099FF] transition-colors">2024 Urban Resilience Global Assessment</h3>
                   <span className="text-xs font-semibold text-gray-500 px-2.5 py-1 border border-gray-200 rounded bg-gray-50 shrink-0">PDF &middot; 12MB</span>
                 </div>
                 <p className="text-sm text-gray-600 mb-4 flex-1">
                   A comprehensive study of over 150 cities and their adaptation to rising sea levels.
                 </p>
                 <div className="flex items-center gap-4 text-sm font-semibold text-[#0099FF]">
                    <span className="flex items-center gap-1 hover:underline"><Download className="w-4 h-4" /> Download</span>
                    <span className="flex items-center gap-1 hover:underline text-gray-500"><FileText className="w-4 h-4" /> Quick View</span>
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* Right Column - Quick Actions */}
        <aside className="w-full lg:w-80 shrink-0 space-y-8">
          
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <button className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white px-5 py-3.5 rounded-xl font-bold flex items-center justify-between transition-colors shadow-sm">
                <span className="flex items-center gap-3"><PlusCircle className="w-5 h-5" /> New Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button className="w-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 px-5 py-3.5 rounded-xl font-semibold flex items-center gap-3 transition-all">
                <Clock className="w-5 h-5 text-[#0099FF]" /> Request Support
              </button>
              
              <button className="w-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 px-5 py-3.5 rounded-xl font-semibold flex items-center gap-3 transition-all">
                <MessageSquare className="w-5 h-5 text-[#0099FF]" /> Contact Technical Advisor
              </button>
            </div>
          </div>

          <div>
             <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">Active Requests</h4>
                <span className="bg-[#0099FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">3 TOTAL</span>
             </div>
             
             <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 shadow-sm">
               
               {/* Item 1 */}
               <div className="p-4 hover:bg-blue-50/50 transition-colors cursor-pointer block">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold text-[#0099FF] uppercase tracking-wider">Urban Planning</span>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">IN REVIEW</span>
                  </div>
                  <h5 className="text-sm font-bold text-gray-900 mb-1">Coastal Flood Barrier Design Review</h5>
                  <p className="text-xs text-gray-400">Ref: RTA-4922 &middot; 2 days ago</p>
               </div>

                {/* Item 2 */}
               <div className="p-4 hover:bg-blue-50/50 transition-colors cursor-pointer block">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold text-[#0099FF] uppercase tracking-wider">Nutrition</span>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">IN REVIEW</span>
                  </div>
                  <h5 className="text-sm font-bold text-gray-900 mb-1">Regional School Lunch Policy Audit</h5>
                  <p className="text-xs text-gray-400">Ref: RTA-4910 &middot; 5 days ago</p>
               </div>

             </div>
          </div>
          
        </aside>

      </main>
    </div>
  );
}
