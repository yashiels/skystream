'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { acceptUpdate, registerServiceWorker, watchForUpdate } from '../utils/swUpdate';
import './UpdateToast.css';

const UpdateToast = () => {
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    let cancelled = false;

    registerServiceWorker()
      ?.then(registration => {
        if (cancelled || !registration) return;
        watchForUpdate(registration, worker => setWaitingWorker(worker));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (!waitingWorker) return null;

  const handleReload = () => acceptUpdate(waitingWorker);

  return (
    <div className="update-toast" role="status">
      <div className="update-toast__content">
        <RefreshCw size={18} className="update-toast__icon" />
        <p className="update-toast__message">
          New version available. Reloading will stop any playback in progress.
        </p>
      </div>
      <button type="button" className="update-toast__button" onClick={handleReload}>
        Reload
      </button>
    </div>
  );
};

export default UpdateToast;
