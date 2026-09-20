// Cloudinary serves transformed variants on the fly by inserting parameters
// right after `/image/upload/` in the URL -- no separate derivative asset to
// generate or manage. Used only for share-preview images: article photos are
// often shot vertically, but Discord/X/etc. render an og:image at its native
// aspect ratio, so an uncropped portrait photo blows up the whole embed.
// Cropping to the standard 1200x630 link-preview ratio here keeps embeds
// landscape regardless of the source photo's orientation, while the
// article's own hero image (elsewhere in the app) keeps its native crop.
const CLOUDINARY_UPLOAD_MARKER = '/image/upload/';

export function cloudinaryOgImage(url: string, width = 1200, height = 630): string {
  const markerIndex = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
  if (markerIndex === -1) return url;
  const insertAt = markerIndex + CLOUDINARY_UPLOAD_MARKER.length;
  return `${url.slice(0, insertAt)}w_${width},h_${height},c_fill,g_auto/${url.slice(insertAt)}`;
}
