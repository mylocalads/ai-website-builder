/**
 * Shared icon registry.
 *
 * Content supplies a KEY, never markup and never a raw label. An unknown key
 * resolves to null and the caller renders nothing — printing the raw string is
 * how the words "shield" and "clock" once ended up rendered at 3rem on ten
 * pages. Every consumer must go through `getIcon`.
 *
 * Paths are drawn on a 24x24 viewBox and fill with currentColor.
 */
export const ICONS: Record<string, string> = {
  shield:
    '<path d="M12 2.5 4.5 5.8v5.6c0 4.7 3.2 9.1 7.5 10.1 4.3-1 7.5-5.4 7.5-10.1V5.8L12 2.5Z"/><path d="m8.8 12 2.3 2.4 4.3-4.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  document:
    '<path d="M6 2.5h7.2L19 8.3V21a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 21V3a.5.5 0 0 1 .5-.5Z"/><path d="M13 2.6V8.5h5.9" fill="none" stroke="#fff" stroke-width="1.4"/><path d="M9 13.5h6M9 16.5h6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
  umbrella:
    '<path d="M12 3a9 9 0 0 0-9 9h6a3 3 0 0 1 6 0h6a9 9 0 0 0-9-9Z"/><path d="M12 12v6.5a2.2 2.2 0 0 1-4.4 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M8 2.8v3.6M16 2.8v3.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  broom:
    '<path d="M13.8 3.2 10 7l3.4 3.4 3.8-3.8a2.4 2.4 0 0 0-3.4-3.4Z"/><path d="M9.6 7.4 4 13v6.8h6.8L16.4 14 9.6 7.4Z"/>',
  home:
    '<path d="M12 3 2.8 10.4h2.4V21h5.2v-5.6h3.2V21h5.2V10.4h2.4L12 3Z"/>',
  handshake:
    '<path d="M2.6 9.6 6.4 6l3 2.6 3.2-2.6 3.4 1.9 5.4 3.3-3.1 4.4-2.6-1.7-3 2.8-2.6-1.4-2.4 2L2.6 12Z"/>',
  award:
    '<circle cx="12" cy="9" r="5.6"/><path d="m8.4 14.2-1.6 7 5.2-2.6 5.2 2.6-1.6-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  wallet:
    '<rect x="2.8" y="5.6" width="18.4" height="13.2" rx="2.4"/><path d="M2.8 10h18.4" fill="none" stroke="#fff" stroke-width="1.4"/><circle cx="17" cy="14.6" r="1.5" fill="#fff"/>',
  clipboard:
    '<rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2.4" width="6" height="3.4" rx="1.2"/><path d="M9 12h6M9 15.5h4" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
  hammer:
    '<path d="m14.4 3 6.2 6.2-2.5 2.5-2.2-2.2-8.6 8.6a2 2 0 0 1-2.8-2.8l8.6-8.6-2.2-2.2Z"/>',
  clock:
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.4l3.4 2" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
};

export function getIcon(key?: string | null): string | null {
  if (!key) return null;
  return Object.prototype.hasOwnProperty.call(ICONS, key) ? ICONS[key] : null;
}
