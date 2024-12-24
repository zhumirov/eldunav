import { getUserChat } from "@/lib/chat/getUserChat";
import ChatIdPage from "./_ChatIdPage";

const ChatId = async ({ params }: { params: any }) => {
  const { chatId } = await params;
  const chatData = await getUserChat(chatId);

  return <ChatIdPage chatData={chatData as any} />;
};

export default ChatId;
