import React, { useEffect, useState } from 'react';

// A PWA that's kept open (not fully closed and reopened) can sit on old
// code indefinitely even though a new version has been deployed — the
// service worker updates in the background, but nothing forces the
// already-running page to actually reload and use it. This surfaces that
// moment as a visible, user-triggered "Update now" action instead of
// leaving different devices silently stuck on different versions.
export default function UpdateBanner() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Only treat a controller swap as "an update is ready" if this page
    // already had a controller when we started watching — otherwise a
    // brand-new install (no controller -> first controller) would show
    // the banner to first-time visitors too.
    const hadControllerAtMount = !!navigator.serviceWorker.controller;
    let cancelled = false;

    const onControllerChange = () => {
      if (hadControllerAtMount && !cancelled) setUpdateReady(true);
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    let interval;
    let onVisible;
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg || cancelled) return;
      const check = () => reg.update().catch(() => {});
      onVisible = () => {
        if (document.visibilityState === 'visible') check();
      };
      document.addEventListener('visibilitychange', onVisible);
      interval = setInterval(check, 5 * 60 * 1000);
      check();
    });

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      if (onVisible) document.removeEventListener('visibilitychange', onVisible);
      if (interval) clearInterval(interval);
    };
  }, []);

  if (!updateReady) return null;

  return (
    <div className="update-banner">
      <span>A new version of the app is available.</span>
      <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
        Update now
      </button>
    </div>
  );
}
