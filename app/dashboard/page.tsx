import sql from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Snapshot = {
  id: number;
  ticker: string;
  price: number | null;
  change_pct: number | null;
  rsi: number | null;
  macd: number | null;
  signal: string;
  fetched_at: Date;
};

function SignalBadge({ signal }: { signal: string }) {
  const colors: Record<string, string> = {
    BUY: '#00aa44',
    SELL: '#cc0000',
    HOLD: '#888888',
  };
  return (
    <span style={{
      color: colors[signal] ?? '#888',
      fontWeight: 'bold',
      padding: '2px 8px',
      borderRadius: '4px',
      background: `${colors[signal] ?? '#888'}22`,
    }}>
      {signal}
    </span>
  );
}

export default async function Dashboard() {

  const rows = (await sql`
    SELECT * FROM (
      SELECT DISTINCT ON (ticker) *
      FROM market_snapshots
      ORDER BY ticker, fetched_at DESC
    ) latest
    ORDER BY CASE signal WHEN 'BUY' THEN 1 WHEN 'HOLD' THEN 2 WHEN 'SELL' THEN 3 ELSE 4 END
  `) as Snapshot[];

  const today = new Date().toLocaleDateString();

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto', padding: '24px', color: '#222' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #222', paddingBottom: '12px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Hedge Fund OS</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/dashboard/proposals">Recommendations →</Link>
          <a href="https://poro.uk/api/signout" style={{ cursor: 'pointer' }}>Sign out</a>
        </div>
      </div>

      <h2>Stocks</h2>
      {rows.length === 0 ? (
        <p style={{ color: '#888' }}>No data yet. Run the Python agents to populate.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Ticker</th>
              <th style={{ padding: '8px' }}>Price</th>
              <th style={{ padding: '8px' }}>Change %</th>
              <th style={{ padding: '8px' }}>RSI</th>
              <th style={{ padding: '8px' }}>MACD</th>
              <th style={{ padding: '8px' }}>Signal</th>
              <th style={{ padding: '8px' }}>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>{row.ticker}</td>
                <td style={{ padding: '8px' }}>{row.price != null ? `$${row.price.toFixed(2)}` : '—'}</td>
                <td style={{ padding: '8px', color: (row.change_pct ?? 0) >= 0 ? '#00aa44' : '#cc0000' }}>
                  {row.change_pct != null ? `${row.change_pct >= 0 ? '+' : ''}${row.change_pct.toFixed(2)}%` : '—'}
                </td>
                <td style={{ padding: '8px' }}>{row.rsi != null ? row.rsi.toFixed(1) : '—'}</td>
                <td style={{ padding: '8px' }}>{row.macd != null ? row.macd.toFixed(3) : '—'}</td>
                <td style={{ padding: '8px' }}><SignalBadge signal={row.signal} /></td>
                <td style={{ padding: '8px', color: '#888', fontSize: '12px' }}>
                  {row.fetched_at.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ color: '#888', fontSize: '12px', marginTop: '32px' }}>Hedge Fund OS — {today}</p>
    </main>
  );
}
