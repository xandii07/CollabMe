"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function UploadVideoPage() {
  const router = useRouter();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [estilo, setEstilo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function handleVideoSelect(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setErro("Selecione um arquivo de vídeo válido.");
      return;
    }

    setVideoFile(file);
    setPreview(URL.createObjectURL(file));
    setErro("");
  }

  async function uploadVideo() {
    setErro("");

    if (!videoFile) {
      setErro("Selecione um vídeo.");
      return;
    }

    if (!titulo.trim()) {
      setErro("Digite um título.");
      return;
    }

    setLoading(true);

    // 1. pegar user
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) {
      setErro("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    const fileExt = videoFile.name.split(".").pop();
    const filePath = `${u.user.id}-${Date.now()}.${fileExt}`;

    // 2. upload no Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("videos")
      .upload(filePath, videoFile);

    if (storageError) {
      setErro("Erro ao enviar vídeo.");
      setLoading(false);
      return;
    }

    const videoURL = supabase.storage
      .from("videos")
      .getPublicUrl(filePath).data.publicUrl;

    // 3. salvar no banco
    const { error: dbError } = await supabase.from("videos").insert({
      user_id: u.user.id,
      titulo,
      estilo,
      descricao,
      video_url: videoURL,
    });

    if (dbError) {
      setErro("Erro ao salvar no banco.");
      setLoading(false);
      return;
    }

    router.push("/home/feed");
  }

  return (
    <main className="center-container">
      <div className="box big-box">
        <h1 className="title">Enviar Vídeo</h1>

        {erro && <p className="error-text">{erro}</p>}

        <input type="file" accept="video/*" onChange={handleVideoSelect} />

        {/* Preview */}
        {preview && (
          <video
            src={preview}
            controls
            className="feed-video"
            style={{ marginTop: "14px" }}
          />
        )}

        <div className="form">
          <input
            type="text"
            placeholder="Título do vídeo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <input
            type="text"
            placeholder="Estilo (trap, plug, drill...)"
            value={estilo}
            onChange={(e) => setEstilo(e.target.value)}
          />

          <textarea
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <button disabled={loading} onClick={uploadVideo}>
            {loading ? "Enviando..." : "Enviar vídeo"}
          </button>
        </div>
      </div>
    </main>
  );
}
