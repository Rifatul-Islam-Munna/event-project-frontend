import { TemplatesList } from "@/app/admin/dashboard/template/TemplatesList";
import { Sparkles } from "lucide-react";
import React from "react";

const ExplorePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-lime-50 to-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-lime-600 to-lime-700 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Discover Templates</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Our Templates
            </h1>

            <p className="text-lg text-lime-50">
              Browse through our curated collection of professionally designed
              templates
            </p>
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TemplatesList isEdit={true} isDelete={true} />
      </div>
    </div>
  );
};

export default ExplorePage;
