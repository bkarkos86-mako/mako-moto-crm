// Bypasses the passive service-worker update check entirely — unregisters
// the worker and clears its caches so the next reload has nothing stale to
// fall back to, regardless of whether the SW file itself changed enough to
// be detected as "new".
export async function forceUpdate() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } finally {
    window.location.reload();
  }
}
