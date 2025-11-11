"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import AdminSubscriptionsPage from "./SubScrib";
import AdminPage from "./Plan";
import AdminDashboard from "./AdminDashboard";
import UserManagementDashboard from "./UserManagementDashboard";
import ImageUploadPage from "./ImageMng";
import TermsAndConditionsDashboard from "./TermsAndConditionsDashboard";
import PrivacyPolicyDashboard from "./Privacy-policy";

const page = () => {
  return (
    <div className=" w-full min-h-dvh justify-center items-center container mx-auto mt-14">
      <Tabs defaultValue="s" className=" w-full">
        <TabsList className=" w-full">
          <TabsTrigger value="s">Subscription</TabsTrigger>
          <TabsTrigger value="p">Plans</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="k">Title</TabsTrigger>
          <TabsTrigger value="upload">Images</TabsTrigger>
          <TabsTrigger value="terms&con">Terms&Con</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        <TabsContent value="s">
          <AdminSubscriptionsPage />
        </TabsContent>
        <TabsContent value="p">
          <AdminPage />
        </TabsContent>
        <TabsContent value="user">
          <UserManagementDashboard />
        </TabsContent>
        <TabsContent value="k">
          <AdminDashboard />
        </TabsContent>
        <TabsContent value="upload">
          <ImageUploadPage />
        </TabsContent>
        <TabsContent value="terms&con">
          <TermsAndConditionsDashboard />
        </TabsContent>
        <TabsContent value="privacy">
          <PrivacyPolicyDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default page;
