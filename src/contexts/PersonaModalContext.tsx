import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonaSelectionModal from '../components/roster/PersonaSelectionModal';
import { getRoleHomePath, type UserRole } from '../lib/userRole';

type PersonaModalContextValue = {
  userRole: string | null;
  openPersonaModal: () => void;
  closePersonaModal: () => void;
};

const PersonaModalContext = createContext<PersonaModalContextValue | null>(null);

export function PersonaModalProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('userRole'));
  const [isOpen, setIsOpen] = useState(() => !localStorage.getItem('userRole'));

  useEffect(() => {
    const syncRole = () => setUserRole(localStorage.getItem('userRole'));
    syncRole();
    window.addEventListener('storage', syncRole);
    return () => window.removeEventListener('storage', syncRole);
  }, []);

  const openPersonaModal = useCallback(() => setIsOpen(true), []);

  const closePersonaModal = useCallback(() => {
    if (localStorage.getItem('userRole')) {
      setIsOpen(false);
    }
  }, []);

  const selectPersona = useCallback(
    (role: UserRole) => {
      localStorage.setItem('userRole', role);
      setUserRole(role);
      setIsOpen(false);
      window.dispatchEvent(new Event('storage'));
      navigate(getRoleHomePath(role));
    },
    [navigate],
  );

  return (
    <PersonaModalContext.Provider value={{ userRole, openPersonaModal, closePersonaModal }}>
      {children}
      {isOpen && (
        <PersonaSelectionModal
          onSelect={selectPersona}
          onClose={closePersonaModal}
          currentRole={userRole}
          allowDismiss={!!userRole}
        />
      )}
    </PersonaModalContext.Provider>
  );
}

export function usePersonaModal() {
  const context = useContext(PersonaModalContext);
  if (!context) {
    throw new Error('usePersonaModal must be used within PersonaModalProvider');
  }
  return context;
}
