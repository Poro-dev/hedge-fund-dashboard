import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await auth();

  if (!session) redirect('/');

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.name}</p>
      <form action={async () => { 'use server'; await signOut(); }}>
        <button type="submit">Sign out</button>
      </form>
      {/* Build your dashboard here */}
    </main>
  );
}
