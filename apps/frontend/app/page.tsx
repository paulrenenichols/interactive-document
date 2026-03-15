export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  return (
    <main
      style={{
        padding: '2rem',
        fontFamily: 'system-ui',
        color: 'var(--text-primary)',
      }}
    >
      <h1>Interactive Presentation</h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        Landing placeholder. API URL: {apiUrl}
      </p>
    </main>
  );
}
