"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft, Search, Phone, Mail, Globe, Facebook, Loader2 } from "lucide-react";
import { getVendorCategory, getGlobalVendorsByCategory, VendorCategory } from "@/actions/vendor-category-actions";

export default function VendorListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: categoryData } = useQuery({
    queryKey: ["vendor-category"],
    queryFn: getVendorCategory,
  });
  const vendorCategory = categoryData?.data as VendorCategory | undefined;
  
  const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
  const categoryName = pathParts[pathParts.length - 1] || "";
  const decodedCategory = categoryName ? decodeURIComponent(categoryName) : "";

  const { data: vendorsData, isLoading } = useQuery({
    queryKey: ["global-vendors-by-category", decodedCategory, page],
    queryFn: () => getGlobalVendorsByCategory(decodedCategory, page, limit),
    enabled: !!decodedCategory,
  });

  const vendors = vendorsData?.data?.data || [];
  const total = vendorsData?.data?.total || 0;
  const totalPages = vendorsData?.data?.totalPages || 1;

  const categoryInfo = vendorCategory?.category.find(c => c.name === decodedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <div className="flex items-center gap-4">
            {categoryInfo?.logo ? (
              <img 
                src={categoryInfo.logo} 
                alt={decodedCategory}
                className="w-12 h-12 rounded object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-gray-500" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{decodedCategory}</h1>
              <p className="text-sm text-gray-500">{total} vendors available</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No vendors found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <div key={vendor._id} className="border border-gray-200 bg-white rounded-lg p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {vendor.logo ? (
                      <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{vendor.name}</h3>
                    {vendor.shortDescription && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{vendor.shortDescription}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {vendor.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  {vendor.phone && (
                    <a 
                      href={`tel:${vendor.phone}`}
                      className="flex-1 py-2 text-center text-sm bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                    >
                      Contact
                    </a>
                  )}
                  {vendor.website && (
                    <a 
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 text-center text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      Website
                    </a>
                  )}
                  {vendor.facebookLink && (
                    <a 
                      href={vendor.facebookLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 text-center text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Facebook className="h-3 w-3" />
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}