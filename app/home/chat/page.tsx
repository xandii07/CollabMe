"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ChatList() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [convs, setConvs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/auth");
      return;
    }

    setUser(data.user);

    const { data: matches } = await supabase
      .from("matches")
      .select(`
        id,
        user1_id,
        user2_id,
        last_message,
        last_message_time,
        profiles!matches_user2_id_fkey (nome, foto_url),
        profiles2:profiles!matches_user1_id_fkey (nome, foto_url)
      `);

    const formatted = matches.map((m: any) => {
      const is1 = m.user1_id === data.user.id;

      return {
        id: m.id,
        nome: is1 ? m.profiles.nome : m.profiles2.nome,
        foto: is1 ? m.profiles.foto_url : m.profiles2.foto_url,
        last: m.last_message,
        lastTime: m.last_message_time,
      };
    });

    setConvs(formatted);
    setLoading(false);
  }

  if (loading)
    return <main className="center-container"><div className="box">Carregando...</div></main>;

  return (
    <main className="center-container">
      <div className="box big-box">
        <h1 className="title">Conversas</h1>

        {convs.length === 0 ? (
          <p className="subtitle">Nenhum feat ainda 😢</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {convs.map((c) => (
              <div
                key={c.id}
                className="card"
                style={{ display: "flex", cursor: "pointer" }}
                onClick={() => router.push(`/home/chat/${c.id}`)}
              >
                <img
                  src={c.foto || "https://via.placeholder.com/50"}
                  style={{
                    width: "55px",
                    height: "55px",
                    borderRadius: "50%",
                    marginRight: "10px",
                  }}
                />

                <div>
                  <p style={{ fontSize: "17px" }}>{c.nome}</p>
                  <p style={{ fontSize: "13px", color: "#aaa" }}>
                    {c.last ? c.last : "Sem mensagens ainda"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
