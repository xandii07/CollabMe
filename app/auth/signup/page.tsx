"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setErro("");
  
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
  
    setLoading(true);
  
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: `${location.origin}/auth/complete-profile`,
        },
      });
  
      if (error) throw error;
  
      router.push("/auth/verify");
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }
  

  return (
    <main className="center-container">
      <div className="box">
        <h1 className="title">Criar conta</h1>
        <p className="subtitle">Use seu e-mail para começar</p>

        {erro && <p className="error-text">{erro}</p>}

        <div className="form">
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />

          <button onClick={handleSignup} disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </div>

        <a className="link" href="/auth">
          Já tem conta? Entrar
        </a>
      </div>
    </main>
  );
}
