"use server";
import { prisma } from "@/lib/prisma";

export const setChatMessages = async (
  chatId: string,
  userMessage: string,
  assistantMessage: string
) => {
  try {
    if (chatId && userMessage && assistantMessage) {
      await prisma.chatMessages.createMany({
        data: [
          {
            chat_id: chatId,
            role: "user",
            text: userMessage,
          },
          {
            chat_id: chatId,
            role: "assistant",
            text: assistantMessage,
          },
        ],
      });
    }
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
