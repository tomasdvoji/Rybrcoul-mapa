// Vyhledávání podle názvu místa, stage nebo interpreta.
export default function SearchBar({ value, onChange, resultCount }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path
            d="M20 20l-3.5-3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <input
        type="text"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Hledat hospodu, stage nebo kapelu…"
        className="w-full rounded-xl border border-parch-3 bg-parch-2 py-3 pl-10 pr-10 font-serif text-base lg:py-4 lg:text-xl text-ink placeholder-ink/40 shadow-sm outline-none focus:border-brand-red"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Vymazat"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/10 p-1.5 text-ink/60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
      {value && (
        <p className="mt-1 px-1 text-xs text-parch-2/70">
          {resultCount} {resultCount === 1 ? "výsledek" : "výsledků"}
        </p>
      )}
    </div>
  );
}
