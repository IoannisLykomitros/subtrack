"use client";

import { supabase } from "../lib/supabaseClient"; 
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    console.log("Supabase connected:", supabase);
  }, []);
  
  return (
    <main className="min-h-screen p-24">
      <h1 className="text-4xl font-bold text-center">
        SubTrack
      </h1>
      <p className="text-center mt-4">
        Manage your subscriptions efficiently.
      </p>
    </main>
  );
}