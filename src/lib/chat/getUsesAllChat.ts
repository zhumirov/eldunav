"use server";

import { auth } from "@/lib/auth/authConfig";
import { prisma } from "@/lib/prisma";

export const getUsesAllChat = async () => {
  try {
    const session = await auth();
    const uuid = session?.user?.id;

    if (uuid) {
      const userChats = await prisma.userChats.findMany({
        where: {
          user_id: uuid,
        },
        select: {
          chat_id: true,
          chat_title: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (userChats) {
        return userChats;
      }
    } else return null;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
