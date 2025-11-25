// src/types.ts

export type UserRole =
  | "artista"
  | "beatmaker"
  | "produtor"
  | "compositor"
  | "instrumentista";

export type Plano = "free" | "pro" | "studio";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: UserRole;
  foto?: string;
  bio?: string;
  genero_principal?: string;
  cidade?: string;
  instagram?: string;
  youtube?: string;
  spotify?: string;
  plano: Plano;
  data_criacao: string; // ISO
}

export type ProcuraGuia =
  | "feat"
  | "produtor"
  | "beat"
  | "remix"
  | "instrumentista";

export interface Guia {
  id: string;
  usuario_id: string;
  audio_url: string;
  titulo: string;
  estilo: string;
  bpm?: number;
  procura: ProcuraGuia[];
  descricao?: string;
  created_at: string;
}

export interface Beat {
  id: string;
  usuario_id: string;
  beat_url: string;
  titulo: string;
  estilo: string;
  bpm?: number;
  preco?: number;
  tipo_licenca?: "free" | "lease" | "exclusiva";
  humor?: string;
  created_at: string;
}

export type ItemTipo = "guia" | "beat";

export interface Swipe {
  id: string;
  usuario_id: string; // quem deu o swipe
  item_id: string; // guia ou beat
  tipo_item: ItemTipo;
  escolha: "like" | "dislike";
  data: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  item_id: string;
  tipo_item: ItemTipo;
  data: string;
}

export interface ChatMessage {
  id: string;
  match_id: string;
  sender_id: string;
  mensagem: string;
  data: string;
}

export type SplitStatus = "pendente" | "aceito";

export interface SplitContrato {
  id: string;
  match_id: string;
  porcentagem_user1: number;
  porcentagem_user2: number;
  status_user1: SplitStatus;
  status_user2: SplitStatus;
  pdf_url?: string;
}
