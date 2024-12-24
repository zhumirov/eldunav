import { generatePrompt } from "@/lib/chat/openAI/promptGenerator";
import { setUserChat } from "@/lib/chat/setUserChat";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, professionId } = await req.json();
  console.log("----------------"+JSON.stringify(messages));
  const generatedPrompt = await generatePrompt(professionId);
  console.log(generatedPrompt);
  // messages.unshift({"role":"system", "content": ge})
  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
    system: generatedPrompt,
  });

  return result.toDataStreamResponse();
}