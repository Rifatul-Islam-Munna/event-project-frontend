"use client";
import { getHeader } from "@/actions/fetch-action";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export function SiteFooter() {
  const { data, isPending, refetch } = useQuery({
    queryKey: ["header"],
    queryFn: () => getHeader(),
    gcTime: 1000 * 60 * 60,
  });
  return (
    <footer className="w-full py-6 border-t bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {data?.data?.title}. All rights
          reserved.
        </p>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="#" className="text-sm hover:underline underline-offset-4">
            Home
          </Link>
          <Link
            href="/terms-condition"
            className="text-sm hover:underline underline-offset-4"
          >
            Terms
          </Link>
          <Link href="#" className="text-sm hover:underline underline-offset-4">
            Contact Us
          </Link>
          <Link
            href="/privacy"
            className="text-sm hover:underline underline-offset-4"
          >
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
