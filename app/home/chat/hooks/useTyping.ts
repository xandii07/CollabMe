"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

export function useTyping(matchId: string, userId: string) {
  const [isTyping, setIsTyping] = useState(false);

  function sendTyping() {
    supabase.channel("typing")
      .send({
        type: "broadcast",
        event: "typing",
        payload: { matchId, userId },
      });
  }

  useEffect(() => {
    const channel = supabase.channel("typing")
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.matchId === matchId && payload.payload.userId !== userId) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 1500);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { isTyping, sendTyping };
}
