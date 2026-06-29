import React, { useState, useEffect } from 'react';
import { getRoleDotClass, getRoleLabel, isExpertRole } from '../../lib/userRole';
import { usePersonaModal } from '../../contexts/PersonaModalContext';

export default function AppHeader() {
  const { userRole, openPersonaModal } = usePersonaModal();
  const [initials, setInitials] = useState('A');

  useEffect(() => {
    const handleStorageChange = () => {
      const role = localStorage.getItem('userRole');

      if (isExpertRole(role)) {
        const saved = localStorage.getItem('expert_dashboard_data');
        const list = saved ? JSON.parse(saved) : null;
        const expert = list?.find((e: any) => e.id === '1');
        if (expert?.initials) {
          setInitials(expert.initials);
        } else {
          setInitials('AG');
        }
      } else {
        setInitials('A');
      }
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 h-[66px] bg-[#0091F9] text-white shadow-[0_14px_30px_rgba(0,145,249,0.18)]">
      <div className="flex h-full items-center justify-between gap-5 px-5 xl:px-8">
        <div className="flex h-full min-w-0 items-center">
          <span className="text-sm font-bold text-white lg:text-base">
            Resource availability & planning
          </span>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-4">
          <button
            type="button"
            onClick={openPersonaModal}
            title="Change role perspective"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer shadow-sm animate-fade-in"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${getRoleDotClass(userRole)}`}></span>
            Role: {userRole ? getRoleLabel(userRole) : 'Select'}
          </button>
          <button
            onClick={() => {
              if (isExpertRole(userRole)) {
                window.dispatchEvent(new Event('open-profile-edit'));
              }
            }}
            title={isExpertRole(userRole) ? "View/Edit Profile" : undefined}
            disabled={!isExpertRole(userRole)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-sm font-black shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-white/50 ${
              isExpertRole(userRole)
                ? 'cursor-pointer hover:bg-white/20 hover:border-white/50'
                : 'cursor-default'
            }`}
          >
            {initials}
          </button>
        </div>
      </div>
    </header>
  );
}
