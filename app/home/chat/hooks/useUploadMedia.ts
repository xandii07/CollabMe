"use client";

import { supabase } from "../../../../lib/supabaseClient";

export async function uploadMedia(file: File) {
  const ext = file.name.split(".").pop();
  const filePath = `${Date.now()}-${Math.random()}.${ext}`;

  let bucket = "chat-images"; // default

  if (file.type.startsWith("audio/")) {
    bucket = "chat-audios";
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    console.log(error);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return {
    url: data.publicUrl,
    type: bucket === "chat-images" ? "image" : "audio",
  };
}
