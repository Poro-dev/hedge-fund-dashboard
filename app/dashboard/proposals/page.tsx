import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';
import Link from 'next/link';

type Proposal = {
  id: number;
  ticker: string;
  action: string;
  conviction: number | null;
  supporting_data: string | null;
  suggested_allocation: number | null;
  status: string;
  created_at: Date;
};

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    BUY: '#00aa44',
    SELL: '#cc0000',
    HOLD: '#888888',
  };
  return (
    <span style={{
      color: colors[action] ?? '#888',
      fontWeight: 'bold',
      padding: '2px 8px',
      borderRadius: '4px',
      background: `${colors[action] ?? '#888'}22`,
    }}>
      {action}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      color: status === 'approved' ? '#00aa44' : '#888',
      fontSize: '12px',
      padding: '2px 6px',
      borderRadius: '4px',
      background: status === 'approved' ? '#00aa4422' : '#88888822',
    }}>
      {status}
    </span>
  );
}

function parseRationale(supporting_data: string | null): string {
  if (!supporting_data) return '—';
  try {
    const parsed = JSON.parse(supporting_data);
    if (parsed.rationale) return parsed.rationale;
  } catch {}
  return supporting_data.length > 120 ? supporting_data.slice(0, 120) + '…' : supporting_data;
}

export default async function Proposals() {
  const session = await auth();
  if (!session) redirect('/');

  const rows = (await sql`
    SELECT * FROM proposals ORDER BY created_at DESC
  `) as Proposal[];

  const today = new Date().toLocaleDateString();

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', padding: '24px', color: '#222' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #222', paddingBottom: '12px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Hedge Fund OS</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/dashboard">← Stocks</Link>
          <form action={async () => { 'use server'; await signOut(); }}>
            <button type="submit" style={{ cursor: 'pointer' }}>Sign out</button>
          </form>
        </div>
      </div>

      <h2>Recommendations</h2>
      {rows.length === 0 ? (
        <p style={{ color: '#888' }}>No proposals yet. Run the Python agents to populate.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Ticker</th>
              <th style={{ padding: '8px' }}>Action</th>
              <th style={{ padding: '8px' }}>Conviction</th>
              <th style={{ padding: '8px' }}>Rationale</th>
              <th style={{ padding: '8px' }}>Allocation %</th>
              <th style={{ padding: '8px' }}>Status</th>
              <th style={{ padding: '8px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>{row.ticker}</td>
                <td style={{ padding: '8px' }}><ActionBadge action={row.action} /></td>
                <td style={{ padding: '8px' }}>{row.conviction != null ? `${row.conviction}/10` : '—'}</td>
                <td style={{ padding: '8px', maxWidth: '300px', color: '#444' }}>{parseRationale(row.supporting_data)}</td>
                <td style={{ padding: '8px' }}>{row.suggested_allocation != null ? `${row.suggested_allocation.toFixed(1)}%` : '—'}</td>
                <td style={{ padding: '8px' }}><StatusBadge status={row.status} /></td>
                <td style={{ padding: '8px', color: '#888', fontSize: '12px' }}>
                  {row.created_at.toLocaleDateString()}
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
