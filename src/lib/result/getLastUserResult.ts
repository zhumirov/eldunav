import { PrismaClient } from "@prisma/client";
import { auth } from "../auth/authConfig";

const prisma = new PrismaClient();

export const getLastUserResult = async () => {
  try {
    const session = await auth();
    const uuid = session?.user?.id;

    if (uuid) {
      const lastResult = await prisma.results.findFirst({
        where: {
          user_id: uuid,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          R: true,
          I: true,
          A: true,
          S: true,
          E: true,
          C: true,
          UserProfessions: {
            select: {
              occupation_id: true,
              name: true,
              percent: true,
            },
          },
        },
      });
      return lastResult;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
