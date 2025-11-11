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

export default function PrivacyPolicy() {
  // Fetch privacy policy from API
  const {
    data: privacyResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["privacy-policy"],
    queryFn: () => getAllTermsAndConditions("privacy"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const privacyData = privacyResponse?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20">
      {/* Header Section */}
      <div className="w-full py-16 md:py-20 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Please read our privacy policy to understand how we protect your
            data
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
        <div className="bg-blue-50/60 border-2 border-blue-200/50 rounded-2xl p-6 md:p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                Important Notice
              </h2>
              <p className="text-slate-700 leading-relaxed">
                By accessing or using our Digital Seating Arrangement platform,
                you agree to this Privacy Policy. We are committed to protecting
                your personal information and your right to privacy. If you have
                any questions or concerns about our policy, please contact us.
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="ml-4 text-slate-600">Loading privacy policy...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-900 mb-2">
              Error Loading Privacy Policy
            </h3>
            <p className="text-red-700">
              Unable to load privacy policy. Please try again later.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && privacyData?.length === 0 && (
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-12 text-center">
            <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Privacy Policy Available
            </h3>
            <p className="text-slate-600">
              Privacy policy is currently being updated.
            </p>
          </div>
        )}

        {/* Privacy Sections */}
        {!isLoading && !isError && privacyData?.length > 0 && (
          <div className="space-y-8">
            {privacyData?.map((section: any, index: number) => (
              <div
                key={section?._id || index}
                className="bg-white border-2 border-slate-200/60 rounded-2xl p-6 md:p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
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
                      <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
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
        {!isLoading && !isError && privacyData?.length > 0 && (
          <>
            <div className="mt-12 bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-blue-50/80 border-2 border-blue-200/40 rounded-2xl p-8">
              <div className="text-center max-w-3xl mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Your Privacy Matters
                </h3>
                <p className="text-slate-700 leading-relaxed mb-6">
                  By continuing to use our services, you acknowledge that you
                  have read and understood this Privacy Policy. We are committed
                  to protecting your data and respecting your privacy rights. If
                  you have any questions or concerns, please contact our privacy
                  team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/50">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-slate-700">
                      Your Data Protected
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/50">
                    <Globe className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">
                      GDPR Compliant
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-8 text-center p-6 rounded-2xl bg-slate-50 border border-slate-200/50">
              <p className="text-slate-600 text-sm">
                Questions about our privacy policy?{" "}
                <a
                  href="/contact"
                  className="text-blue-600 hover:text-blue-700 font-semibold underline"
                >
                  Contact our privacy team
                </a>{" "}
                or email us at{" "}
                <a
                  href="mailto:privacy@example.com"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  privacy@example.com
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
