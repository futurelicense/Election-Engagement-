const STORAGE_KEY = 'election_guest_id';

export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id || id.length > 64) {
      id = 'g_' + crypto.randomUUID().replace(/-/g, '');
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}
