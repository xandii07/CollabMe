"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

interface ProfileData {
  id: string;
  nome: string;
  tipo: string;
  genero_principal: string;
  cidade: string;
  bio: string;
  instagram: string;
  youtube: string;
  spotify: string;
  foto_url: string | null;
  is_pro: boolean;
}

export default function PublicProfilePage({ params }: any) {
  const router = useRouter();
  const { id } = params;

  const [perfil, setPerfil] = useState<ProfileData | null>(null);
  const [guias, setGuias] = useState<any[]>([]);
  const [beats, setBeats] = useState<any[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // Detectar tap para clicar sem conflito com scroll
  const tapStartX = useRef(0);
  const tapStartY = useRef(0);

  // =============================
  // 1. Carregar Perfil + Conteúdo
  // =============================
  useEffect(() => {
    loadEverything();
  }, [id]);

  async function loadEverything() {
    setLoading(true);

    const user = await supabase.auth.getUser();
    setCurrentUserId(user.data.user?.id || null);

    // PERFIL
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    setPerfil(profileData || null);

    // GUIAS
    const { data: guiasData } = await supabase
      .from("guias")
      .select("*")
      .eq("user_id", id);

    setGuias(guiasData || []);

    // BEATS
    const { data: beatsData } = await supabase
      .from("beats")
      .select("*")
      .eq("user_id", id);

    setBeats(beatsData || []);

    // SEGUIDORES
    const { count: followersCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", id);

    setFollowers(followersCount || 0);

    // SEGUINDO
    const { count: followingCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", id);

    setFollowing(followingCount || 0);

    // SE EU SIGO ESSE PERFIL
    if (user.data.user) {
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", user.data.user.id)
        .eq("following_id", id);

      setIsFollowing(count! > 0);
    }

    setLoading(false);
  }

  // =============================
  // 2. Seguir / Parar de seguir
  // =============================
  async function toggleFollow() {
    if (!currentUserId) return;

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", id);

      setIsFollowing(false);
      setFollowers((prev) => prev - 1);
    } else {
      await supabase.from("follows").insert({
        follower_id: currentUserId,
        following_id: id,
      });

      setIsFollowing(true);
      setFollowers((prev) => prev + 1);
    }
  }

  // =============================
  // LOADING
  // =============================
  if (loading || !perfil) {
    return (
      <main className="center-container">
        <div className="box big-box">
          <p className="subtitle">Carregando perfil...</p>
        </div>
      </main>
    );
  }

  const isOwn = currentUserId === id;

  // ======================================================
  //  UI PREMIUM — IGUAL FEED (ESSE É O NOVO LAYOUT PRO)
  // ======================================================
  return (
    <main className="feed-main">
      <div className="box big-box feed-box" style={{ paddingBottom: 40 }}>

        {/* =======================
            CABEÇALHO DO PERFIL
        ========================== */}
        <div className="profile-header">

          <img
            src={perfil.foto_url || "https://via.placeholder.com/200"}
            className="profile-photo"
          />

          <h1 className="title profile-name">
            {perfil.nome}
            {perfil.is_pro && (
              <span className="badge-pro" style={{ marginLeft: 6 }}>
                ⭐ PRO
              </span>
            )}
          </h1>

          <p className="swipe-user-role">{perfil.tipo}</p>

          {/* BIO */}
          <p className="profile-bio">{perfil.bio || "Nenhuma bio adicionada."}</p>

          {/* Estilo / Cidade */}
          <p className="profile-meta">
            Estilo: {perfil.genero_principal || "Não informado"}
          </p>

          <p className="profile-meta">
            Cidade: {perfil.cidade || "Não informado"}
          </p>

          {/* SEGUIDORES / SEGUINDO */}
          <div className="follow-stats">
            <div className="stat-block">
              <span className="stat-number">{followers}</span>
              <span className="stat-label">Seguidores</span>
            </div>

            <div className="stat-block">
              <span className="stat-number">{following}</span>
              <span className="stat-label">Seguindo</span>
            </div>
          </div>

          {/* BOTÃO SEGUIR OU EDITAR */}
          {!isOwn ? (
            <button
              className="btn-primary"
              style={{ marginTop: 14 }}
              onClick={toggleFollow}
            >
              {isFollowing ? "Deixar de seguir" : "Seguir"}
            </button>
          ) : (
            <button
              className="btn-primary"
              style={{ marginTop: 14 }}
              onClick={() => router.push("/home/profile/edit")}
            >
              Editar Perfil
            </button>
          )}
        </div>

        {/* =====================================
            GUIAS (GRID PREMIUM)
        ====================================== */}
        {guias.length > 0 && (
          <>
            <h2 className="title grid-title">Guias</h2>

            <div className="explore-grid">
              {guias.map((g) => (
                <div key={g.id} className="explore-card">
                  <p className="grid-item-title">{g.titulo}</p>
                  <p className="grid-item-sub">Estilo: {g.estilo}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* =====================================
            BEATS (GRID PREMIUM)
        ====================================== */}
        {beats.length > 0 && (
          <>
            <h2 className="title grid-title">Beats</h2>

            <div className="explore-grid">
              {beats.map((b) => (
                <div key={b.id} className="explore-card">
                  <p className="grid-item-title">{b.titulo}</p>
                  <p className="grid-item-sub">Estilo: {b.estilo}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
