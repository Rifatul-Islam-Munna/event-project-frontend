import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/api-fn/react-query-setup";
import { SiteHeader } from "@/components/custom/common/site-header";
import { SiteFooter } from "@/components/custom/common/site-footer";
import { getHeader } from "@/actions/fetch-action";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const postData = await getHeader();

  if (!postData.data) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found",
    };
  }

  return {
    title: postData?.data?.title,
    description: postData?.data?.title,
    icons: {
      icon: postData?.data?.imageUrl,
      shortcut: postData.data?.imageUrl,
      apple: postData.data?.imageUrl,
    },
    openGraph: {
      title: postData?.data?.title,
      description: postData?.data?.title,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <QueryProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SiteHeader />
          {children}
          <SiteFooter />
          <Toaster />
        </body>
      </QueryProvider>
    </html>
  );
}
