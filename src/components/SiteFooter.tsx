export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 py-8">
      <div className="mx-auto max-w-6xl px-4 text-sm text-neutral-500">
        &copy; {new Date().getFullYear()} ArtistHeat
      </div>
    </footer>
  );
}
