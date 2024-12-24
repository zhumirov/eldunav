import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessages } from "@prisma/client";

interface UserChats {
  user_id: string;
  profession_id: string;
  chat_title: string;
  ChatMessages: ChatMessages[];
}

interface ChatIdPageProps {
  chatData: UserChats | null;
}

const ChatIdPage: React.FC<ChatIdPageProps> = ({ chatData }) => {
  return (
    <div className="relative h-full w-full flex-1 flex flex-col ">
      <div className="w-full flex justify-between px-4 my-8">
        <Link href="/chat">
          <Image
            src="/icons/arrow-back.svg"
            alt={"arrow-back"}
            height={24}
            width={24}
          />
        </Link>
        <div className="flex gap-1 items-center">
          <h1 className="text-sm text-[#171A1D] font-bold">
            Smart Bolashaq AI chat
          </h1>
        </div>

        <Popover>
          <PopoverTrigger>
            <Image
              src="/icons/more-button.svg"
              alt={"more-button"}
              height={24}
              width={24}
            />
          </PopoverTrigger>
          <PopoverContent
            withOverlay
            side="left"
            sideOffset={-20}
            align={"start"}
            className="!w-fit !flex !flex-col !p-0 !rounded-xl"
          >
            <Button
              variant={"ghost"}
              size={"icon"}
              className="pt-4 pb-3 pr-6 pl-4"
            >
              <Image
                src="/icons/edit-button.svg"
                alt={"edit-button.svg"}
                height={24}
                width={24}
              />
              Действие 1
            </Button>
            <Button
              variant={"ghost"}
              size={"icon"}
              className="text-[#F44336] pt-3 pb-4 pr-6 pl-4"
            >
              <Image
                src="/icons/delete-button.svg"
                alt={"delete-button.svg"}
                height={24}
                width={24}
              />
              Удалить чат
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {chatData?.ChatMessages && (
        <ScrollArea className="flex-1 px-4 flex gap-2">
          {chatData.ChatMessages.map((m, index) => (
            <div
              key={index}
              className={`whitespace-pre-wrap text-sm font-normal items-start mb-8 ${
                m.role === "user"
                  ? "bg-[#F5F5F5] rounded-lg p-3 ml-20"
                  : "flex gap-2"
              }`}
            >
              {m.role === "user" ? (
                ""
              ) : (
                <Image
                  src="/icons/ai-icon.svg"
                  alt={"ai-icon"}
                  height={24}
                  width={24}
                />
              )}
              {m.text}
            </div>
          ))}
        </ScrollArea>
      )}
    </div>
  );
};

export default ChatIdPage;
