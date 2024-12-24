"use server";

import { auth } from "@/lib/auth/authConfig";
import { prisma } from "@/lib/prisma";

export const getResultRIASEC = async () => {
  try {
    const session = await auth();
    const uuid = session?.user?.id;

    if (uuid) {
      const lastResultForUser = await prisma.results.findFirst({
        where: {
          user_id: uuid,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (lastResultForUser) {
        const { R, I, A, S, E, C } = lastResultForUser;
        return { R, I, A, S, E, C };
      }
    }
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
