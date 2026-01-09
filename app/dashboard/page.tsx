"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/login");
      else setUser(session.user);
    };
    checkUser();
  }, [router]);

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name,
          price,
          startDate: date,
          cycle: "Monthly",
        }),
      });

      if (response.ok) {
        alert("Subscription added!");
        setName("");
        setPrice("");
        setDate("");
      } else {
        alert("Failed to add subscription");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded">Sign Out</button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mb-8 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Add New Subscription</h2>
        <form onSubmit={handleAddSubscription} className="flex gap-4 items-end flex-wrap">
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-700 p-2 rounded text-white" 
              placeholder="Netflix" 
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Price</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-gray-700 p-2 rounded text-white" 
              placeholder="15.99" 
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Start Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-gray-700 p-2 rounded text-white" 
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold"
          >
            {loading ? "Adding..." : "Add +"}
          </button>
        </form>
      </div>

    </div>
  );
}