"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [generoPrincipal, setGeneroPrincipal] = useState("");
  const [cidade, setCidade] = useState("");
  const [bio, setBio] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return router.push("/auth");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (profile) {
      setNome(profile.nome || "");
      setTipo(profile.tipo || "");
      setGeneroPrincipal(profile.genero_principal || "");
      setCidade(profile.cidade || "");
      setBio(profile.bio || "");
      setPreview(profile.foto_url || null);
    }

    setLoading(false);
  }

  function selecionarFoto(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    setFoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function salvar() {
    setErro("");
    setSaving(true);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setErro("Usuário não autenticado.");
      setSaving(false);
      return;
    }

    let fotoUrl = preview;

    // upload de nova foto
    if (foto) {
      const ext = foto.name.split(".").pop();
      const filePath = `${auth.user.id}-avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, foto);

      if (uploadError) {
        setErro("Erro ao enviar foto.");
        setSaving(false);
        return;
      }

      fotoUrl = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath).data.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        nome,
        tipo,
        genero_principal: generoPrincipal,
        cidade,
        bio,
        foto_url: fotoUrl,
      })
      .eq("id", auth.user.id);

    if (error) {
      setErro("Erro ao salvar alterações.");
      setSaving(false);
      return;
    }

    router.push("/home/profile");
  }

  if (loading) {
    return (
      <main className="center-container">
        <div className="box big-box">
          <p className="subtitle">Carregando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="feed-main">
      <div className="box big-box feed-box">

        <h1 className="title" style={{ fontSize: 22, textAlign: "center" }}>
          Editar Perfil
        </h1>

        <p className="subtitle" style={{ marginTop: 4, textAlign: "center" }}>
          Atualize suas informações
        </p>

        {erro && <p className="error-text">{erro}</p>}

        {/* UPLOAD DE FOTO */}
        <div className="form-block" style={{ marginTop: 10 }}>
          <label className="upload-area">
            <input type="file" accept="image/*" onChange={selecionarFoto} />
            <span>📸 Selecionar foto</span>
          </label>

          {preview && (
            <img
              src={preview}
              alt="preview"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                margin: "14px auto 0",
                display: "block",
                border: "3px solid var(--primary)",
              }}
            />
          )}
        </div>

        {/* FORM */}
        <div className="form-block" style={{ marginTop: 22 }}>

          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            type="text"
            placeholder="Seu papel (Artista, Beatmaker...)"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          />

          <input
            type="text"
            placeholder="Estilo principal"
            value={generoPrincipal}
            onChange={(e) => setGeneroPrincipal(e.target.value)}
          />

          <input
            type="text"
            placeholder="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />

          <textarea
            placeholder="Sua bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <button disabled={saving} onClick={salvar}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </main>
  );
}
