"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function ReelsPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const current = videos[index];

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    const { data } = await supabase
      .from("videos")
      .select(`
        *,
        profiles: user_id (nome, foto_url)
      `)
      .order("created_at", { ascending: false });

    setVideos(data || []);
  }

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.pause();
    videoRef.current.currentTime = 0;

    setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 250);
  }, [index]);

  function next() {
    if (index < videos.length - 1) setIndex(index + 1);
  }
  function prev() {
    if (index > 0) setIndex(index - 1);
  }

  if (!current) {
    return (
      <main className="center-container">
        <h1 className="title">Nenhum vídeo ainda.</h1>
      </main>
    );
  }

  return (
    <main
      className="reels-container"
      onClick={() => videoRef.current?.play()}
      onWheel={(e) => {
        if (e.deltaY > 0) next();
        else prev();
      }}
    >
      <video
        ref={videoRef}
        src={current.video_url}
        className="reels-video"
        playsInline
        muted={false}
        loop
      />

      <div className="reels-info">
        <p className="reels-title">{current.titulo}</p>
        <p className="reels-user">@{current.profiles?.nome}</p>
      </div>
    </main>
  );
}
