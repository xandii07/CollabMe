"use client";

import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="welcome-container">
      <div className="welcome-content">

        <h1 className="welcome-logo">COLLABME</h1>
        <p className="welcome-subtitle">Encontre feats, beats e conexões reais.</p>

        <div className="welcome-buttons">

          {/* LOGIN → /auth */}
          <button
            className="btn-primary"
            onClick={() => router.push("/auth")}
          >
            Entrar
          </button>

          {/* SIGNUP → /auth/signup */}
          <button
            className="btn-secondary"
            onClick={() => router.push("/auth/signup")}
          >
            Criar Conta
          </button>

        </div>

      </div>

      <footer className="welcome-footer">
        © 2025 CollabMe — Todos os direitos reservados
      </footer>
    </div>
  );
}
