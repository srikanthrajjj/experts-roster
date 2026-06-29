import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getRoleDotClass, getRoleLabel, isExpertRole, isManagerLike } from '../../lib/userRole';
import { usePersonaModal } from '../../contexts/PersonaModalContext';
import { cn } from '../../lib/utils';

type AppHeaderProps = {
  backTo?: string;
  backLabel?: string;
};

type NavLink = { label: string; to: string };

function getNavLinks(role: string | null): NavLink[] {
  const links: NavLink[] = [{ label: 'Home', to: '/' }];
  if (isManagerLike(role)) {
    links.push({ label: 'Planning', to: '/roster/planning' });
    links.push({ label: 'Dashboard', to: '/roster/manager' });
  } else if (isExpertRole(role)) {
    links.push({ label: 'Dashboard', to: '/roster/expert-dashboard' });
  }
  return links;
}

export default function AppHeader({ backTo, backLabel = 'Back' }: AppHeaderProps) {
  const { userRole, openPersonaModal } = usePersonaModal();
  const location = useLocation();
  const [initials, setInitials] = useState('A');
  const navLinks = getNavLinks(userRole);

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
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:gap-5 sm:px-5 xl:px-8">
        <div className="flex h-full min-w-0 items-center gap-2 sm:gap-3 md:gap-5">
          {backTo && (
            <Link
              to={backTo}
              className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs font-bold text-white/90 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:gap-1.5 sm:px-2 sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              <span className="max-w-[7rem] truncate sm:max-w-none">{backLabel}</span>
            </Link>
          )}
          {backTo && <span className="hidden h-5 w-px shrink-0 bg-white/25 sm:block" aria-hidden />}
          <Link
            to="/"
            className={cn(
              'shrink-0 text-sm font-bold text-white transition hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 lg:text-base',
              backTo && 'hidden sm:inline',
            )}
          >
            Resource availability & planning
          </Link>
          <nav className="hidden items-center gap-0.5 border-l border-white/25 pl-3 sm:flex md:gap-1 md:pl-4">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'rounded-md px-2 py-1 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:px-2.5 md:text-sm',
                    isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-3 sm:gap-4">
          <button
            type="button"
            onClick={openPersonaModal}
            title="Change role perspective"
            className="flex animate-fade-in cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-white/20 sm:px-3"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${getRoleDotClass(userRole)}`}></span>
            <span className="hidden sm:inline">Role: {userRole ? getRoleLabel(userRole) : 'Select'}</span>
            <span className="sm:hidden">Role</span>
          </button>
          <button
            onClick={() => {
              if (isExpertRole(userRole)) {
                window.dispatchEvent(new Event('open-profile-edit'));
              }
            }}
            title={isExpertRole(userRole) ? 'View/Edit Profile' : undefined}
            disabled={!isExpertRole(userRole)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-sm font-black shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-white/50 sm:h-11 sm:w-11 ${
              isExpertRole(userRole)
                ? 'cursor-pointer hover:border-white/50 hover:bg-white/20'
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
