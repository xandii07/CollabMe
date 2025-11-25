"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CompleteProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState("");

  // Campos do perfil
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("artista");
  const [genero, setGenero] = useState("");
  const [cidade, setCidade] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [spotify, setSpotify] = useState("");

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/auth");
        return;
      }

      setUserId(data.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (profile) {
        router.push("/");
      }
    }

    check();
  }, []);

  async function handleSave() {
    setError("");
    setLoadingSave(true);

    try {
      const { error } = await supabase.from("profiles").insert({
        id: userId,
        nome,
        tipo,
        genero_principal: genero,
        cidade,
        bio,
        instagram,
        youtube,
        spotify,
      });

      if (error) throw error;

      router.push("/home");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingSave(false);
    }
  }

  return (
    <main className="center-container">
      <div className="box big-box">
        <h1 className="title">Complete seu perfil</h1>
        <p className="subtitle">Antes de entrar no app, finalize seus dados.</p>

        {error && <p className="error-text">{error}</p>}

        <div className="form">
          <input placeholder="Nome artístico" value={nome} onChange={(e) => setNome(e.target.value)} />

          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="artista">Artista</option>
            <option value="beatmaker">Beatmaker</option>
            <option value="produtor">Produtor</option>
            <option value="compositor">Compositor</option>
            <option value="instrumentista">Instrumentista</option>
          </select>

          <input placeholder="Gênero musical" value={genero} onChange={(e) => setGenero(e.target.value)} />

          <input placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />

          <textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />

          <input placeholder="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} />

          <input placeholder="YouTube" value={youtube} onChange={(e) => setYoutube(e.target.value)} />

          <input placeholder="Spotify" value={spotify} onChange={(e) => setSpotify(e.target.value)} />

          <button onClick={handleSave} disabled={loadingSave}>
            {loadingSave ? "Salvando..." : "Finalizar"}
          </button>
        </div>
      </div>
    </main>
  );
}
