"use client";

import { useRouter } from "next/navigation";
import { m, LazyMotion, domAnimation } from "motion/react";
import {
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  Shield,
  Star,
  Home,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FEATURES = [
  "Access to core dashboard",
  "Basic event management",
  "Up to 50 guests per event",
  "Standard support",
];

export default function FreeConfirmPage() {
  const router = useRouter();

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-lime-50/30 flex items-center justify-center p-4">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* ── Card ── */}
          <div className="bg-white rounded-3xl shadow-2xl border border-lime-200 overflow-hidden">
            {/* ── Top banner ── */}
            <div className="relative bg-gradient-to-r from-lime-500 via-lime-500 to-lime-600 px-8 pt-10 pb-16 text-center overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute top-0 left-0 h-32 w-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 h-24 w-24 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />

              <m.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.15,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="relative z-10 h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center mx-auto mb-4 shadow-xl"
              >
                <CheckCircle2 className="h-10 w-10 text-white" />
              </m.div>

              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="relative z-10"
              >
                <Badge className="bg-white/20 text-white border-white/30 font-semibold mb-3 backdrop-blur-sm">
                  <Star className="h-3 w-3 mr-1 fill-white" />
                  Free Plan Activated
                </Badge>
                <h1 className="text-2xl font-extrabold text-white leading-tight">
                  You're all set! 🎉
                </h1>
              </m.div>
            </div>

            {/* ── Floating icon overlap ── */}
            <div className="flex justify-center -mt-7 relative z-10 mb-2">
              <m.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 250 }}
                className="h-14 w-14 rounded-2xl bg-white border-2 border-lime-200 shadow-lg flex items-center justify-center"
              >
                <Sparkles className="h-7 w-7 text-lime-500" />
              </m.div>
            </div>

            {/* ── Body ── */}
            <div className="px-8 pb-8 pt-2 space-y-6">
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-center"
              >
                <p className="text-slate-600 text-sm leading-relaxed">
                  You've successfully activated your{" "}
                  <span className="font-bold text-lime-700">Free Plan</span>.
                  Start exploring and managing your events right away!
                </p>
              </m.div>

              {/* ── Upgrade nudge ── */}
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-start gap-3 bg-gradient-to-r from-slate-50 to-lime-50/50 border border-slate-200 rounded-2xl p-4"
              >
                <div className="h-8 w-8 rounded-lg bg-lime-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Star className="h-4 w-4 text-lime-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Want more power?
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upgrade anytime to unlock unlimited guests, priority
                    support, and advanced features.
                  </p>
                </div>
              </m.div>

              {/* ── Actions ── */}
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="space-y-3 pt-1"
              >
                <Button
                  onClick={() => router.push("/dashboard")}
                  className={cn(
                    "w-full h-12 font-bold text-white rounded-xl text-base",
                    "bg-gradient-to-r from-lime-500 via-lime-600 to-lime-700",
                    "shadow-lg shadow-lime-200 hover:shadow-xl hover:shadow-lime-300",
                    "hover:from-lime-600 hover:to-lime-800 transition-all duration-300",
                  )}
                  size="lg"
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>

                <Button
                  onClick={() => router.push("/#pricing")}
                  variant="outline"
                  className="w-full h-11 rounded-xl border-lime-300 text-lime-700 hover:bg-lime-50 font-semibold transition-all"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Explore Paid Plans
                </Button>

                <Button
                  onClick={() => router.push("/")}
                  variant="ghost"
                  className="w-full h-10 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-sm"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </m.div>

              {/* ── Footer ── */}
              <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
                <Shield className="h-3 w-3" />
                Your account is secure · No credit card required
              </p>
            </div>
          </div>

          {/* ── Floating confetti dots ── */}
          {[
            "top-2 left-8",
            "top-6 right-10",
            "-bottom-1 left-16",
            "bottom-2 right-8",
          ].map((pos, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
              className={cn("absolute h-3 w-3 rounded-full bg-lime-400", pos)}
            />
          ))}
        </m.div>
      </div>
    </LazyMotion>
  );
}
