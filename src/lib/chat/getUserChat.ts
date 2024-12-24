"use server";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getUserChat = unstable_cache(async (chatId: string) => {
  try {
    if (chatId) {
      const userChat = await prisma.userChats.findUnique({
        where: {
          chat_id: chatId,
        },
        select: {
          chat_id: true,
          chat_title: true,
          profession_id: true,
          ChatMessages: {
            select: {
              role: true,
              text: true,
            },
          },
        },
      });
      return userChat;
    } else return null;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
});
