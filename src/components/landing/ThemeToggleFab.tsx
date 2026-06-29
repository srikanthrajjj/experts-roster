import { Moon, Sun } from 'lucide-react';
import { useLandingTheme } from '../../contexts/LandingThemeContext';
import { cn } from '../../lib/utils';

export default function ThemeToggleFab() {
  const { isMidnight, toggleTheme } = useLandingTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isMidnight ? 'Switch to daylight theme' : 'Switch to midnight theme'}
      className={cn(
        'fixed z-50 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold shadow-lg transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'bottom-20 right-4 md:bottom-6 md:right-6',
        isMidnight
          ? 'border border-amber-300/40 bg-gradient-to-r from-amber-400 to-orange-400 text-[#0B1220] shadow-amber-500/25 hover:shadow-amber-400/40 focus-visible:ring-amber-300'
          : 'border border-[#0091F9]/30 bg-gradient-to-r from-[#0091F9] to-[#0072CE] text-white shadow-[#0091F9]/30 hover:shadow-[#0091F9]/45 focus-visible:ring-[#0091F9]',
      )}
    >
      {isMidnight ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
      Change theme
    </button>
  );
}
