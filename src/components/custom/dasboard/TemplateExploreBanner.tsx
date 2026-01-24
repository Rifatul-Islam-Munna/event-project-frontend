"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutTemplate, Sparkles, ArrowRight, Zap } from "lucide-react";
import { getUserInfo } from "@/actions/auth";

const TemplateExploreBanner = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const info = await getUserInfo();
      setUser(info);
    };
    fetchUser();
  }, []);

  // Permission check
  if (!user?.plan?.permissions?.includes("event.template")) {
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r mt-4 from-lime-500 via-lime-600 to-lime-700 rounded-xl shadow-lg border-2 border-lime-400 mb-6 animate-in fade-in slide-in-from-top duration-500">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-shimmer" />

      <div className="relative px-6 py-4 flex items-center justify-between gap-4">
        {/* Left side - Icon and Message */}
        <div className="flex items-center gap-4 flex-1">
          {/* Animated icon container */}
          <div className="relative">
            <div className="absolute inset-0 bg-lime-300 rounded-full blur-md animate-pulse" />
            <div className="relative bg-white rounded-full p-3 shadow-lg">
              <LayoutTemplate className="h-6 w-6 text-lime-700" />
            </div>
          </div>

          {/* Message */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-lime-200 animate-pulse" />
              <h3 className="text-lg font-bold text-white">
                Premium Templates Available!
              </h3>
              <Zap className="h-5 w-5 text-yellow-300 animate-bounce" />
            </div>
            <p className="text-lime-50 text-sm font-medium">
              Your plan includes access to professional event templates. Start
              creating amazing events in minutes!
            </p>
          </div>
        </div>

        {/* Right side - CTA Button */}
        <div className="flex items-center">
          <Link href="/dashboard/template">
            <button className="group relative bg-white text-lime-700 hover:bg-lime-50 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
              <span>Explore Templates</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />

              {/* Button shine effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-shine" />
            </button>
          </Link>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-lime-800 rounded-full blur-2xl opacity-20 translate-y-1/2 -translate-x-1/2" />
    </div>
  );
};

export default TemplateExploreBanner;
