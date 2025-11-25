// app/home/chat/[matchId]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";

interface MatchData {
  id: string;
  user1_id: string;
  user2_id: string;
  other_user_id: string;
  other_name: string;
  other_avatar?: string | null;
}

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  media_type: "image" | "audio" | null;
  created_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params?.matchId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // =========================
  // 1. Carregar user + match
  // =========================
  useEffect(() => {
    if (!matchId) return;
    init();
  }, [matchId]);

  async function init() {
    // pegar usuário logado
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.push("/auth");
      return;
    }

    const uid = auth.user.id;
    setUserId(uid);

    // pegar dados do match + outro usuário (join com profiles)
    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .select(
        `
        id,
        user1_id,
        user2_id,
        user1: user1_id ( id, nome, foto_url ),
        user2: user2_id ( id, nome, foto_url )
      `
      )
      .eq("id", matchId)
      .maybeSingle();

    if (matchError || !matchData) {
      console.log("Erro ao carregar match:", matchError);
      router.push("/home");
      return;
    }

    const isUser1 = matchData.user1_id === uid;
    const other = isUser1 ? matchData.user2 : matchData.user1;

    const matchFormatted: MatchData = {
      id: matchData.id,
      user1_id: matchData.user1_id,
      user2_id: matchData.user2_id,
      other_user_id: other?.id,
      other_name: other?.nome || "Artista",
      other_avatar: other?.foto_url || null,
    };

    setMatch(matchFormatted);

    // carregar mensagens iniciais
    await loadMessages(matchId);

    // realtime
    subscribeToMessages(matchId);

    setLoading(false);
  }

  async function loadMessages(matchId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });

    if (error) {
      console.log("Erro ao carregar mensagens:", error);
      return;
    }

    setMessages(data as Message[]);
  }

  function subscribeToMessages(matchId: string) {
    const channel = supabase
      .channel(`messages-match-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    // cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }

  // =========================
  // 2. Scroll sempre pro fim
  // =========================
  useEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =========================
  // 3. Enviar mensagem
  // =========================
  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!userId || !match) return;
    if (!newMessage.trim() && !file) return;

    setSending(true);

    let media_url: string | null = null;
    let media_type: "image" | "audio" | null = null;

    // 3.1 upload do arquivo (se tiver)
    if (file) {
      try {
        const ext = file.name.split(".").pop();
        const isAudio = file.type.startsWith("audio/");
        const isImage = file.type.startsWith("image/");

        media_type = isAudio ? "audio" : isImage ? "image" : null;

        const path = `${match.id}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const BUCKET = "chat-media"; // 🔥 TROQUE se seu bucket tiver outro nome!

        const { error: upError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file);

        if (upError) {
          console.log("Erro upload arquivo:", upError);
        } else {
          const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
          media_url = data.publicUrl;
        }
      } catch (err) {
        console.log("Erro ao tratar arquivo:", err);
      }
    }

    const contentToSend = newMessage.trim() || null;

    // 3.2 inserir mensagem
    const { data: inserted, error: msgError } = await supabase
      .from("messages")
      .insert({
        match_id: match.id,
        sender_id: userId,
        content: contentToSend,
        media_url,
        media_type,
      })
      .select()
      .single();

    if (msgError) {
      console.log("Erro ao enviar mensagem:", msgError);
      setSending(false);
      return;
    }

    // 3.3 atualizar últimos dados no match
    const lastText =
      contentToSend ||
      (media_type === "image"
        ? "📷 Foto"
        : media_type === "audio"
        ? "🎵 Áudio"
        : "");

    await supabase
      .from("matches")
      .update({
        last_message: lastText,
        last_message_time: inserted.created_at,
      })
      .eq("id", match.id);

    // limpar campos
    setNewMessage("");
    setFile(null);
    const inputFile = document.getElementById(
      "chat-file-input"
    ) as HTMLInputElement | null;
    if (inputFile) inputFile.value = "";

    setSending(false);
  }

  // =========================
  // 4. Helpers e UI
  // =========================
  function handleBack() {
    router.push("/home/chat"); // lista de conversas
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading || !match || !userId) {
    return (
      <main className="center-container">
        <div className="box big-box">
          <p className="subtitle">Carregando chat...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="center-container">
      <div className="box big-box chat-shell">
        {/* HEADER */}
        <header className="chat-header">
          <button className="chat-back" onClick={handleBack}>
            ◀
          </button>

          <div className="chat-header-user">
            <div className="chat-avatar">
              {match.other_avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={match.other_avatar} alt={match.other_name} />
              ) : (
                <div className="chat-avatar-fallback">
                  {match.other_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <p className="chat-title">{match.other_name}</p>
              <p className="chat-status">Conectado via feat 🎤</p>
            </div>
          </div>
        </header>

        {/* CORPO DO CHAT */}
        <section className="chat-body">
          <div className="chat-messages">
            {messages.map((msg) => {
              const isMe = msg.sender_id === userId;
              const hasText = !!msg.content;
              const hasMedia = !!msg.media_url;

              return (
                <div
                  key={msg.id}
                  className={`chat-bubble ${isMe ? "me" : "them"}`}
                >
                  {/* MÍDIA */}
                  {hasMedia && msg.media_type === "image" && (
                    <div className="chat-media-wrapper">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.media_url as string}
                        alt="imagem enviada"
                        className="chat-image"
                      />
                    </div>
                  )}

                  {hasMedia && msg.media_type === "audio" && (
                    <div className="chat-media-wrapper">
                      <audio
                        controls
                        src={msg.media_url as string}
                        className="chat-audio"
                      />
                    </div>
                  )}

                  {/* TEXTO */}
                  {hasText && <p className="chat-text">{msg.content}</p>}

                  {/* HORA */}
                  <span className="chat-time">{formatTime(msg.created_at)}</span>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </section>

        {/* INPUT */}
        <form className="chat-input-row" onSubmit={handleSend}>
          <label className="chat-upload-btn">
            📎
            <input
              id="chat-file-input"
              type="file"
              accept="image/*,audio/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
              }}
            />
          </label>

          <input
            className="chat-input"
            placeholder={
              file
                ? "Arquivo pronto, escreva algo (opcional)..."
                : "Digite sua mensagem..."
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />

          <button
            type="submit"
            className="chat-send-btn"
            disabled={sending || (!newMessage.trim() && !file)}
          >
            {sending ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </main>
  );
}
