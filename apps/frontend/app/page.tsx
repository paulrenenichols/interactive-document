export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Interactive Presentation</h1>
      <p>Landing placeholder. API URL: {apiUrl}</p>
    </main>
  );
}
