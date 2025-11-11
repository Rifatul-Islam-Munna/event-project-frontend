"use client";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  Scale,
  Lock,
  RefreshCw,
  Ban,
  UserCheck,
  CreditCard,
  Globe,
  Mail,
} from "lucide-react";
import { getAllTermsAndConditions } from "@/actions/fetch-action";

export default function TermsAndConditions() {
  // Fetch terms and conditions from API
  const {
    data: termsResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["terms-and-conditions"],
    queryFn: () => getAllTermsAndConditions("terms"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const termsData = termsResponse?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/30 to-orange-50/20">
      {/* Header Section */}
      <div className="w-full py-16 md:py-20 bg-gradient-to-r from-orange-500 to-red-600">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FileText className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Please read these terms carefully before using our services
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 text-white/80 text-sm">
            <span>Last Updated: {new Date().toLocaleDateString()}</span>
            <div className="w-1 h-1 bg-white/60 rounded-full"></div>
            <span>Effective Date: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="container mx-auto px-4 md:px-6 max-w-5xl py-12">
        <div className="bg-orange-50/60 border-2 border-orange-200/50 rounded-2xl p-6 md:p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                Important Notice
              </h2>
              <p className="text-slate-700 leading-relaxed">
                By accessing or using our Digital Seating Arrangement platform,
                you agree to be bound by these Terms and Conditions. If you do
                not agree with any part of these terms, you must not use our
                services. These terms constitute a legally binding agreement
                between you and our company.
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-2 border-orange-600/30 border-t-orange-600 rounded-full animate-spin"></div>
            <p className="ml-4 text-slate-600">
              Loading terms and conditions...
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-900 mb-2">
              Error Loading Terms
            </h3>
            <p className="text-red-700">
              Unable to load terms and conditions. Please try again later.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && termsData?.length === 0 && (
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-12 text-center">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Terms Available
            </h3>
            <p className="text-slate-600">
              Terms and conditions are currently being updated.
            </p>
          </div>
        )}

        {/* Terms Sections */}
        {!isLoading && !isError && termsData?.length > 0 && (
          <div className="space-y-8">
            {termsData?.map((section: any, index: number) => (
              <div
                key={section?._id || index}
                className="bg-white border-2 border-slate-200/60 rounded-2xl p-6 md:p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                      {index + 1}. {section?.title || "Untitled Section"}
                    </h3>
                  </div>
                </div>

                <ul className="space-y-3 ml-16">
                  {section?.items?.map((item: string, itemIndex: number) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-slate-700 leading-relaxed">
                        {item || ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Acceptance Footer */}
        {!isLoading && !isError && termsData?.length > 0 && (
          <>
            <div className="mt-12 bg-gradient-to-br from-orange-50/80 via-red-50/80 to-orange-50/80 border-2 border-orange-200/40 rounded-2xl p-8">
              <div className="text-center max-w-3xl mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Scale className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Agreement & Acceptance
                </h3>
                <p className="text-slate-700 leading-relaxed mb-6">
                  By clicking "I Accept" or by continuing to use our services,
                  you acknowledge that you have read, understood, and agree to
                  be bound by these Terms and Conditions. If you have any
                  questions or concerns, please contact our support team before
                  proceeding.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/50">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-slate-700">
                      Legally Binding Agreement
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/50">
                    <Globe className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-slate-700">
                      Applicable Worldwide
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-8 text-center p-6 rounded-2xl bg-slate-50 border border-slate-200/50">
              <p className="text-slate-600 text-sm">
                Questions about these terms?{" "}
                <a
                  href="/contact"
                  className="text-orange-600 hover:text-orange-700 font-semibold underline"
                >
                  Contact our legal team
                </a>{" "}
                or email us at{" "}
                <a
                  href="mailto:legal@example.com"
                  className="text-orange-600 hover:text-orange-700 font-semibold"
                >
                  legal@example.com
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
