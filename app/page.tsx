import { auth, signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();

  if (session) redirect('/dashboard');

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>Project Name</h1>
      <form action={async () => { 'use server'; await signIn('google'); }}>
        <button type="submit">Sign in with Google</button>
      </form>
    </main>
  );
}
