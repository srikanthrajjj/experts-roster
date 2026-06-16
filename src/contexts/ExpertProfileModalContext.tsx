import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExpertProfileModal from '../components/roster/ExpertProfileModal';

type ExpertProfileModalContextValue = {
  openProfile: (expertId: string) => void;
  closeProfile: () => void;
  profileExpertId: string | null;
};

const ExpertProfileModalContext = createContext<ExpertProfileModalContextValue | null>(null);

export function ExpertProfileModalProvider({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [profileExpertId, setProfileExpertId] = useState<string | null>(() => searchParams.get('profile'));

  useEffect(() => {
    const profileId = searchParams.get('profile');
    setProfileExpertId(profileId);
  }, [searchParams]);

  const openProfile = useCallback(
    (expertId: string) => {
      setProfileExpertId(expertId);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('profile', expertId);
          return next;
        },
        { replace: false },
      );
    },
    [setSearchParams],
  );

  const closeProfile = useCallback(() => {
    setProfileExpertId(null);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('profile');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const value = useMemo(
    () => ({ openProfile, closeProfile, profileExpertId }),
    [openProfile, closeProfile, profileExpertId],
  );

  return (
    <ExpertProfileModalContext.Provider value={value}>
      {children}
      <ExpertProfileModal expertId={profileExpertId} onClose={closeProfile} />
    </ExpertProfileModalContext.Provider>
  );
}

export function useExpertProfileModal() {
  const context = useContext(ExpertProfileModalContext);
  if (!context) {
    throw new Error('useExpertProfileModal must be used within ExpertProfileModalProvider');
  }
  return context;
}
