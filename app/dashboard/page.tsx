"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Subscription {
  id: string;
  name: string;
  price: number;
  startDate: string;
  nextPayment: string;
  cycle: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      fetchSubscriptions(session.user.id);
    };
    init();
  }, [router]);

  
  const analytics = useMemo(() => {
    const totalMonthly = subscriptions.reduce((acc, sub) => {
      if (sub.cycle === "Yearly") {
        return acc + (sub.price / 12);
      }
      return acc + sub.price;
    }, 0);

    return {
      monthly: totalMonthly,
      yearly: totalMonthly * 12,
      count: subscriptions.length
    };
  }, [subscriptions]);
  

  const fetchSubscriptions = async (userId: string) => {
    try {
      const res = await fetch(`/api/subscriptions?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data);
      }
    } catch (error) {
      console.error("Failed to fetch subs");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const response = await fetch("/api/subscriptions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId, 
            name,
            price,
            startDate: date,
            cycle: "Monthly",
          }),
        });
        
        if (!response.ok) throw new Error("Failed to update");
        
      } else {
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

        if (!response.ok) throw new Error("Failed to add");
      }

      fetchSubscriptions(user.id);
      handleCancelEdit(); 

    } catch (error) {
      console.error(error);
      alert("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return;

    try {
      const res = await fetch(`/api/subscriptions?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
      } else {
        alert("Failed to delete");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (sub: Subscription) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setName(sub.name);
    setPrice(sub.price.toString());
    setDate(new Date(sub.startDate).toISOString().split('T')[0]);
    setEditingId(sub.id);
  };
  
  const handleCancelEdit = () => {
    setName("");
    setPrice("");
    setDate("");
    setEditingId(null);
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-blue-900/30 border border-blue-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">
            Monthly Spend
          </h3>
          <p className="text-4xl font-bold text-blue-100 mt-2">
            €{analytics.monthly.toFixed(2)}
          </p>
        </div>

        <div className="bg-purple-900/30 border border-purple-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">
            Yearly Projection
          </h3>
          <p className="text-4xl font-bold text-purple-100 mt-2">
            €{analytics.yearly.toFixed(2)}
          </p>
          <p className="text-xs text-purple-300 mt-1">
            (Estimated)
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">
            Active Subs
          </h3>
          <p className="text-4xl font-bold text-white mt-2">
            {analytics.count}
          </p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mb-8 max-w-2xl border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Subscription" : "Add New Subscription"}
        </h2>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input 
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="bg-gray-700 p-2 rounded text-white" placeholder="Netflix" required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Price</label>
            <input 
              type="number" value={price} onChange={(e) => setPrice(e.target.value)}
              className="bg-gray-700 p-2 rounded text-white" placeholder="15.99" step="0.01" required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Start Date</label>
            <input 
              type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="bg-gray-700 p-2 rounded text-white" required
            />
          </div>
          <div className="flex gap-2">
            {editingId && (
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded font-bold"
              >
                Cancel
              </button>
            )}
            
            <button 
              type="submit" 
              disabled={loading} 
              className={`${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded font-bold`}
            >
              {loading ? "Saving..." : (editingId ? "Update" : "Add +")}
            </button>
          </div>
        </form>
      </div>

      <h2 className="text-2xl font-bold mb-4">Your Subscriptions</h2>
      
      {subscriptions.length === 0 ? (
        <p className="text-gray-500">No subscriptions yet. Add one above!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="bg-gray-800 p-5 rounded-lg border border-gray-700 hover:border-blue-500 transition relative group">
              
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">{sub.name}</h3>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditClick(sub)}
                    className="text-gray-500 hover:text-blue-400 transition"
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button 
                    onClick={() => handleDelete(sub.id)}
                    className="text-gray-500 hover:text-red-500 transition"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                 <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded">
                  {sub.cycle}
                </span>
              </div>
              
              <div className="text-3xl font-bold mb-2">
                €{sub.price.toFixed(2)}
              </div>
              
              <div className="text-sm text-gray-400">
                Next Payment: <br />
                <span className="text-white">
                  {new Date(sub.nextPayment).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}