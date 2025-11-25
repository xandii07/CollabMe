"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      router.push("/auth");
      return;
    }

    setUser(data.user);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  if (loading) {
    return (
      <main className="center-container">
        <div className="box">
          <p className="subtitle">Carregando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="center-container">
      <div className="box big-box">

        <h1 className="title">Bem-vindo!</h1>
        <p className="subtitle">
          {user.email ? `Você entrou como: ${user.email}` : "Usuário carregado."}
        </p>

        <button onClick={() => router.push("/home/feed")}>
          Ir para o Feed
        </button>

        <button onClick={handleLogout} style={{ marginTop: "10px" }}>
          Sair
        </button>

      </div>
    </main>
  );
}
