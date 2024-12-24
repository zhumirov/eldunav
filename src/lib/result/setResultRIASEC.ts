"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "../auth/authConfig";

interface ResultScores {
  R: number;
  I: number;
  A: number;
  S: number;
  E: number;
  C: number;
}

type RIASECCode = keyof ResultScores;

export const setResultRIASEC = async (userQuizId: string) => {
  try {
    const session = await auth();
    const uuid = session?.user?.id;
    const userAnswers = await prisma.userAnswer.findMany({
      where: { user_quizzes_id: userQuizId, isPicked: true },
      include: { userQuiz: { include: { userQuestions: true } } },
    });

    const resultScores: ResultScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

    userAnswers.forEach(({ riasec_score, question_id, userQuiz }) => {
      const userQuestion = userQuiz.userQuestions.find(
        (q) => q.question_id === question_id
      );
      const riasecCode = userQuestion?.riasec_code as RIASECCode | undefined;
      if (riasecCode && Object.keys(resultScores).includes(riasecCode)) {
        resultScores[riasecCode as RIASECCode] += riasec_score * 5;
      }
    });

    if (uuid) {
      const result = await prisma.results.create({
        data: {
          user_id: uuid,
          quiz_id: userQuizId,
          R: resultScores.R,
          I: resultScores.I,
          A: resultScores.A,
          S: resultScores.S,
          E: resultScores.E,
          C: resultScores.C,
        },
      });

      return result;
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
