"use client";

import { useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";

export function useRealtimeChat(matchId: string, onNewMessage: (msg: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${matchId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        onNewMessage(payload.new);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [matchId]);
}
