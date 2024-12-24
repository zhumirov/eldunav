"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { submitQuestion } from "@/lib/quiz/submitQuestion";
import { useRouter } from "next/navigation";

type QuizPageProps = {
  questionData: {
    userQuestionsCount: number;
    userQuestion: {
      question_id: string;
      question_answered: boolean;
      question_text_kz: string;
      question_text_ru: string;
      question_type: string;
    };
    userAnswers: Array<{
      answer_id: string;
      question_id: string;
      user_quizzes_id: string;
      answer_text_kz: string;
      answer_text_ru: string;
      isPicked: boolean;
    }>;
  } | null;
};

const QuizPage: React.FC<QuizPageProps> = ({ questionData }) => {
  const t = useTranslations("QuizPage");
  const locale = useLocale();
  const router = useRouter();
  const currentQuestion = Number(questionData?.userQuestion?.question_id);
  const [currentAnswers, setCurrentAnswers] = useState(
    questionData?.userAnswers.map((item) => ({
      answer_id: item.answer_id,
      isPicked: item.isPicked,
      user_quizzes_id: item.user_quizzes_id,
    }))
  );

  const isLastQuiz = currentQuestion === questionData?.userQuestionsCount;

  const handleSubmit = async () => {
    if (questionData?.userQuestion?.question_id && currentAnswers) {
      await submitQuestion(
        isLastQuiz,
        questionData?.userQuestion?.question_id,
        currentAnswers
      ).then(() => {
        if (isLastQuiz) {
          router.push("/result");
        } else {
          router.push(`/quiz/${currentQuestion + 1}`);
        }
      });
    }
  };

  return (
    <div className="p-4 w-full flex flex-col items-center">
      <div className="w-full flex justify-between mt-4">
        <Link
          href={currentQuestion !== 1 ? `/quiz/${currentQuestion - 1}` : "/"}
        >
          <Image
            src="/icons/arrow-back.svg"
            alt={t("arrowBack")}
            height={24}
            width={24}
          />
        </Link>

        <div className="flex gap-1 items-center">
          <Image
            src="/icons/logo.svg"
            alt={t("quizTitle")}
            height={24}
            width={24}
          />
          <h1 className="text-sm text-[#171A1D] font-semibold">
            {t("quizTitle")}
          </h1>
        </div>

        <Link href="/">
          <Image
            src="/icons/close-button.svg"
            alt={t("closeButton")}
            height={24}
            width={24}
          />
        </Link>
      </div>

      <div className="bg-[#212121] text-white w-fit text-xs font-semibold p-2.5 rounded-lg mt-4">
        {questionData?.userQuestion.question_id} /
        {questionData?.userQuestionsCount ?? 0} {" " + t("questionCounter")}
      </div>

      <div className="mt-10 w-full flex flex-col items-center">
        <h1 className="text-xl font-semibold text-center">
          {locale === "kz" && questionData?.userQuestion.question_text_kz}
          {locale === "ru" && questionData?.userQuestion.question_text_ru}
        </h1>

        <form
          onSubmit={(e) => {}}
          className="mt-10 w-full flex flex-col items-center"
        >
          <RadioGroup
            className="flex flex-col w-full"
            onValueChange={(value) => {
              setCurrentAnswers((prevAnswers) =>
                prevAnswers?.map((answer) => ({
                  ...answer,
                  isPicked: answer.answer_id === value,
                }))
              );
            }}
            value={currentAnswers?.find((a) => a.isPicked)?.answer_id}
          >
            {questionData?.userAnswers.map((answer) => (
              <div
                key={answer.answer_id}
                className="bg-[#F1F4F8] flex gap-2.5 p-[17px_13px] rounded-lg items-center"
              >
                <RadioGroupItem
                  value={answer.answer_id}
                  id={answer.answer_id}
                />
                <label
                  htmlFor={answer.answer_id}
                  className="text-sm font-medium"
                >
                  {questionData.userAnswers.find(
                    (a) => a.answer_id === answer.answer_id
                  )?.answer_text_ru || "Answer"}
                </label>
              </div>
            ))}
          </RadioGroup>

          <Button className="m-10" type="button" onClick={handleSubmit}>
            {currentQuestion === questionData?.userQuestionsCount
              ? "Завершить тест"
              : "Дальше"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default QuizPage;
