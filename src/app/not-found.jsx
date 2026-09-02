import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          fontWeight: '700',
          color: 'var(--netflix-red)',
          marginBottom: '1rem',
        }}
      >
        404
      </h1>
      <h2
        style={{
          color: 'var(--text-primary)',
          marginBottom: '1rem',
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          color: 'var(--text-secondary)',
          marginBottom: '2rem',
          maxWidth: '400px',
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            padding: '0.75rem 2rem',
            background: 'var(--netflix-red)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'background-color 0.2s ease',
          }}
        >
          Go Home
        </Link>
        <Link
          href="/?focus=search"
          style={{
            padding: '0.75rem 2rem',
            background: 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'border-color 0.2s ease, color 0.2s ease',
          }}
        >
          Search Content
        </Link>
      </div>
    </div>
  );
}
