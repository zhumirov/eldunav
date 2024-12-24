import React from "react";
import ChatPage from "./_ChatPage";
import { getLastUserResult } from "@/lib/result/getLastUserResult";
import { getUsesAllChat } from "@/lib/chat/getUsesAllChat";

const Chat: React.FC = async () => {
  const userResult = await getLastUserResult();
  const userChats = await getUsesAllChat();

  return (
    <ChatPage
      userChats={userChats as any}
      userProfessions={userResult?.UserProfessions as any}
    />
  );
};

export default Chat;
