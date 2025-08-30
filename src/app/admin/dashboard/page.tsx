"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import AdminSubscriptionsPage from "./SubScrib";
import AdminPage from "./Plan";

const page = () => {
  return (
    <div className=" w-full min-h-dvh justify-center items-center container mx-auto mt-14">
      <Tabs defaultValue="s" className=" w-full">
        <TabsList className=" w-full">
          <TabsTrigger value="s">Subscription</TabsTrigger>
          <TabsTrigger value="p">Plans</TabsTrigger>
        </TabsList>
        <TabsContent value="s">
          <AdminSubscriptionsPage />
        </TabsContent>
        <TabsContent value="p">
          <AdminPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default page;
