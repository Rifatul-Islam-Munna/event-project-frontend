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
import { studentSignUp } from "@/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Loader2,
  User,
  Mail,
  Lock,
  UserPlus,
  Sparkles,
  Stars,
  Heart,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationKey: ["student-signup"],
    mutationFn: (payload: { name: string; email: string; password: string }) =>
      studentSignUp(payload.name, payload.email, payload.password),
    onSuccess: (data) => {
      if (data.error) {
        console.log("client-side-user-create-error", data.error);
        toast.error(data.error.message, { duration: 5000 });
      } else {
        toast.success("Account created successfully", { duration: 5000 });
        router.push("/login");
      }
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    mutate({ name, email, password });
  };

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden">
      {/* Soft Gradient Background - Lime Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-lime-50 via-emerald-50 to-teal-100">
        <div className="absolute inset-0 bg-gradient-to-tl from-lime-50/80 via-emerald-50/60 to-teal-50/70"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-lime-50/40 via-transparent to-emerald-50/40"></div>
      </div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large soft shapes */}
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-gradient-to-br from-lime-200/30 to-emerald-200/20 blur-3xl animate-gentle-float"></div>
        <div className="absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-200/25 to-teal-200/20 blur-3xl animate-gentle-float delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 h-56 w-56 rounded-full bg-gradient-to-br from-teal-200/20 to-lime-200/15 blur-3xl animate-gentle-float delay-500"></div>
        <div className="absolute top-1/4 right-1/3 h-64 w-64 rounded-full bg-gradient-to-br from-lime-200/25 to-emerald-200/20 blur-3xl animate-gentle-float delay-1500"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => {
          const icons = [Sparkles, Stars, Heart, User, Mail];
          const Icon = icons[i % icons.length];
          return (
            <Icon
              key={i}
              className="absolute text-lime-400/40 animate-icon-float"
              style={{
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 90 + 5}%`,
                fontSize: `${Math.random() * 16 + 20}px`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${Math.random() * 3 + 4}s`,
              }}
            />
          );
        })}
      </div>

      {/* Subtle floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-particle-drift rounded-full bg-white/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 3}px`,
              height: `${Math.random() * 6 + 3}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 4 + 5}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Register Card */}
      <Card className="relative z-10 w-full max-w-md bg-white/85 backdrop-blur-2xl border border-white/30 shadow-xl shadow-lime-500/10 rounded-3xl overflow-hidden">
        {/* Card gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-lime-500/5 pointer-events-none"></div>

        <CardHeader className="relative text-center pb-6 pt-10">
          {/* Decorative icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <UserPlus className="h-12 w-12 text-lime-600" />
              <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-emerald-500 animate-pulse" />
            </div>
          </div>

          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-lime-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Create Account
          </CardTitle>

          {/* Decorative underline */}
          <div className="flex justify-center mb-4">
            <div className="h-1 w-20 bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full"></div>
          </div>

          <CardDescription className="text-gray-600 text-sm leading-relaxed">
            Join us today and start your amazing journey
          </CardDescription>
        </CardHeader>

        <CardContent className="relative px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <User className="h-4 w-4 text-lime-500" />
                Full Name
              </Label>
              <div className="relative group">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  className="h-12 pl-4 pr-12 border-2 border-gray-200/50 rounded-2xl bg-white/60 backdrop-blur-sm focus:bg-white focus:border-lime-400 focus:ring-4 focus:ring-lime-400/20 transition-all duration-300 text-gray-700 placeholder:text-gray-400 group-hover:border-lime-300"
                />
                <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-lime-500 transition-colors duration-200" />
              </div>
            </div>

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
                  placeholder="Create a secure password"
                  required
                  className="h-12 pl-4 pr-12 border-2 border-gray-200/50 rounded-2xl bg-white/60 backdrop-blur-sm focus:bg-white focus:border-lime-400 focus:ring-4 focus:ring-lime-400/20 transition-all duration-300 text-gray-700 placeholder:text-gray-400 group-hover:border-lime-300"
                />
                <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-lime-500 transition-colors duration-200" />
              </div>
            </div>

            {/* Eye-catching Register Button */}
            <Button
              type="submit"
              className="w-full h-14 mt-8 bg-gradient-to-r from-lime-600 via-emerald-600 to-teal-600 hover:from-lime-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg shadow-lime-500/30 hover:shadow-lime-500/50 transform transition-all duration-500 hover:scale-[1.02] focus:ring-4 focus:ring-lime-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
              disabled={isPending}
            >
              {/* Subtle shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

              <div className="relative flex items-center justify-center gap-2">
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                    <span>Create Account</span>
                  </>
                )}
              </div>
            </Button>
          </form>

          {/* Login link with decorative elements */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-300"></div>
              <span className="text-xs text-gray-500 font-medium">
                ALREADY A MEMBER?
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-300"></div>
            </div>

            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent hover:from-lime-700 hover:to-emerald-700 transition-all duration-200 relative group"
              >
                Sign In Here
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-lime-600 to-emerald-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes gentle-float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(-15px) translateX(8px) scale(1.02);
          }
        }
        @keyframes icon-float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-10px) rotate(90deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-5px) rotate(180deg);
            opacity: 0.4;
          }
          75% {
            transform: translateY(8px) rotate(270deg);
            opacity: 0.5;
          }
        }
        @keyframes particle-drift {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          33% {
            transform: translateY(-12px) translateX(12px);
            opacity: 0.7;
          }
          66% {
            transform: translateY(8px) translateX(-8px);
            opacity: 0.5;
          }
        }
        .animate-gentle-float {
          animation: gentle-float 6s ease-in-out infinite;
        }
        .animate-icon-float {
          animation: icon-float 8s ease-in-out infinite;
        }
        .animate-particle-drift {
          animation: particle-drift 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
