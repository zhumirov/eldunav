import ResultPage from "./_ResultPage";
import { getLastUserResult } from "@/lib/result/getLastUserResult";

const Result = async () => {
  const userResult = await getLastUserResult();

  return <ResultPage userResult={userResult as any} />;
};

export default Result;
