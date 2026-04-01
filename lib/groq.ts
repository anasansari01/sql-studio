import Groq from "groq-sdk";

let client: Groq | null = null;

export function getGroqClient(): Groq {
  if (!client) {
    client = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });
  }
  return client;
}