import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const requestSchema = z.object({
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  voice: z.enum(["warm", "energetic", "calm"]),
});

const voiceProfiles = {
  warm: {
    id: "EXAVITQu4vr4xnSDxMaL",
    settings: { stability: 0.56, similarity_boost: 0.78, style: 0.34 },
  },
  energetic: {
    id: "CwhRBWXzGAHq8TQ4Fs17",
    settings: { stability: 0.4, similarity_boost: 0.76, style: 0.58 },
  },
  calm: {
    id: "JBFqnCBsd6RMkjVDRZzb",
    settings: { stability: 0.72, similarity_boost: 0.78, style: 0.18 },
  },
} as const;

function formatTime(hour: number, minute: number) {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

export const Route = createFileRoute("/api/elevenlabs/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["ELEVENLABS_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { error: "ElevenLabs is not connected to this app." },
            { status: 503 },
          );
        }

        let input: z.infer<typeof requestSchema>;
        try {
          input = requestSchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid voice request." }, { status: 400 });
        }

        const profile = voiceProfiles[input.voice];
        const text = `Good morning! It is currently ${formatTime(input.hour, input.minute)}. Wishing you a wonderful and productive day ahead! You've got this!`;
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${profile.id}?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                ...profile.settings,
                use_speaker_boost: true,
                speed: 0.96,
              },
            }),
          },
        );

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`ElevenLabs request failed [${response.status}]: ${errorBody}`);
          return Response.json(
            { error: `Voice generation failed [${response.status}]: ${errorBody}` },
            { status: response.status },
          );
        }

        return new Response(response.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});