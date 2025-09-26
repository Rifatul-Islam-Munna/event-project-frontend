"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  GripVertical,
  Palette,
  TreePine,
  Utensils,
  DoorClosed as Door,
  Volume2,
  Search,
} from "lucide-react";
import { decorativeCategories, decorativeItems } from "@/lib/DecoratorData";
import Image from "next/image";
// Define categories with icons

interface DecorativeDrawerProps {
  onAddDecorativeItem: () => void;
}

export function DecorativeDrawer({
  onAddDecorativeItem,
}: DecorativeDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("decor");
  const [isOpen, setIsOpen] = useState(false);

  const handleDragStart = (event: React.DragEvent, item: any) => {
    event.dataTransfer.setData("decorativeItemId", item.id);
    event.dataTransfer.setData("decorativeItemLabel", item.label);
    event.dataTransfer.setData("decorativeItemImage", item.imageUrl);
    event.dataTransfer.setData("decorativeItemWidth", item.width.toString());
    event.dataTransfer.setData("decorativeItemHeight", item.height.toString());
    event.dataTransfer.effectAllowed = "copy";

    // Close drawer when drag starts
    onAddDecorativeItem();
    setIsOpen(false);
  };

  const currentCategory =
    decorativeCategories[selectedCategory as keyof typeof decorativeCategories];
  const filteredItems = currentCategory.items.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full mb-2 flex items-center gap-2 shadow-none"
        >
          <Palette className="h-4 w-4" />
          Add Decorations
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Decorative Items
          </DrawerTitle>
          <DrawerDescription>
            Select a category and drag items to your layout
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search decorative items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {Object.entries(decorativeCategories).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          {/* Items Grid */}
          <ScrollArea className="h-64">
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="p-3 cursor-grab shadow-none hover:shadow-sm transition-all border-gray-100  active:scale-95"
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, item)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12  rounded-lg flex items-center justify-center overflow-hidden ">
                      <Image
                        src={
                          decorativeItems.find(
                            (i) => i.label.trim() === item.label.trim()
                          )?.imageUrl.src || ""
                        }
                        alt={item.label}
                        className="max-w-full max-h-full object-contain"
                        draggable={false}
                        width={item.width}
                        height={item.height}
                      />
                    </div>
                    <div className="text-xs text-center font-medium leading-tight text-gray-700">
                      {item.label}
                    </div>
                    <GripVertical className="w-3 h-3 text-gray-400" />
                  </div>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No items found</p>
              </div>
            )}
          </ScrollArea>

          {/* Category Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <currentCategory.icon className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                {currentCategory.label}
              </span>
              <Badge variant="secondary" className="text-xs">
                {filteredItems.length} items
              </Badge>
            </div>
            <p className="text-xs text-blue-700">
              Drag and drop items onto your layout to add them
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
