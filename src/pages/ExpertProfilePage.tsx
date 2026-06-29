import React from 'react';
import { useParams } from 'react-router-dom';
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF5FC] text-slate-800">
      <AppHeader />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <ExpertProfileContent expert={expert} />
      </div>
    </div>
  );
}
