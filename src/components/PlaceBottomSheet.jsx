import ProgramList from "./ProgramList.jsx";
import { openNavigation } from "../lib/program.js";

// Detail místa. Dvě podoby:
//  - variant="sheet" (výchozí): spodní vysouvací panel na mobilu
//  - variant="panel": vložená boční lišta v layoutu na PC
export default function PlaceBottomSheet({ place, now, onClose, variant = "sheet" }) {
  if (!place) return null;

  const content = (
    <>
      {/* Hlavička */}
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-red font-display text-sm font-bold text-parch-2">
              {place.number}
            </span>
            <h2 className="truncate font-display text-2xl font-bold leading-tight text-ink lg:text-3xl">
              {place.name}
            </h2>
          </div>
          {place.stage && (
            <p className="mt-1.5 inline-block rounded border border-brand-red/30 bg-brand-red/10 px-2 py-0.5 text-sm font-bold lg:text-base uppercase tracking-wide text-brand-red">
              {place.stage}
            </p>
          )}
          {place.address && (
            <p className="mt-1 font-serif text-sm italic text-ink-soft lg:text-base">
              {place.address}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít"
          className="shrink-0 rounded-full bg-ink/10 p-2 text-ink/60 active:bg-ink/20"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Program */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-2">
        <ProgramList items={place.program} now={now} />
      </div>

      {/* Navigace */}
      <div className="border-t border-parch-3 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => openNavigation(place)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-4 font-display text-lg font-bold tracking-wide text-parch-2 shadow-md active:scale-[0.98]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21s-7-6.3-7-11a7 7 0 1114 0c0 4.7-7 11-7 11z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="12" cy="10" r="2.5" fill="currentColor" />
          </svg>
          Navigovat
        </button>
      </div>
    </>
  );

  if (variant === "panel") {
    // Boční lišta vyplňující volný prostor vlevo od mapy (PC)
    return (
      <div className="paper flex h-full max-h-[calc(100vh-12rem)] flex-col rounded-xl border-2 border-brand-red/70 bg-parch pt-2 shadow-xl">
        {content}
      </div>
    );
  }

  return (
    <>
      {/* Ztmavení za panelem */}
      <div
        className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="paper animate-sheet-up fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[82vh] max-w-md flex-col rounded-t-2xl border-t-4 border-brand-red bg-parch shadow-2xl">
        {/* Úchyt */}
        <div className="flex justify-center pt-3">
          <span className="h-1.5 w-12 rounded-full bg-ink/20" />
        </div>
        {content}
      </div>
    </>
  );
}
