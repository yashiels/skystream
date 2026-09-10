export const registerServiceWorker = () => {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
};

export const watchForUpdate = (registration, onUpdateAvailable) => {
  if (!registration) return;

  if (registration.waiting) {
    onUpdateAvailable(registration.waiting);
  }

  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;

    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
        onUpdateAvailable(installingWorker);
      }
    });
  });
};

export const acceptUpdate = (worker, reload = () => window.location.reload()) => {
  if (!worker) return;

  navigator.serviceWorker.addEventListener('controllerchange', () => reload(), { once: true });
  worker.postMessage({ type: 'SKIP_WAITING' });
};
