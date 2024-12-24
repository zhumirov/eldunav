import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatHistoryProps {
  userChats?: {
    chat_id: string;
    chat_title: string;
  }[];
}

const ChatHistory = ({ userChats }: ChatHistoryProps) => {
  return (
    <Sheet>
      <SheetTrigger>
        <Image
          src="/icons/menu-icon.svg"
          alt={"menu-icon"}
          height={24}
          width={24}
        />
      </SheetTrigger>

      <SheetContent
        closeIcon={
          <Image
            src="/icons/menu-icon.svg"
            alt={"menu-icon"}
            height={24}
            width={24}
          />
        }
        side={"right"}
        className="!p-0 !box-border"
      >
        <SheetHeader className="px-4 mt-8">
          <SheetTitle>
            <p className="text-sm text-[#171A1D] font-bold">
              Smart Bolashaq AI chat
            </p>
          </SheetTitle>
        </SheetHeader>
        <SheetDescription></SheetDescription>

        <div className="px-4 mt-8">
          <div
            className="w-full h-10 flex gap-2 p-2.5 items-center bg-[#F5F5F5] rounded-lg "
            cmdk-input-wrapper=""
          >
            <Image
              src="/icons/search-icon.svg"
              alt={"search-icon"}
              height={20}
              width={20}
            />
            <Input
              placeholder="Поиск чата"
              className={
                "flex w-full !border-transparent bg-transparent  text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              }
            />
          </div>
        </div>

        <h3 className="text-[#A5AAB3] text-sm leading-4 mt-7 px-4">Чаты</h3>

        <ScrollArea className="h-full">
          <ul className="flex-1 ">
            {userChats?.map((chat) => (
              <Link
                key={chat.chat_id}
                href={`/chat/${chat.chat_id}`}
                className="block p-4 rounded-lg bg-white hover:bg-gray-100"
              >
                {chat.chat_title}
              </Link>
            ))}
          </ul>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ChatHistory;
