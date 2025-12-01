"use client";

import type React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Shield,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationKey: ["login-user"],
    mutationFn: (payload: { email: string; password: string }) =>
      loginUser(payload.email, payload.password),
    onSuccess: (data) => {
      if (data.error) {
        console.log("client-side-user-login-error", data.error);
        toast.error(data.error.message, { duration: 5000 });
      } else {
        console.log("client-side-user-login-success", data);
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      console.log("catch in error", error);
      toast.error(error.message);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    mutate({ email, password });
  };

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden">
      {/* Rich Animated Background - Lime Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-lime-100 via-emerald-50 to-teal-100">
        <div className="absolute inset-0 bg-gradient-to-tl from-green-100/70 via-lime-50/50 to-emerald-100/60"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-lime-50/40 via-transparent to-teal-100/40"></div>
      </div>

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large flowing shapes */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-lime-200/40 to-emerald-300/30 blur-3xl animate-slow-bounce"></div>
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-300/30 blur-3xl animate-slow-bounce delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-teal-200/30 to-green-300/20 blur-3xl animate-slow-bounce delay-500"></div>
        <div className="absolute top-1/4 right-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-lime-200/35 to-green-300/25 blur-3xl animate-slow-bounce delay-1500"></div>

        {/* Medium floating elements */}
        <div className="absolute top-1/3 left-3/4 h-32 w-32 rounded-full bg-gradient-to-r from-emerald-300/20 to-teal-400/15 blur-2xl animate-float-slow"></div>
        <div className="absolute bottom-1/3 left-1/4 h-28 w-28 rounded-full bg-gradient-to-r from-lime-300/20 to-emerald-400/15 blur-2xl animate-float-slow delay-700"></div>
      </div>

      {/* Subtle floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-drift rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              background: `linear-gradient(45deg, 
                ${
                  [
                    "rgba(132, 204, 22, 0.3)", // lime-500
                    "rgba(16, 185, 129, 0.3)", // emerald-500
                    "rgba(20, 184, 166, 0.3)", // teal-500
                    "rgba(34, 197, 94, 0.3)", // emerald-500 alt
                    "rgba(74, 222, 128, 0.3)", // lime-400
                  ][Math.floor(Math.random() * 5)]
                }, 
                rgba(255, 255, 255, 0.2))`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 4 + 6}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md bg-white/85 backdrop-blur-2xl border border-white/30 shadow-xl shadow-lime-500/10 rounded-3xl overflow-hidden">
        {/* Card gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-lime-500/5 pointer-events-none"></div>

        <CardHeader className="relative text-center pb-6 pt-10">
          {/* Decorative icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="h-12 w-12 text-lime-600" />
              <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-emerald-500 animate-pulse" />
            </div>
          </div>

          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-lime-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </CardTitle>

          {/* Decorative underline */}
          <div className="flex justify-center mb-4">
            <div className="h-1 w-16 bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full"></div>
          </div>

          <CardDescription className="text-gray-600 text-sm leading-relaxed">
            Sign in to your account and continue your journey
          </CardDescription>
        </CardHeader>

        <CardContent className="relative px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-lime-500" />
                Email Address
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  required
                  className="h-12 pl-4 pr-12 border-2 border-gray-200/50 rounded-2xl bg-white/60 backdrop-blur-sm focus:bg-white focus:border-lime-400 focus:ring-4 focus:ring-lime-400/20 transition-all duration-300 text-gray-700 placeholder:text-gray-400 group-hover:border-lime-300"
                />
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-lime-500 transition-colors duration-200" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Lock className="h-4 w-4 text-lime-500" />
                Password
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="h-12 pl-4 pr-12 border-2 border-gray-200/50 rounded-2xl bg-white/60 backdrop-blur-sm focus:bg-white focus:border-lime-400 focus:ring-4 focus:ring-lime-400/20 transition-all duration-300 text-gray-700 placeholder:text-gray-400 group-hover:border-lime-300"
                />
                <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-lime-500 transition-colors duration-200" />
              </div>
            </div>

            {/* Eye-catching Login Button */}
            <Button
              type="submit"
              className="w-full h-14 mt-8 bg-gradient-to-r from-lime-600 via-emerald-600 to-teal-600 hover:from-lime-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg shadow-lime-500/30 hover:shadow-lime-500/50 transform transition-all duration-300 hover:scale-[1.02] focus:ring-4 focus:ring-lime-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
              disabled={isPending}
            >
              {/* Button gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

              <div className="relative flex items-center justify-center gap-2">
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Continue</span>
                    <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </Button>
          </form>

          {/* Sign up link with decorative elements */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-300"></div>
              <span className="text-xs text-gray-500 font-medium">OR</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-300"></div>
            </div>

            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent hover:from-lime-700 hover:to-emerald-700 transition-all duration-200 relative group"
              >
                Create Account
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-lime-600 to-emerald-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes slow-bounce {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(-20px) translateX(10px) scale(1.05);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-15px) rotate(120deg);
          }
          66% {
            transform: translateY(15px) rotate(240deg);
          }
        }
        @keyframes drift {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0.4;
          }
          25% {
            transform: translateY(-20px) translateX(20px) rotate(90deg);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-10px) translateX(-15px) rotate(180deg);
            opacity: 0.6;
          }
          75% {
            transform: translateY(15px) translateX(10px) rotate(270deg);
            opacity: 0.7;
          }
        }
        .animate-slow-bounce {
          animation: slow-bounce 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-drift {
          animation: drift 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
