"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "../auth/authConfig";
import { getQuestions } from "../methodic-data/getQuestionsServerAction";
import { getAnswers } from "../methodic-data/getAnswersServerAction";
import { redirect } from "next/navigation";

export const createUserQuiz = async () => {
  try {
    const session = await auth();
    const uuid = session?.user?.id;

    if (uuid) {
      const newUserQuiz = await prisma.userQuiz.create({
        data: {
          user_id: uuid,
          started: new Date(),
        },
      });

      const questions = await getQuestions();
      const answers = await getAnswers();

      if (newUserQuiz.user_quizzes_id && questions && answers) {
        await prisma.userQuestion.createMany({
          data: questions.map((question) => ({
            question_id: question.id.toString(),
            user_quizzes_id: newUserQuiz.user_quizzes_id,
            question_text_kz: question.text_kz,
            question_text_ru: question.question,
            question_type: question.question_type,
            riasec_code: question.question_group,
            updatedAt: new Date(),
          })),
        });

        await prisma.userAnswer.createMany({
          data: answers.map((answer) => ({
            answer_id: answer.id.toString(),
            question_id: answer.question_id,
            user_quizzes_id: newUserQuiz.user_quizzes_id,
            answer_text_kz: answer.answer_text_kz,
            answer_text_ru: answer.answer_text_ru,
            riasec_score: Number(answer.riasec_score),
          })),
        });
      }
    } else return null;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
