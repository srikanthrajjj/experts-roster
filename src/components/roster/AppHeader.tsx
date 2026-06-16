import UnicefLogo from './UnicefLogo';

export default function AppHeader() {
  return (
    <header className="relative z-30 h-[66px] bg-[#0091F9] text-white shadow-[0_14px_30px_rgba(0,145,249,0.18)]">
      <div className="flex h-full items-center justify-between gap-5 px-5 xl:px-8">
        <div className="flex h-full min-w-0 items-center gap-7">
          <UnicefLogo className="h-10" />

          <span className="hidden text-sm font-bold text-white lg:block">
            Resource availability & planning
          </span>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-sm font-black shadow-sm">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
