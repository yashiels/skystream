'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { Home, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import BackToTop from './BackToTop';
import analytics from '../utils/analytics';
import './Layout.css';

const isInputFocused = target => {
  if (!target) return false;
  const tagName = target.tagName?.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
};

const Layout = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  // Initialize analytics on mount
  useEffect(() => {
    analytics.init();
  }, []);

  // Handle global keyboard shortcuts
  const handleGlobalKeyDown = useCallback(
    e => {
      // '/' key to focus search
      if (e.key === '/' && !isInputFocused(e.target)) {
        e.preventDefault();

        // Dispatch custom event for StreamingSearchBar to handle
        window.dispatchEvent(new CustomEvent('focusSearch'));

        // If not on search page, navigate there
        if (pathname !== '/') {
          router.push('/');
        }
      }
    },
    [pathname, router]
  );

  // Set up global keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  return (
    <div className="layout">
      {/* Header */}
      <header className="layout__header">
        <div className="layout__header-container">
          <Link href="/home" className="layout__logo">
            <h1 className="layout__logo-text">SkyStream</h1>
          </Link>

          <nav className="layout__nav">
            <Link
              href="/home"
              className={`layout__nav-link ${pathname === '/home' ? 'layout__nav-link--active' : ''}`}
            >
              <Home size={20} />
              <span>Discover</span>
            </Link>
            <Link
              href="/"
              className={`layout__nav-link ${pathname === '/' ? 'layout__nav-link--active' : ''}`}
            >
              <Search size={20} />
              <span>Search</span>
            </Link>
          </nav>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="layout__main">{children}</main>

      {/* Footer */}
      <footer className="layout__footer">
        <div className="layout__footer-container">
          <p className="layout__footer-text">
            SkyStream - Search and stream your favorite content instantly
          </p>
          <p className="layout__footer-disclaimer">
            Content provided by third-party services. We do not host any content.
          </p>
          <div className="layout__footer-credits">
            <p>
              This site was made by{' '}
              <a
                href="https://github.com/skynergroup"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Skyner Group (opens in new tab)"
              >
                Skyner Group
              </a>
              , by devs{' '}
              <a
                href="https://github.com/yashiels"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Yashiel Sookdeo (opens in new tab)"
              >
                Yashiel Sookdeo
              </a>{' '}
              and{' '}
              <a
                href="https://github.com/MphoCodes"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mpho Ndlela (opens in new tab)"
              >
                Mpho Ndlela
              </a>
            </p>
            <p>© {new Date().getFullYear()} Skyner Group</p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <BackToTop threshold={300} />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
