"use server";

import { prisma } from "@/lib/prisma";
import { Results } from "@prisma/client";
import { getProfessions } from "@/lib/methodic-data/getProfessionsServerAction";

export const setUserProfessions = async (userResult: Results) => {
  try {
    const { R, I, A, S, E, C } = userResult;

    const professions = await getProfessions(R, I, A, S, E, C);

    const userProfessionsData = professions.map((profession) => ({
      result_id: userResult.result_id,
      name: profession.name,
      percent: profession.score,
      occupation_id: profession.job_id,
    }));

    await prisma.$transaction(
      userProfessionsData.map((data) =>
        prisma.userProfessions.create({
          data,
        })
      )
    );

    console.log("User professions have been set successfully.");
  } catch (error) {
    console.error("Error setting user professions:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
