"use server";

import { prisma } from "@/lib/prisma";
import { checkActiveQuiz } from "./checkActiveQuiz";

export const getUserQuestionAndAnswers = async (questionId: string) => {
  try {
    const activeQuiz = await checkActiveQuiz();

    if (activeQuiz?.isActive) {
      const userQuestionsCount = await prisma.userQuestion.count({
        where: {
          user_quizzes_id: activeQuiz.user_quizzes_id,
        },
      });

      const userQuestion = await prisma.userQuestion.findFirst({
        where: {
          user_quizzes_id: activeQuiz.user_quizzes_id,
          question_id: questionId,
        },
        select: {
          question_id: true,
          question_answered: true,
          question_text_kz: true,
          question_text_ru: true,
          question_type: true,
        },
      });

      const userAnswers = await prisma.userAnswer.findMany({
        where: {
          user_quizzes_id: activeQuiz.user_quizzes_id,
          question_id: questionId,
        },
        select: {
          answer_id: true,
          question_id: true,
          answer_text_kz: true,
          answer_text_ru: true,
          user_quizzes_id: true,
          isPicked: true,
        },
      });
      userAnswers.sort((a, b) => parseInt(a.answer_id) - parseInt(b.answer_id));

      if (userQuestionsCount && userQuestion && userAnswers) {
        return { userQuestionsCount, userQuestion, userAnswers };
      }
    }
    return null;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
