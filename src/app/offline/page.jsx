import OfflineClient from './OfflineClient';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Offline | SkyStream',
  description: 'You are currently offline.',
  robots: 'noindex, nofollow',
};

export default function OfflinePage() {
  return <OfflineClient />;
}
