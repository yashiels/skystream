'use client';

const Layout = ({ children }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a1a',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(10, 10, 26, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1.5rem',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: '700',
                color: '#f9fafb',
                letterSpacing: '-0.02em',
              }}
            >
              Sky
              <span style={{ color: '#00d4aa' }}>Log</span>
            </span>
          </a>

          {/* CTA */}
          <a
            href="mailto:pilot@skylog.co.za"
            style={{
              padding: '0.5rem 1.25rem',
              background: '#00d4aa',
              color: '#0a0a1a',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'background 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            Join the Pilot
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: '#080814',
          padding: '2rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <p
            style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              margin: 0,
            }}
          >
            © 2025 SkyLog · Built by{' '}
            <a
              href="https://github.com/skynergroup"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#9ca3af' }}
            >
              Skyner
            </a>
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a
              href="https://github.com/skynergroup"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#6b7280', fontSize: '0.875rem' }}
            >
              GitHub
            </a>
            <a
              href="https://twitter.com/skylog_ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#6b7280', fontSize: '0.875rem' }}
            >
              Twitter
            </a>
            <a
              href="mailto:pilot@skylog.co.za"
              style={{ color: '#6b7280', fontSize: '0.875rem' }}
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
