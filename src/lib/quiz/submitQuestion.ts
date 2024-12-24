"use server";

import { prisma } from "@/lib/prisma";
import { setResultRIASEC } from "../result/setResultRIASEC";
import { setUserProfessions } from "../result/setUserProfessions";
import { checkActiveQuiz } from "./checkActiveQuiz";

export const submitQuestion = async (
  isLastQuiz: boolean,
  quizPageId: string,
  currentAnswers: {
    answer_id: string;
    isPicked: boolean;
    user_quizzes_id: string;
  }[]
): Promise<{ success: boolean; message: string }> => {
  try {
    const activeQuiz = await checkActiveQuiz();
    await prisma.userQuestion.updateMany({
      where: {
        user_quizzes_id: activeQuiz?.user_quizzes_id,
        question_id: quizPageId,
      },
      data: {
        question_answered: true,
      },
    });

    for (const answer of currentAnswers) {
      await prisma.userAnswer.updateMany({
        where: {
          answer_id: answer.answer_id,
          user_quizzes_id: answer.user_quizzes_id,
        },
        data: {
          isPicked: answer.isPicked,
        },
      });
    }

    if (isLastQuiz && activeQuiz) {
      setResultRIASEC(activeQuiz?.user_quizzes_id).then(async (result) => {
        if (result) {
          await setUserProfessions(result);
        }
      });
    }

    await prisma.userQuiz.update({
      where: {
        user_quizzes_id: activeQuiz?.user_quizzes_id,
      },
      data: {
        current_question: isLastQuiz
          ? Number(quizPageId)
          : Number(quizPageId) + 1,
        finished: isLastQuiz ? new Date() : null,
        isActive: isLastQuiz ? false : true,
      },
    });

    return { success: true, message: "Updated successfully" };
  } catch (err) {
    return { success: false, message: "Error updating" };
  } finally {
    await prisma.$disconnect();
  }
};
