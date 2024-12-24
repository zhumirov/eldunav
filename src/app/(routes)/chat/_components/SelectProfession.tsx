"use client";

import React, { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserProfessions } from "@prisma/client";

interface SelectProfessionProps {
  userProfessions?: UserProfessions[];
  onSelectProfession: (profession: UserProfessions) => void;
}

const items = [
  {
    id: "Технические",
    label: "Технические",
  },
  {
    id: "Педагогические",
    label: "Педагогические",
  },
  {
    id: "Юридические",
    label: "Юридические",
  },
  {
    id: "Медицинские",
    label: "Медицинские",
  },
  {
    id: "Экономические",
    label: "Экономические",
  },
  {
    id: "Творческие",
    label: "Творческие",
  },
] as const;

const SelectProfession: React.FC<SelectProfessionProps> = ({
  userProfessions,
  onSelectProfession,
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const categories = [
    "Автомеханик",
    "Архитектор",
    "Веб-программист",
    "Горнорабочий",
    "Инженер",
    "Конструктор ",
    "Механик",
    "Программист",
    "Радиоинженер",
    "Автомеханик",
    "Архитектор",
    "Веб-программист",
    "Горнорабочий",
    "Инженер",
    "Конструктор ",
    "Механик",
    "Программист",
    "Радиоинженер",
  ];

  const FormSchema = z.object({
    items: z.array(z.string()),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: [],
    },
  });

  const handleCategoryClick = (profession: UserProfessions) => {
    onSelectProfession(profession);
    setIsSheetOpen(false);
  };

  const selectedFilters = form.watch("items");

  const handleRemoveFilter = (filter: string) => {
    const updatedFilters = selectedFilters.filter((item) => item !== filter);
    form.setValue("items", updatedFilters);
  };

  function onSubmit(data: z.infer<typeof FormSchema>) {
    //TODO onSubmit
    console.log(data);
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger className=" mt-11 flex flex-row gap-1.5 text-[#171A1D] text-[13px] font-medium leading-4 text-center border rounded-3xl p-3">
        <Image
          src="/icons/message-search.svg"
          alt="message-search"
          height={16}
          width={16}
        />
        Выбрать профессию
      </SheetTrigger>

      <SheetContent side={"bottom"} className="max-h-[80vh]">
        <SheetHeader>
          <SheetTitle>Профессии</SheetTitle>
        </SheetHeader>
        <SheetDescription></SheetDescription>

        <div className="flex flex-row gap-4 justify-between my-4">
          <div
            className="w-full flex gap-2 items-center border-b"
            cmdk-input-wrapper=""
          >
            <Image
              src="/icons/search-icon.svg"
              alt={"search-icon"}
              height={21}
              width={20}
            />
            <Input
              placeholder="Поиск профессии"
              className={
                "flex w-full !border-transparent bg-transparent  text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              }
            />
          </div>

          <Drawer>
            <DrawerTrigger>
              <Image
                className="max-w-fit"
                src="/icons/filter-button.svg"
                alt={"filter-button"}
                height={32}
                width={32}
              />
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="grid grid-cols-3 items-center pb-4 pt-3">
                <div></div>
                <DrawerTitle className="text-center text-[#171A1D] text-base font-semibold">
                  Фильтр
                </DrawerTitle>
                <div
                  onClick={() => form.reset()}
                  className="text-right text-[#171A1D] text-xs cursor-pointer font-normal"
                >
                  Сбросить
                </div>
              </DrawerHeader>

              <Tabs defaultValue="directions" className="">
                <TabsList>
                  <TabsTrigger value="directions">По направлениям</TabsTrigger>
                  <TabsTrigger value="subjects">По предметам</TabsTrigger>
                </TabsList>

                <TabsContent value="directions">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-8"
                    >
                      <FormField
                        control={form.control}
                        name="items"
                        render={() => (
                          <FormItem>
                            {items.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="items"
                                render={({ field }) => {
                                  return (
                                    <>
                                      <FormItem
                                        key={item.id}
                                        className="flex flex-row  justify-between py-4 items-center"
                                      >
                                        <FormLabel className="font-normal">
                                          {item.label}
                                        </FormLabel>
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              item.id
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...field.value,
                                                    item.id,
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) =>
                                                        value !== item.id
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                      </FormItem>
                                      <div className="border-t border-[#E3E6EB]"></div>
                                    </>
                                  );
                                }}
                              />
                            ))}
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </TabsContent>
                <TabsContent value="subjects">
                  <Accordion type="single" collapsible defaultValue="item-1">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-sm font-semibold">
                        Профильный предмет 1
                      </AccordionTrigger>
                      <AccordionContent>
                        <RadioGroup defaultValue="comfortable">
                          <div className="flex flex-row  justify-between py-2 items-center">
                            <Label htmlFor="r1">Биология</Label>
                            <RadioGroupItem value="default" id="r1" />
                          </div>
                          <div className="border-t border-[#E3E6EB]"></div>
                          <div className="flex flex-row  justify-between py-2 items-center">
                            <Label htmlFor="r2">Всемирная история</Label>
                            <RadioGroupItem value="comfortable" id="r2" />
                          </div>
                          <div className="border-t border-[#E3E6EB]"></div>
                          <div className="flex flex-row  justify-between py-2 items-center">
                            <Label htmlFor="r3">География</Label>
                            <RadioGroupItem value="compact" id="r3" />
                          </div>
                        </RadioGroup>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-sm font-semibold">
                        Профильный предмет 2
                      </AccordionTrigger>
                      <AccordionContent>
                        <RadioGroup defaultValue="comfortable">
                          <div className="flex flex-row  justify-between py-2 items-center">
                            <Label htmlFor="r1">Биология</Label>
                            <RadioGroupItem value="default" id="r1" />
                          </div>
                          <div className="border-t border-[#E3E6EB]"></div>
                          <div className="flex flex-row  justify-between py-2 items-center">
                            <Label htmlFor="r2">Всемирная история</Label>
                            <RadioGroupItem value="comfortable" id="r2" />
                          </div>
                          <div className="border-t border-[#E3E6EB]"></div>
                          <div className="flex flex-row  justify-between py-2 items-center">
                            <Label htmlFor="r3">География</Label>
                            <RadioGroupItem value="compact" id="r3" />
                          </div>
                        </RadioGroup>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
              </Tabs>
              <DrawerClose asChild>
                <Button variant={"secondary"} className="!my-7" type="submit">
                  Применить
                </Button>
              </DrawerClose>
            </DrawerContent>
          </Drawer>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {selectedFilters.length > 0 &&
              selectedFilters.map((filter) => (
                <div
                  key={filter}
                  className="flex gap-1 items-center border border-[border-[#E3E6EB]] px-2 py-1.5 text-sm rounded-full"
                >
                  <Image
                    onClick={() => handleRemoveFilter(filter)}
                    className="max-w-fit"
                    src="/icons/cancel-square.svg"
                    alt={"filter-button"}
                    height={32}
                    width={32}
                  />
                  <p className="font-medium">{filter}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-[#6F7581] text-sm font-normal">
            Рекомендуемые профессии
          </h3>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {userProfessions?.map((profession, index) => (
              <Badge
                key={index}
                onClick={() => handleCategoryClick(profession)}
              >
                {profession.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-[#171A1D] text-base font-semibold leading-4 ">
            Выберите профессию
          </h3>

          <ScrollArea className="h-[200px] w-full mt-6">
            <div className="flex flex-wrap gap-1.5 ">
              {categories.map((prof, index) => (
                <Badge key={index} onClick={() => {}} variant="secondary">
                  {prof}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SelectProfession;
