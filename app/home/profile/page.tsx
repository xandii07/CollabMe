// app/home/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Perfil {
  id: string;
  nome: string;
  tipo?: string;
  genero_principal?: string;
  cidade?: string;
  bio?: string;
  foto_url?: string | null;
  is_pro?: boolean;
}

export default function MyProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [guias, setGuias] = useState<any[]>([]);
  const [beats, setBeats] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      router.push("/auth");
      return;
    }

    const userId = auth.user.id;

    // ► 1) PERFIL
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    setPerfil(profileData as Perfil);

    // ► 2) SUAS GUIAS
    const { data: guiasData } = await supabase
      .from("guias")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setGuias(guiasData || []);

    // ► 3) SEUS BEATS
    const { data: beatsData } = await supabase
      .from("beats")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setBeats(beatsData || []);

    // ► 4) FOLLOWERS (quem te segue)
    const { data: followersData } = await supabase
      .from("followers")
      .select("id")
      .eq("following_id", userId);

    setFollowersCount(followersData?.length || 0);

    // ► 5) FOLLOWING (quem você segue)
    const { data: followingData } = await supabase
      .from("followers")
      .select("id")
      .eq("follower_id", userId);

    setFollowingCount(followingData?.length || 0);

    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  if (loading || !perfil) {
    return (
      <main className="center-container">
        <div className="box big-box">
          <p className="subtitle">Carregando perfil...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-main page-main">
    <div className="profile-box page-box">  
        {/* HEADER PRINCIPAL */}
        <header className="profile-header">
          <div className="profile-avatar">
            <img
              src={perfil.foto_url || "/default-avatar.png"}
              alt="foto de perfil"
            />
          </div>

          <div className="profile-header-text">
            <h1 className="profile-name">
              {perfil.nome}
              {perfil.is_pro && (
                <span className="badge-pro-big">PRO</span>
              )}
            </h1>
            <p className="profile-type">
              {perfil.tipo ? perfil.tipo.toUpperCase() : "ARTISTA"}
            </p>
          </div>
        </header>

        {/* BIO + INFO */}
        <section className="profile-section">
          <p className="profile-bio">
            {perfil.bio || "Nenhuma bio adicionada ainda."}
          </p>

          <div className="profile-extra-row">
            <span className="profile-extra">
              🎧 Estilo: {perfil.genero_principal || "Não informado"}
            </span>
            <span className="profile-extra">
              📍 {perfil.cidade || "Cidade não informada"}
            </span>
          </div>
        </section>

        {/* STATS: FOLLOWERS / FOLLOWING */}
        <section className="profile-stats">
          <div className="profile-stat-item">
            <strong>{followersCount}</strong>
            <span>Seguidores</span>
          </div>
          <div className="profile-stat-item">
            <strong>{followingCount}</strong>
            <span>Seguindo</span>
          </div>
          <div className="profile-stat-item">
            <strong>{guias.length + beats.length}</strong>
            <span>Posts</span>
          </div>
        </section>

        {/* BOTÕES PRINCIPAIS */}
        <section className="profile-buttons">
          <button
            className="btn-purple"
            onClick={() => router.push("/home/profile/edit")}
          >
            ✏️ Editar perfil
          </button>

          <button className="btn-dark" onClick={logout}>
            Sair da conta
          </button>
        </section>

        {/* PREMIUM CALL-TO-ACTION */}
        {!perfil.is_pro && (
          <section className="profile-premium-banner">
            <h2>Desbloqueie o CollabMe PRO</h2>
            <p>
              Swipes ilimitados, mais visibilidade nas collabs e outros boosts
              pra sua carreira.
            </p>
            <button
              className="btn-premium-big"
              onClick={() => router.push("/premium")}
            >
              ⭐ Tornar-se Premium
            </button>
          </section>
        )}

        {/* MINHAS GUIAS */}
        {guias.length > 0 && (
          <section className="profile-section">
            <h2 className="profile-section-title">Minhas Guias</h2>
            <div className="profile-grid">
              {guias.map((g) => (
                <article key={g.id} className="profile-card">
                  <p className="profile-card-tag">GUIA</p>
                  <h3 className="profile-card-title">{g.titulo}</h3>
                  <p className="profile-card-meta">
                    Estilo: {g.estilo || "—"}
                    {g.bpm && ` · ${g.bpm} BPM`}
                  </p>
                  {g.descricao && (
                    <p className="profile-card-desc">{g.descricao}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* MEUS BEATS */}
        {beats.length > 0 && (
          <section className="profile-section">
            <h2 className="profile-section-title">Meus Beats</h2>
            <div className="profile-grid">
              {beats.map((b) => (
                <article key={b.id} className="profile-card">
                  <p className="profile-card-tag">BEAT</p>
                  <h3 className="profile-card-title">{b.titulo}</h3>
                  <p className="profile-card-meta">
                    Estilo: {b.estilo || "—"}
                    {b.bpm && ` · ${b.bpm} BPM`}
                  </p>
                  {b.descricao && (
                    <p className="profile-card-desc">{b.descricao}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
