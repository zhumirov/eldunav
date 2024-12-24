import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

const ChatHelp = () => {
  return (
    <div className="mt-56 mx-5 flex flex-col ">
      <h2 className="text-[#171A1D] text-sm font-normal leading-4 text-center">
        Привет, я <span className="font-semibold">AI Chat!</span> Я тут чтобы
        помочь тебе узнать информацию о различных профессиях, вузах, грандах,
        стипендиях, и многое другое. Для начала работы выбери профессию.
      </h2>
      <p className="mt-6 mx-14 text-[#757575] text-xs font-normal leading-3 text-center">
        Диалог в чате ведется на основе выбранной вами профессии
      </p>

      <Dialog>
        <DialogTrigger className="mt-2.5 text-[#171A1D] text-xs font-medium leading-3 text-center">
          Подробнее..
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex flex-row gap-1.5 text-[#171A1D] text-base	font-semibold leading-4">
              <Image
                src="/icons/help-icon.svg"
                alt={"help-icon"}
                height={16}
                width={16}
              />
              Помощь
            </DialogTitle>
            <DialogDescription className="text-[#171A1D] text-[13px] font-medium leading-5 !mt-4">
              Чат фокусируется на профессии, которую вы выбрали. Чтобы начать
              обсуждение другой профессии необходимо сначала сменить выбор.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatHelp;
