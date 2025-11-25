// src/mockData.ts
import { Usuario, Guia, Beat, Plano } from "./types";

export const usuarios: Usuario[] = [
  {
    id: "u1",
    nome: "MC Flow",
    email: "mcflow@example.com",
    tipo: "artista",
    foto: "https://i.pravatar.cc/150?img=1",
    bio: "Trap melódico, vibes tipo Kayblack / Ryu.",
    genero_principal: "Trap",
    cidade: "São Paulo - SP",
    instagram: "@mcflow",
    plano: "free",
    data_criacao: new Date().toISOString(),
  },
  {
    id: "u2",
    nome: "BeatPlug",
    email: "beatplug@example.com",
    tipo: "beatmaker",
    foto: "https://i.pravatar.cc/150?img=2",
    bio: "Beats plug, rage e afrotrap.",
    genero_principal: "Trap",
    cidade: "Rio de Janeiro - RJ",
    instagram: "@beatplug",
    plano: "pro",
    data_criacao: new Date().toISOString(),
  },
];

export const guias: Guia[] = [
  {
    id: "g1",
    usuario_id: "u1",
    audio_url: "#", // depois trocamos
    titulo: "Refrão melódico triste",
    estilo: "Trap",
    bpm: 140,
    procura: ["beat", "produtor", "feat"],
    descricao: "Guias estilo Kayblack, tema amor e superação.",
    created_at: new Date().toISOString(),
  },
];

export const beats: Beat[] = [
  {
    id: "b1",
    usuario_id: "u2",
    beat_url: "#",
    titulo: "Plug triste 140bpm",
    estilo: "Trap Plug",
    bpm: 140,
    preco: 150,
    tipo_licenca: "lease",
    humor: "triste",
    created_at: new Date().toISOString(),
  },
];
