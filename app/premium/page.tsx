"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function PremiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro")
      .eq("id", data.user.id)
      .maybeSingle();

    setIsPro(profile?.is_pro ?? false);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="feed-main">
        <div className="feed-box">
          <p className="subtitle">Carregando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="feed-main">
      <div className="feed-box premium-box">

        {/* Cabeçalho da página */}
        <div className="premium-top">
          <div>
            <p className="feed-kicker">Premium</p>
            <h1 className="title" style={{ fontSize: 24 }}>
              Planos CollabMe
            </h1>
            <p className="subtitle" style={{ marginTop: 4 }}>
              Escolha o plano ideal para seu ritmo.
            </p>
          </div>
        </div>

        {/* Planos */}
        <div className="premium-plans">
          {/* FREE */}
          <div className="plan-card">
            <span className="plan-badge">GRATIS</span>
            <h3 className="plan-title">Plano Free</h3>
            <p className="plan-price">R$ 0 / mês</p>

            <ul className="plan-list">
              <li>Até 20 uploads (Guias/Beats/Vídeos)</li>
              <li>Aparece no Feed</li>
              <li>Explorar completo</li>
              <li>Perfil público</li>
              <li>Mensagens limitadas</li>
            </ul>

            {isPro ? (
              <button className="btn-secondary" disabled>
                Você é PRO
              </button>
            ) : (
              <button className="btn-secondary" onClick={() => router.push("/home")}>
                Continuar usando grátis
              </button>
            )}
          </div>

          {/* PRO */}
          <div className="plan-card plan-pro">
            <span className="plan-badge plan-badge-pro">PRO</span>
            <h3 className="plan-title">Plano Pro</h3>
            <p className="plan-price">R$ 19,90 / mês</p>

            <ul className="plan-list">
              <li>Uploads ilimitados</li>
              <li>Selo PRO no perfil</li>
              <li>Destaque no Feed</li>
              <li>Mais alcance no Explorar</li>
              <li>Mensagens ilimitadas</li>
              <li>Maior prioridade no algoritmo</li>
            </ul>

            {isPro ? (
              <button className="btn-primary" disabled>
                Você já é PRO ✨
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={() => alert("Pagamento PRO será integrado aqui")}
              >
                Assinar PRO
              </button>
            )}
          </div>
        </div>

        <button className="premium-back-btn btn-secondary" onClick={() => router.back()}>
          Voltar
        </button>
      </div>
    </main>
  );
}
