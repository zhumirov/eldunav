"use server";

import OpenAI from "openai";
import { generatePrompt } from "@/lib/chat/openAI/promptGenerator";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  organization: process.env.OPENAI_ORGANIZATION || "",
});

export const chatAI = async (
  messages: Array<ChatCompletionMessageParam>,
  data: any
) => {
  try {
    if (messages) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
      });
      console.log(data);
      if (completion) {
        console.log(completion);
      }

      //   console.log(completion.choices[0].message);
    }
  } catch (error) {
    throw error;
  } finally {
  }
};
