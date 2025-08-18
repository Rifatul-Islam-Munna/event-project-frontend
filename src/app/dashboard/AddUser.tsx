"use client";
import { CreateGuestForm } from "@/components/custom/events/create-guest-form";
import { UploadCsvForm } from "@/components/custom/events/upload-csv-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, UserPlus } from "lucide-react";
import React, { useState } from "react";

const AddUser = () => {
  const [isCreateGuestModalOpen, setIsCreateGuestModalOpen] = useState(false);
  return (
    <Dialog
      open={isCreateGuestModalOpen}
      onOpenChange={setIsCreateGuestModalOpen}
    >
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="mr-2 h-4 w-4" /> Add Guest
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border border-border bg-background">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add New Guest(s)
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Manually add a guest or upload a CSV file for bulk import.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="manual" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 border-b border-border bg-transparent rounded-none p-0 h-auto">
            <TabsTrigger
              value="manual"
              className="flex items-center gap-2 data-[state=active]:border-t-0 data-[state=active]:border-l-0 data-[state=active]:border-r-0    text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-[hsl(185_70%_40%)] rounded-none py-3 px-4"
            >
              <UserPlus className="h-4 w-4" /> Manual Entry
            </TabsTrigger>
            <TabsTrigger
              value="csv"
              className="flex items-center data-[state=active]:border-t-0 data-[state=active]:border-l-0 data-[state=active]:border-r-0  gap-2 text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-[hsl(185_70%_40%)] rounded-none py-3 px-4"
            >
              <Upload className="h-4 w-4" /> Upload CSV
            </TabsTrigger>
          </TabsList>
          <TabsContent value="manual" className="mt-4">
            <CreateGuestForm
              onAddGuest={() => {}}
              onClose={() => setIsCreateGuestModalOpen(false)}
            />
          </TabsContent>
          <TabsContent value="csv" className="mt-4">
            <UploadCsvForm onClose={() => setIsCreateGuestModalOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddUser;
