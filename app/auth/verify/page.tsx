"use client";

import { supabase } from "../../../lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [erro, setErro] = useState("");

  async function handleCheckStatus() {
    setChecking(true);
    setErro("");

    // Atualiza o estado da sessão/auth
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      setErro("Erro ao verificar status. Tente novamente.");
      setChecking(false);
      return;
    }

    const user = data.user;

    // Se o usuário existir e estiver confirmado
    if (user && user.email_confirmed_at) {
      router.push("/auth/complete-profile");
      return;
    }

    // Se ainda não confirmou
    setErro("E-mail ainda não confirmado. Verifique sua caixa de entrada.");
    setChecking(false);
  }

  return (
    <main className="center-container">
      <div className="box">

        <h1 className="title">Verifique seu e-mail</h1>
        <p className="subtitle">
          Enviamos um link para confirmar sua conta.
        </p>

        {erro && <p className="error-text">{erro}</p>}

        <button onClick={handleCheckStatus} disabled={checking}>
          {checking ? "Verificando..." : "Já confirmei"}
        </button>

        <a className="link" href="/auth">Voltar ao login</a>

      </div>
    </main>
  );
}
