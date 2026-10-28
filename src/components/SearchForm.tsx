// Plain GET form -- submitting navigates to /search?q=... like any other
// link on the site, so the back button, sharing a URL, and no-JS all work.
export function SearchForm({ initialQuery }: { initialQuery: string }) {
  return (
    <form action="/search" method="get" className="flex max-w-xl gap-2">
      <input
        type="search"
        name="q"
        defaultValue={initialQuery}
        placeholder="Search articles..."
        autoFocus
        className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:border-red-600 focus:outline-none"
      />
      <button type="submit" className="shrink-0 bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
        Search
      </button>
    </form>
  );
}
