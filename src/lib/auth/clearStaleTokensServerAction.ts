"use server";

import { prisma } from "@/lib/prisma";

export const clearStaleTokens = async () => {
  try {
    await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    throw error;
  }
};
