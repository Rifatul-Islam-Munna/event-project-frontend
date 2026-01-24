import React from "react";
import { CreateTemplateDialog } from "./CreateTemplateDialog";
import { TemplatesList } from "./TemplatesList";

const AdminTemplatePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-lime-600/30 to-lime-700/50 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Template Manager
              </h1>
              <p className="mt-2  text-gray-700">
                Manage your template collection from one place
              </p>
            </div>
            <CreateTemplateDialog />
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TemplatesList />
      </div>
    </div>
  );
};

export default AdminTemplatePage;
