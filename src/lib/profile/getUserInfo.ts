"use server";

import { auth } from "@/lib/auth/authConfig";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

export const getUserInfo = async () => {
  try {
    const session = await auth();
    const uuid = session?.user?.id;

    if (uuid) {
      const user = await prisma.user.findUnique({
        where: { id: uuid },
      });
      return user as User;
    }
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
