import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24 bg-gray-950 text-white">
      <h1 className="text-5xl font-bold mb-4">SubTrack</h1>
      <p className="text-xl text-gray-400 mb-8">  
        Stop losing money on forgotten subscriptions.
      </p>
      
      <Link href="/login">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
          Get Started
        </button>
      </Link>
    </main>
  );
}