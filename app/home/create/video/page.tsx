"use client";

import { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CriarVideoPage() {
  const router = useRouter();

  const [video, setVideo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [estilo, setEstilo] = useState("");
  const [descricao, setDescricao] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // ==================================================
  // SELECT FILE
  // ==================================================
  function selecionarVideo(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setErro("Selecione um arquivo de vídeo válido.");
      return;
    }

    setVideo(file);
    setPreview(URL.createObjectURL(file));
    setErro("");
  }

  // ==================================================
  // SAVE VIDEO
  // ==================================================
  async function salvarVideo() {
    setErro("");

    if (!video) return setErro("Envie um vídeo.");
    if (!titulo.trim()) return setErro("Dê um título ao vídeo.");

    setLoading(true);

    // USER
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) {
      setErro("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    // UPLOAD
    const ext = video.name.split(".").pop();
    const filePath = `${u.user.id}-video-${Date.now()}.${ext}`;

    const { error: storageError } = await supabase.storage
      .from("videos")
      .upload(filePath, video);

    if (storageError) {
      setErro("Erro ao enviar o vídeo.");
      setLoading(false);
      return;
    }

    const videoURL = supabase.storage
      .from("videos")
      .getPublicUrl(filePath).data.publicUrl;

    // INSERT
    const { error: dbError } = await supabase.from("videos").insert({
      user_id: u.user.id,
      titulo,
      estilo,
      descricao,
      video_url: videoURL,
    });

    if (dbError) {
      console.log(dbError);
      setErro("Erro ao salvar no banco.");
      setLoading(false);
      return;
    }

    router.push("/home/feed");
  }

  // ==================================================
  // UI
  // ==================================================
  return (
    <main className="feed-main">
      <div className="box big-box feed-box">

        <div className="feed-top">
          <div>
            <p className="feed-kicker">Novo Vídeo</p>
            <h1 className="title" style={{ fontSize: 22 }}>Criar Vídeo</h1>
          </div>
        </div>

        {erro && <p className="error-text">{erro}</p>}

        {/* UPLOAD */}
        <div className="form-block" style={{ marginTop: 10 }}>
          <label className="upload-area">
            <input type="file" accept="video/*" onChange={selecionarVideo} />
            <span>🎥 Escolher vídeo</span>
          </label>
        </div>

        {preview && (
          <video
            src={preview}
            className="video-preview"
            controls
            style={{
              marginTop: "15px",
              width: "100%",
              borderRadius: "16px",
              background: "#000",
              maxHeight: "420px",
              objectFit: "cover"
            }}
          />
        )}

        {/* FORM */}
        <div className="form-block" style={{ marginTop: 20 }}>

          <input
            type="text"
            placeholder="Título do vídeo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <input
            type="text"
            placeholder="Estilo (Trap, Plug, Drill...)"
            value={estilo}
            onChange={(e) => setEstilo(e.target.value)}
          />

          <textarea
            placeholder="Descrição do vídeo"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <button disabled={loading} onClick={salvarVideo}>
            {loading ? "Enviando..." : "Publicar Vídeo"}
          </button>
        </div>
      </div>
    </main>
  );
}
