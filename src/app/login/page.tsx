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
import { Loader2 } from "lucide-react";

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
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border border-gray-200 shadow-none bg-background">
        {" "}
        {/* Explicitly set border and background */}
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            Login
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {" "}
            {/* Increased space-y for better visual separation */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="border-border focus:ring-primary focus:border-primary"
              />{" "}
              {/* Added focus styles */}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="border-border focus:ring-primary focus:border-primary"
              />{" "}
              {/* Added focus styles */}
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isPending}
            >
              {isPending && <Loader2 className=" w-4 h-4 animate-spin" />} Login
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {" "}
            {/* Increased mt and set text color */}
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="underline text-primary hover:text-primary/90"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
