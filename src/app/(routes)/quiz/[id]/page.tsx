import { getUserQuestionAndAnswers } from "@/lib/quiz/getUserQuestionAndAnswers";
import QuizPage from "./_QuizPage";

const QuizId = async ({ params }: { params: any }) => {
  const { id } = await params;
  const questionData = await getUserQuestionAndAnswers(id);

  return <QuizPage questionData={questionData} />;
};

export default QuizId;
