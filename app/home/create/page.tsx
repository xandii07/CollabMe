"use client";

import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();

  return (
    <main className="feed-main">
      <div className="box big-box feed-box create-box">

        {/* HEADER */}
        <div className="create-header">
          <p className="feed-kicker">Criar</p>
          <h1 className="title" style={{ fontSize: 22 }}>
            Escolha o que deseja publicar
          </h1>
        </div>

        {/* BOTÕES */}
        <div className="create-actions">
          <button
            className="btn-purple create-btn"
            onClick={() => router.push("/home/create/guia")}
          >
            🎤 Criar Guia
          </button>

          <button
            className="btn-purple create-btn"
            onClick={() => router.push("/home/create/beat")}
          >
            🎵 Criar Beat
          </button>

          <button
            className="btn-purple create-btn"
            onClick={() => router.push("/home/create/video")}
          >
            🎬 Criar Video
          </button>
        </div>

      </div>
    </main>
  );
}
