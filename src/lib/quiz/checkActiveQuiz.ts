"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "../auth/authConfig";

export const checkActiveQuiz = async () => {
  try {
    const session = await auth();
    const uuid = session?.user?.id;

    if (uuid) {
      const activeQuiz = await prisma.userQuiz.findFirst({
        where: {
          user_id: uuid,
          isActive: true,
        },
        select: {
          isActive: true,
          user_quizzes_id: true,
          current_question: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return activeQuiz;
    }
    return null;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
