import Link from "next/link";
export default function Home() {
  return (
    <main className="container">
      <h1>LearnAI Academy</h1>
      <p>Welcome! This is a scaffold with API routes and stubs wired up.</p>
      <ul>
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/learn">Learn</Link></li>
        <li><Link href="/progress">Progress</Link></li>
        <li><Link href="/parent">Parent</Link></li>
      </ul>
    </main>
  );
}
