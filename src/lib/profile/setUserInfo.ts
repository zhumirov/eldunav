"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/authConfig";

export const setUserInfo = async (formData: FormData) => {
  try {
    const session = await auth();
    const uuid = session?.user?.id;

    if (uuid) {
      const name = formData.get("name")?.toString();
      const grade = formData.get("grade")?.toString();
      const age = formData.get("age")?.toString();
      const phoneNumber = formData.get("phoneNumber")?.toString();

      await prisma.user.update({
        where: { id: uuid },
        data: {
          name,
          grade,
          age,
          phoneNumber,
        },
      });
    }
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
