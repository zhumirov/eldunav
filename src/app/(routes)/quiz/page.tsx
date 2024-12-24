import { redirect } from "next/navigation";

import UserProfile from "@/app/(routes)/profile/_ProfilePage";
import { checkActiveQuiz } from "@/lib/quiz/checkActiveQuiz";
import { User } from "@prisma/client";
import { createUserQuiz } from "@/lib/quiz/createUserQuiz";

import { getUserInfo } from "@/lib/profile/getUserInfo";

const Quiz = async () => {
  const userData = await getUserInfo();
  const activeQuiz = await checkActiveQuiz();
  const missingFieldsInfo = ["name", "grade", "age", "phoneNumber"].some(
    (field) => {
      return userData?.[field as keyof User] == null;
    }
  );

  if (missingFieldsInfo) {
    return <UserProfile type="quiz" />;
  }

  if (!activeQuiz) {
    await createUserQuiz();
    redirect("/quiz/1");
  } else {
    redirect(`/quiz/${activeQuiz.current_question} `);
  }
};

export default Quiz;
