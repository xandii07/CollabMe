// app/home/feed/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

interface FeedItem {
  id: string;
  userId: string;
  tipo: "guia" | "beat" | "video";
  titulo: string;
  estilo: string;
  descricao?: string;
  audio_url?: string | null;
  beat_url?: string | null;
  video_url?: string | null;
  usuario: string;
  foto_url?: string | null;
  is_pro: boolean;
}

export default function FeedPage() {
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);

  const [progress, setProgress] = useState(0); // ⬅️ progresso do vídeo

  const cardRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const tapStartX = useRef(0);
  const tapStartY = useRef(0);
  const TAP_THRESHOLD = 6;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id ?? null;

      setCurrentUserId(uid);
      await loadFeedData(uid);
    })();
  }, []);

  // ==========================================
  // LOAD FEED
  // ==========================================
  async function loadFeedData(authUserId: string | null) {
    try {
      const { data: guias } = await supabase
        .from("guias")
        .select(
          `id, user_id, titulo, estilo, descricao, audio_url, video_url, created_at, profiles: user_id (nome, foto_url, is_pro)`
        )
        .order("created_at", { ascending: false });

      const { data: beats } = await supabase
        .from("beats")
        .select(
          `id, user_id, titulo, estilo, descricao, beat_url, created_at, profiles: user_id (nome, foto_url, is_pro)`
        )
        .order("created_at", { ascending: false });

      let videos: any[] = [];
      try {
        const res = await supabase
          .from("videos")
          .select(
            `id, user_id, titulo, estilo, descricao, video_url, created_at, profiles: user_id (nome, foto_url, is_pro)`
          )
          .order("created_at", { ascending: false });
        videos = res.data || [];
      } catch {}

      const formattedGuias: FeedItem[] =
        guias?.map((g: any) => ({
          id: g.id,
          userId: g.user_id,
          tipo: g.video_url ? "video" : "guia",
          titulo: g.titulo,
          estilo: g.estilo,
          descricao: g.descricao,
          audio_url: g.audio_url,
          beat_url: null,
          video_url: g.video_url,
          usuario: g.profiles?.nome || "Artista",
          foto_url: g.profiles?.foto_url,
          is_pro: g.profiles?.is_pro ?? false,
        })) || [];

      const formattedBeats: FeedItem[] =
        beats?.map((b: any) => ({
          id: b.id,
          userId: b.user_id,
          tipo: "beat",
          titulo: b.titulo,
          estilo: b.estilo,
          descricao: b.descricao,
          audio_url: null,
          beat_url: b.beat_url,
          video_url: null,
          usuario: b.profiles?.nome || "Beatmaker",
          foto_url: b.profiles?.foto_url,
          is_pro: b.profiles?.is_pro ?? false,
        })) || [];

      const formattedVideos: FeedItem[] =
        videos?.map((v: any) => ({
          id: v.id,
          userId: v.user_id,
          tipo: "video",
          titulo: v.titulo,
          estilo: v.estilo,
          descricao: v.descricao,
          audio_url: null,
          beat_url: null,
          video_url: v.video_url,
          usuario: v.profiles?.nome || "Artista",
          foto_url: v.profiles?.foto_url,
          is_pro: v.profiles?.is_pro ?? false,
        })) || [];

      let feed = [...formattedGuias, ...formattedBeats, ...formattedVideos];

      feed = feed.sort(() => Math.random() - 0.5);

      if (authUserId) feed = feed.filter((it) => it.userId !== authUserId);

      setItems(feed);
    } catch (err) {
      console.error("Erro carregando feed:", err);
    }

    setLoading(false);
  }

  // ==========================================
  // AUTOPLAY
  // ==========================================
  const current = items[index];

  useEffect(() => {
    if (!current) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    setTimeout(async () => {
      if (current.tipo === "video" && videoRef.current) {
        videoRef.current.muted = muted;
        videoRef.current.ontimeupdate = () => {
          if (!videoRef.current) return;
          const v = videoRef.current;
          setProgress((v.currentTime / v.duration) * 100 || 0);
        };
        await videoRef.current.play().catch(() => {});
      } else if (audioRef.current) {
        audioRef.current.muted = false;
        await audioRef.current.play().catch(() => {});
      }
    }, 180);
  }, [index, current, muted]);

  // ==========================================
  // SWIPE
  // ==========================================
  function handleStart(e: any) {
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
  }

  function handleMove(e: any) {
    if (startX.current === null) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = x - startX.current;
    const card = cardRef.current;
    if (card) card.style.transform = `translateX(${dx}px) rotate(${dx / 20}deg)`;
  }

  function handleEnd(e: any) {
    if (startX.current === null) return;
    const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const dx = x - startX.current;
    const card = cardRef.current;

    if (dx > 120) return swipe("like");
    if (dx < -120) return swipe("pass");

    if (card) {
      card.style.transition = "transform .28s cubic-bezier(.22,.61,.36,1)";
      card.style.transform = "translateX(0px) rotate(0deg)";
      setTimeout(() => card.removeAttribute("style"), 280);
    }

    startX.current = null;
  }

  async function swipe(type: "like" | "pass") {
    const card = cardRef.current;

    if (card) {
      card.style.transition = "transform .35s cubic-bezier(.22,.61,.36,1)";
      card.style.transform =
        type === "like"
          ? "translateX(420px) rotate(22deg)"
          : "translateX(-420px) rotate(-22deg)";
    }

    if (audioRef.current) audioRef.current.pause();
    if (videoRef.current) videoRef.current.pause();

    setTimeout(() => {
      card?.removeAttribute("style");
      setIndex((prev) => Math.min(prev + 1, items.length - 1));
    }, 260);
  }

  // ==========================================
  // TAP (open profile or toggle video)
  // ==========================================
  function handleTapStart(e: any) {
    const t = e.touches ? e.touches[0] : e;
    tapStartX.current = t.clientX;
    tapStartY.current = t.clientY;
  }

  function handleTapEnd(e: any, userId: string, targetClass?: string) {
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = Math.abs(t.clientX - tapStartX.current);
    const dy = Math.abs(t.clientY - tapStartY.current);

    if (dx < TAP_THRESHOLD && dy < TAP_THRESHOLD) {
      if (targetClass === "open-profile") {
        return router.push(`/home/user/${userId}`);
      }

      if (current.tipo === "video" && videoRef.current) {
        if (videoRef.current.paused) videoRef.current.play();
        else videoRef.current.pause();
        return;
      }

      router.push(`/home/user/${userId}`);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================
  if (loading || !current) {
    return (
      <main className="center-container">
        <div className="box big-box">
          <p className="subtitle">
            {loading ? "Carregando feed..." : "Sem mais collabs por enquanto."}
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // UI FINAL
  // ==========================================
  return (
    <main className="feed-main">
      <div className="box big-box feed-box">
        <div className="feed-top">
          <div>
            <p className="feed-kicker">Para você</p>
            <h1 className="title" style={{ fontSize: 22 }}>
              Collabs recomendadas
            </h1>
          </div>
        </div>

        {/* CARD */}
        <div
          ref={cardRef}
          className="swipe-card tiktok-card"
          onMouseDown={(e) => {
            handleStart(e);
            handleTapStart(e);
          }}
          onTouchStart={(e) => {
            handleStart(e);
            handleTapStart(e);
          }}
          onMouseMove={handleMove}
          onTouchMove={handleMove}
          onMouseUp={(e) => {
            handleEnd(e);
            const target = e.target as HTMLElement;
            const t = target.closest(".open-profile") ? "open-profile" : undefined;
            handleTapEnd(e, current.userId, t);
          }}
          onTouchEnd={(e) => {
            handleEnd(e);
            const el = document.elementFromPoint(
              e.changedTouches[0].clientX,
              e.changedTouches[0].clientY
            ) as HTMLElement | null;
            const t = el?.closest(".open-profile") ? "open-profile" : undefined;
            handleTapEnd(e, current.userId, t);
          }}
        >
          <span className="swipe-tag">{current.tipo.toUpperCase()}</span>

          {/* HEADER */}
          <div className="swipe-header">
            <div className="swipe-avatar open-profile">
              {current.foto_url ? (
                <img src={current.foto_url} alt="foto" />
              ) : (
                <div className="swipe-avatar-fallback">
                  {current.usuario.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="swipe-header-info">
              <p className="swipe-user-name open-profile">
                {current.usuario}
                {current.is_pro && <span className="badge-pro">⭐ PRO</span>}
              </p>
              <p className="swipe-user-role">Artista</p>
            </div>
          </div>

          {/* BODY */}
          <div className="swipe-body">
            <h3 className="swipe-title">{current.titulo}</h3>
            <p className="swipe-meta">Estilo: {current.estilo}</p>
            {current.descricao && <p className="swipe-desc">{current.descricao}</p>}
          </div>

          {/* MEDIA */}
          <div className="media-area">
            {current.tipo === "video" ? (
              <div className="video-wrapper" style={{ position: "relative" }}>
                <video
                  ref={videoRef}
                  className="feed-video"
                  src={current.video_url || undefined}
                  muted={muted}
                  playsInline
                />

                {/* 🔇 BOTÃO DE MUTE DISCRETO */}
                <button
                  className="video-mute-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMuted((m) => !m);
                    if (videoRef.current)
                      videoRef.current.muted = !videoRef.current.muted;
                  }}
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    background: "rgba(0,0,0,0.4)",
                    borderRadius: "50%",
                    width: "34px",
                    height: "34px",
                    color: "#fff",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {muted ? "🔇" : "🔊"}
                </button>

                {/* 📊 BARRA DE PROGRESSO */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    height: "4px",
                    width: "100%",
                    background: "rgba(255,255,255,0.15)",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progress}%`,
                      background: "#9b5cff",
                      transition: "width 0.1s linear",
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                <audio
                  ref={audioRef}
                  src={current.audio_url || current.beat_url || undefined}
                />
                <div className="sound-waves">
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="swipe-actions">
          <button className="btn-circle btn-pass" onClick={() => swipe("pass")}>
            ✖
          </button>
          <button className="btn-circle btn-feat" onClick={() => swipe("like")}>
            🤝
          </button>
        </div>
      </div>
    </main>
  );
}
