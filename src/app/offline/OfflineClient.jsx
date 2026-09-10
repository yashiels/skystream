'use client';

import Link from 'next/link';
import { reloadPage } from './reload';
import './offline.css';

export default function OfflineClient() {
  return (
    <div className="offline-page">
      <h1 className="offline-page__title">You&apos;re offline</h1>
      <p className="offline-page__message">
        SkyStream can&apos;t reach the network right now. Check your connection and try again.
      </p>
      <div className="offline-page__actions">
        <button type="button" className="offline-page__button offline-page__button--primary" onClick={reloadPage}>
          Retry
        </button>
        <Link href="/" className="offline-page__button offline-page__button--secondary">
          Go home
        </Link>
      </div>
    </div>
  );
}
