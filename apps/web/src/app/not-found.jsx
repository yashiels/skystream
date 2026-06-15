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
          color: '#00d4aa',
          marginBottom: '1rem',
        }}
      >
        404
      </h1>
      <h2
        style={{
          color: '#f9fafb',
          marginBottom: '1rem',
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          color: '#9ca3af',
          marginBottom: '2rem',
          maxWidth: '400px',
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          padding: '0.75rem 2rem',
          background: '#00d4aa',
          color: '#0a0a1a',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          textDecoration: 'none',
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
