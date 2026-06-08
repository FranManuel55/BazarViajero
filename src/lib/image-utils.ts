/**
 * Converts various image hosting URLs to direct-image URLs.
 *
 * Supported conversions:
 *  - Google Drive file page  → lh3.googleusercontent.com direct link
 *  - Google Drive open link  → lh3.googleusercontent.com direct link
 *  - Google Drive export link (already works, passed through)
 *
 * Any URL that is not a recognised pattern is returned as-is.
 */
export function toDirectImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // ── Google Drive ──────────────────────────────────────────────────
  // Pattern 1: https://drive.google.com/file/d/FILE_ID/...
  const driveFileMatch = trimmed.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  );
  if (driveFileMatch) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }

  // Pattern 2: https://drive.google.com/open?id=FILE_ID
  const driveOpenMatch = trimmed.match(
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
  );
  if (driveOpenMatch) {
    return `https://lh3.googleusercontent.com/d/${driveOpenMatch[1]}`;
  }

  // Pattern 3: https://drive.google.com/uc?id=FILE_ID&export=...
  // (already a direct-ish link, but let's normalise it too)
  const driveUcMatch = trimmed.match(
    /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/
  );
  if (driveUcMatch) {
    return `https://lh3.googleusercontent.com/d/${driveUcMatch[1]}`;
  }

  // ── Not a special URL → pass through ──────────────────────────────
  return trimmed;
}
