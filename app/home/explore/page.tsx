// app/home/explore/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

type TipoItem = "guia" | "beat";

interface ExploreItem {
  id: string;
  userId: string;
  tipo: TipoItem;
  titulo: string;
  estilo: string | null;
  bpm: number | null;
  descricao?: string | null;
  audio_url?: string | null;
  beat_url?: string | null;
  usuario: string;
  foto_url?: string | null;
  is_pro: boolean;
  created_at: string;
}

export default function ExplorePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ExploreItem[]>([]);

  // ======= FILTROS =======
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState<"all" | TipoItem>("all");
  const [estilo, setEstilo] = useState<"all" | string>("all");
  const [onlyPro, setOnlyPro] = useState(false);

  const [bpmMin, setBpmMin] = useState<string>("");
  const [bpmMax, setBpmMax] = useState<string>("");

  // estilos disponíveis, vindos do Supabase (via dados carregados)
  const estilosDisponiveis = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.estilo) set.add(it.estilo);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // ========= GUIAS =========
      const { data: guias } = await supabase
        .from("guias")
        .select(`
          id,
          user_id,
          titulo,
          estilo,
          bpm,
          descricao,
          audio_url,
          created_at,
          profiles: user_id (
            nome,
            foto_url,
            is_pro
          )
        `)
        .order("created_at", { ascending: false });

      // ========= BEATS =========
      const { data: beats } = await supabase
        .from("beats")
        .select(`
          id,
          user_id,
          titulo,
          estilo,
          bpm,
          descricao,
          beat_url,
          created_at,
          profiles: user_id (
            nome,
            foto_url,
            is_pro
          )
        `)
        .order("created_at", { ascending: false });

      const formattedGuias: ExploreItem[] =
        guias?.map((g: any) => ({
          id: g.id,
          userId: g.user_id,
          tipo: "guia",
          titulo: g.titulo,
          estilo: g.estilo,
          bpm: g.bpm ? Number(g.bpm) || null : null,
          descricao: g.descricao,
          audio_url: g.audio_url,
          beat_url: null,
          usuario: g.profiles?.nome || "Artista",
          foto_url: g.profiles?.foto_url || null,
          is_pro: g.profiles?.is_pro ?? false,
          created_at: g.created_at,
        })) || [];

      const formattedBeats: ExploreItem[] =
        beats?.map((b: any) => ({
          id: b.id,
          userId: b.user_id,
          tipo: "beat",
          titulo: b.titulo,
          estilo: b.estilo,
          bpm: b.bpm ? Number(b.bpm) || null : null,
          descricao: b.descricao,
          audio_url: null,
          beat_url: b.beat_url,
          usuario: b.profiles?.nome || "Beatmaker",
          foto_url: b.profiles?.foto_url || null,
          is_pro: b.profiles?.is_pro ?? false,
          created_at: b.created_at,
        })) || [];

      const all = [...formattedGuias, ...formattedBeats].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setItems(all);
    } catch (err) {
      console.error("Erro carregando Explore:", err);
    }

    setLoading(false);
  }

  // ======= APLICAÇÃO DOS FILTROS EM MEMÓRIA =======
  const filteredItems = useMemo(() => {
    const s = search.toLowerCase().trim();
    const bpmMinN = bpmMin ? Number(bpmMin) : null;
    const bpmMaxN = bpmMax ? Number(bpmMax) : null;

    return items.filter((it) => {
      if (tipo !== "all" && it.tipo !== tipo) return false;
      if (onlyPro && !it.is_pro) return false;

      if (estilo !== "all" && it.estilo !== estilo) return false;

      if (s) {
        const str =
          (it.titulo || "") +
          " " +
          (it.descricao || "") +
          " " +
          (it.estilo || "") +
          " " +
          (it.usuario || "");
        if (!str.toLowerCase().includes(s)) return false;
      }

      if (bpmMinN !== null || bpmMaxN !== null) {
        const bpm = it.bpm;
        if (bpm == null) return false;

        if (bpmMinN !== null && bpm < bpmMinN) return false;
        if (bpmMaxN !== null && bpm > bpmMaxN) return false;
      }

      return true;
    });
  }, [items, search, tipo, estilo, onlyPro, bpmMin, bpmMax]);

  if (loading) {
    return (
      <main className="center-container">
        <div className="box big-box feed-box">
          <p className="subtitle">Carregando biblioteca...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="explore-main">
      <div className="box big-box feed-box explore-box">
        {/* HEADER */}
        <div className="explore-header">
          <div>
            <p className="feed-kicker">Explorar</p>
            <h1 className="title" style={{ fontSize: 22 }}>
              Biblioteca de Guias & Beats
            </h1>
            <p className="subtitle" style={{ marginTop: 4 }}>
              Use os filtros para achar a vibe perfeita.
            </p>
          </div>

          <div className="explore-count">
            <span>{filteredItems.length}</span>
            <span>resultados</span>
          </div>
        </div>

        {/* FILTROS */}
        <div className="explore-filters">
          <input
            className="explore-input"
            placeholder="Buscar por título, artista, estilo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="explore-filters-row">
            <select
              className="explore-select"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
            >
              <option value="all">Guias & Beats</option>
              <option value="guia">Somente Guias</option>
              <option value="beat">Somente Beats</option>
            </select>

            <select
              className="explore-select"
              value={estilo}
              onChange={(e) => setEstilo(e.target.value as any)}
            >
              <option value="all">Todos os estilos</option>
              {estilosDisponiveis.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>

            <label className="explore-checkbox">
              <input
                type="checkbox"
                checked={onlyPro}
                onChange={(e) => setOnlyPro(e.target.checked)}
              />
              <span>Somente PRO</span>
            </label>
          </div>

          <div className="explore-filters-row">
            <div className="explore-bpm-group">
              <span className="explore-bpm-label">BPM</span>
              <input
                className="explore-input bpm-input"
                type="number"
                placeholder="mín"
                value={bpmMin}
                onChange={(e) => setBpmMin(e.target.value)}
              />
              <span className="explore-bpm-sep">–</span>
              <input
                className="explore-input bpm-input"
                type="number"
                placeholder="máx"
                value={bpmMax}
                onChange={(e) => setBpmMax(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* GRID DE CARDS */}
        {filteredItems.length === 0 ? (
          <p className="subtitle" style={{ marginTop: 24 }}>
            Nenhum resultado com esses filtros. Tente remover algum filtro ou
            buscar outro termo.
          </p>
        ) : (
          <div className="explore-grid">
            {filteredItems.map((item) => (
              <button
                key={`${item.tipo}-${item.id}`}
                className="explore-card"
                onClick={() => router.push(`/home/user/${item.userId}`)}
              >
                <span className="explore-tag">{item.tipo.toUpperCase()}</span>

                <div className="explore-card-header">
                  <div className="explore-avatar">
                    {item.foto_url ? (
                      <img src={item.foto_url} alt={item.usuario} />
                    ) : (
                      <div className="explore-avatar-fallback">
                        {item.usuario.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="explore-card-header-text">
                    <div className="explore-user-line">
                      <span className="explore-user-name">{item.usuario}</span>
                      {item.is_pro && (
                        <span className="badge-pro explore-badge-pro">
                          ⭐ PRO
                        </span>
                      )}
                    </div>
                    <span className="explore-user-role">
                      {item.tipo === "beat" ? "Beatmaker" : "Artista"}
                    </span>
                  </div>
                </div>

                <div className="explore-card-body">
                  <h3 className="explore-title">{item.titulo}</h3>

                  <div className="explore-meta-row">
                    {item.estilo && (
                      <span className="explore-pill">{item.estilo}</span>
                    )}
                    {item.bpm && (
                      <span className="explore-pill">{item.bpm} BPM</span>
                    )}
                  </div>

                  {item.descricao && (
                    <p className="explore-desc">{item.descricao}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
