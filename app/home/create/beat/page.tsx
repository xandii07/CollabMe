"use client";

import { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CriarBeatPage() {
  const router = useRouter();

  const [audio, setAudio] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [estilo, setEstilo] = useState("");
  const [bpm, setBpm] = useState("");
  const [humor, setHumor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("free");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function selecionarAudio(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      setErro("Selecione um arquivo de áudio válido.");
      return;
    }

    setAudio(file);
    setPreview(URL.createObjectURL(file));
    setErro("");
  }

  async function salvarBeat() {
    setErro("");

    if (!audio) return setErro("Envie um beat.");
    if (!titulo.trim()) return setErro("Dê um título ao beat.");

    setLoading(true);

    // PEGAR USUÁRIO
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) {
      setErro("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    // UPLOAD DO ÁUDIO
    const ext = audio.name.split(".").pop();
    const filePath = `${u.user.id}-beat-${Date.now()}.${ext}`;

    const { error: storageError } = await supabase.storage
      .from("audios")
      .upload(filePath, audio);

    if (storageError) {
      setErro("Erro ao enviar o beat.");
      setLoading(false);
      return;
    }

    const audioURL = supabase.storage
      .from("audios")
      .getPublicUrl(filePath).data.publicUrl;

    // SALVAR NO BD
    const { error: dbError } = await supabase.from("beats").insert({
      user_id: u.user.id,
      titulo,
      estilo,
      bpm,
      humor,
      preco,
      descricao,
      beat_url: audioURL,
    });

    if (dbError) {
      console.log(dbError);
      setErro("Erro ao salvar.");
      setLoading(false);
      return;
    }

    router.push("/home/feed");
  }

  return (
    <main className="feed-main">
      <div className="box big-box feed-box">

        {/* TÍTULO */}
        <h1 className="title" style={{ fontSize: 22, textAlign: "center" }}>
          Enviar Beat
        </h1>
        <p className="subtitle" style={{ marginTop: 4, textAlign: "center" }}>
          Faça upload do seu beat para vender ou colaborar
        </p>

        {erro && <p className="error-text">{erro}</p>}

        {/* UPLOAD */}
        <div className="form-block" style={{ marginTop: 20 }}>
          <label className="upload-area">
            <input
              type="file"
              accept="audio/*"
              onChange={selecionarAudio}
            />
            <span>🎧 Selecionar beat</span>
          </label>
        </div>

        {/* PLAYER DE PREVIEW */}
        {preview && (
          <audio
            controls
            src={preview}
            className="audio-preview"
          />
        )}

        {/* FORM */}
        <div className="form" style={{ marginTop: 20 }}>

          <input
            type="text"
            placeholder="Título do beat"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <input
            type="text"
            placeholder="Estilo (Trap, Plug, Drill...)"
            value={estilo}
            onChange={(e) => setEstilo(e.target.value)}
          />

          <input
            type="number"
            placeholder="BPM"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
          />

          <input
            type="text"
            placeholder="Humor (Dark, Agressivo, Triste...)"
            value={humor}
            onChange={(e) => setHumor(e.target.value)}
          />

          <textarea
            placeholder="Descrição do beat"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <select value={preco} onChange={(e) => setPreco(e.target.value)}>
            <option value="free">Free</option>
            <option value="20">R$ 20</option>
            <option value="50">R$ 50</option>
            <option value="100">R$ 100</option>
          </select>

          <button disabled={loading} onClick={salvarBeat}>
            {loading ? "Enviando..." : "Publicar Beat"}
          </button>
        </div>

      </div>
    </main>
  );
}
