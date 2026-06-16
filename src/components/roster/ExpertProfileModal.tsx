import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { getExpertById } from '../../data/itExperts';
import ExpertProfileContent from './ExpertProfileContent';

type ExpertProfileModalProps = {
  expertId: string | null;
  onClose: () => void;
};

export default function ExpertProfileModal({ expertId, onClose }: ExpertProfileModalProps) {
  const expert = expertId ? getExpertById(expertId) : null;

  useEffect(() => {
    if (!expertId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [expertId, onClose]);

  if (!expertId) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="expert-profile-modal-title"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-[#EEF5FC] shadow-[0_30px_90px_rgba(15,23,42,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          title="Close profile"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-md transition hover:bg-white hover:text-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5 md:px-8">
          {expert ? (
            <ExpertProfileContent expert={expert} />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <h2 id="expert-profile-modal-title" className="text-xl font-black text-[#0F1B3D]">Expert not found</h2>
              <p className="mt-2 text-sm text-slate-500">The requested expert profile could not be loaded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
