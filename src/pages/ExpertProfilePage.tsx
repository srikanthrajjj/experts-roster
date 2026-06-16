import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppHeader from '../components/roster/AppHeader';
import ExpertProfileContent from '../components/roster/ExpertProfileContent';
import { getExpertById } from '../data/itExperts';

export default function ExpertProfilePage() {
  const { id } = useParams<{ id: string }>();
  const expert = getExpertById(id ?? '');

  if (!expert) {
    return (
      <div className="min-h-screen bg-[#EEF5FC]">
        <AppHeader />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h2 className="text-xl font-black text-[#0F1B3D]">Expert not found</h2>
          <Link to="/roster" className="mt-4 text-sm font-bold text-[#0072CE] hover:underline">Back to discovery</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF5FC] text-slate-800">
      <AppHeader />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <Link to="/roster" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#0072CE] hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to experts
        </Link>

        <ExpertProfileContent expert={expert} />
      </div>
    </div>
  );
}
