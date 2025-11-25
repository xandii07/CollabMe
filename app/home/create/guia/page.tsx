"use client";

import { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CriarGuiaPage() {
  const router = useRouter();

  const [audio, setAudio] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [estilo, setEstilo] = useState("");
  const [bpm, setBpm] = useState("");
  const [descricao, setDescricao] = useState("");
  const [procura, setProcura] = useState("feat");

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

  async function salvarGuia() {
    setErro("");

    if (!audio) return setErro("Você precisa enviar um áudio.");
    if (!titulo.trim()) return setErro("Dê um título para a guia.");

    setLoading(true);

    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) {
      setErro("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    const ext = audio.name.split(".").pop();
    const filePath = `${u.user.id}-guia-${Date.now()}.${ext}`;

    const { error: storageError } = await supabase.storage
      .from("guias")
      .upload(filePath, audio);

    if (storageError) {
      setErro("Erro ao enviar o áudio.");
      setLoading(false);
      return;
    }

    const audioURL = supabase.storage
      .from("guias")
      .getPublicUrl(filePath).data.publicUrl;

    const { error: dbError } = await supabase.from("guias").insert({
      user_id: u.user.id,
      titulo,
      estilo,
      bpm,
      descricao,
      procura,
      audio_url: audioURL,
    });

    if (dbError) {
      setErro("Erro ao salvar no banco.");
      setLoading(false);
      return;
    }

    router.push("/home/feed");
  }

  return (
    <main className="feed-main">
      <div className="box big-box feed-box">
        
        <h1 className="title" style={{ fontSize: 22, textAlign: "center" }}>
          Criar Guia
        </h1>

        <p className="subtitle" style={{ marginTop: 4, textAlign: "center" }}>
          Envie sua demo vocal
        </p>

        {erro && <p className="error-text">{erro}</p>}

        <div className="form-block">
          <label className="upload-area">
            <input type="file" accept="audio/*" onChange={selecionarAudio} />
            <span>🎤 Selecionar áudio</span>
          </label>

          {preview && (
            <audio
              controls
              src={preview}
              className="audio-preview"
            />
          )}

          <input
            className="form-input"
            type="text"
            placeholder="Título da guia"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <input
            className="form-input"
            type="text"
            placeholder="Estilo (Trap, Funk, Plugg...)"
            value={estilo}
            onChange={(e) => setEstilo(e.target.value)}
          />

          <input
            className="form-input"
            type="number"
            placeholder="BPM (opcional)"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
          />

          <textarea
            className="form-input"
            placeholder="Descrição da guia / letra"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <select
            className="form-input"
            value={procura}
            onChange={(e) => setProcura(e.target.value)}
          >
            <option value="feat">Procurando feat</option>
            <option value="beat">Procurando beat</option>
            <option value="produtor">Procurando produtor</option>
            <option value="instrumentista">Procurando instrumentista</option>
            <option value="remix">Procurando remix</option>
          </select>

          <button
            className="btn-purple"
            onClick={salvarGuia}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Publicar Guia"}
          </button>
        </div>
      </div>
    </main>
  );
}
