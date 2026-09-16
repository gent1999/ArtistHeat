// Thin red L-shaped corner brackets that frame an article image from just
// outside its edges -- ArtistHeat's branded corner-frame treatment, shared
// across every homepage editorial image card (hero, featured side cards,
// standard article cards, Face of the Heat).
//
// Must render as a sibling of the image's own clipped box, inside a
// `relative` ancestor that does NOT itself clip overflow (no
// `overflow-hidden` on that ancestor) -- otherwise these negative offsets
// get cut off before they're visible. Relies on an ancestor `.group` class
// (already present on every card this is used in) for the hover brighten.
export function ArticleImageCorners() {
  const corner =
    'pointer-events-none absolute h-4 w-4 border-red-600 transition-colors duration-200 group-hover:border-red-500';

  return (
    <>
      <span className={`${corner} -top-1.5 -left-1.5 border-t-2 border-l-2`} />
      <span className={`${corner} -top-1.5 -right-1.5 border-t-2 border-r-2`} />
      <span className={`${corner} -bottom-1.5 -left-1.5 border-b-2 border-l-2`} />
      <span className={`${corner} -bottom-1.5 -right-1.5 border-b-2 border-r-2`} />
    </>
  );
}
