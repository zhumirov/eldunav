"use server";

import { auth } from "@/lib/auth/authConfig";
import { prisma } from "@/lib/prisma";

export const setUserChat = async (
  professionId: string,
  professionName: string
) => {
  try {
    const session = await auth();
    const uuid = session?.user?.id;

    if (uuid && professionId) {
      const newChat = await prisma.userChats.create({
        data: {
          user_id: uuid,
          profession_id: professionId,
          chat_title: professionName,
        },
        select: {
          chat_id: true,
        },
      });

      return newChat.chat_id;
    }
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
