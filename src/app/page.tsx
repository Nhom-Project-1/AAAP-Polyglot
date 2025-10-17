export default function Home() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>AAAP Polyglot Backend API</h1>
      <p>Server đang chạy tại: <code>http://localhost:3001</code></p>
      <p>API Endpoints:</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>GET /api/health</li>
        <li>POST /api/signup</li>
        <li>POST /api/login</li>
      </ul>
    </div>
  );
}