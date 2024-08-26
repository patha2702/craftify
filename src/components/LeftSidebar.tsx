// components/LeftSidebar.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Layout, Type, Image, Navigation, PlusCircle, Component } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";

interface LeftSidebarProps {
  addElement: (type: string) => void;
  addPage: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ addElement, addPage }) => {
  return (
    <div className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col items-center py-3">
        <div className="mb-4">
          <img
            src="/assets/images/logo.png"
            alt="Logo"
            className="w-10 h-10 bg-transparent"
          />
        </div>
        <Button variant="ghost" size="icon" onClick={() => addElement("layout")}>
          <Layout className="h-6 w-6 dark:text-gray-300" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => addElement("text")}>
          <Type className="h-6 w-6 dark:text-gray-300" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => addElement("image")}>
          <Image className="h-6 w-6 dark:text-gray-300" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => addElement("nav")}>
          <Navigation className="h-6 w-6 dark:text-gray-300" />
        </Button>
        <Button variant="ghost" size="icon" onClick={addPage}>
          <PlusCircle className="h-6 w-6 dark:text-gray-300" />
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Component className="h-6 w-6 dark:text-gray-300" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Component</SheetTitle>
              <SheetDescription>
                Drag and drop components onto the canvas
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full mb-2"
                {...useSortable({ id: "hero" }).listeners}
                {...useSortable({ id: "hero" }).attributes}
              >
                Hero Section
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default LeftSidebar;