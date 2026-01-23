import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/api-fn/react-query-setup";
import { SiteHeader } from "@/components/custom/common/site-header";
import { SiteFooter } from "@/components/custom/common/site-footer";
import { getHeader } from "@/actions/fetch-action";
import Script from "next/script";
import LayoutWrapper from "@/lib/LayoutWrapper";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Configure the font
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",

  display: "swap", // Optional: font-display strategy
});

export async function generateMetadata(): Promise<Metadata> {
  const postData = await getHeader();

  if (!postData.data) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found",
    };
  }

  // Only include favicon if it's a valid URL
  const metadata: Metadata = {
    title: postData?.data?.title,
    description: postData?.data?.description,
    openGraph: {
      title: postData?.data?.title,
      description: postData?.data?.description,
    },
  };

  // Add icons only if favicon exists and is valid
  if (postData?.data?.favicon && postData.data.favicon.trim() !== "") {
    metadata.icons = {
      icon: postData.data.favicon,
      shortcut: postData.data.favicon,
      apple: postData.data.favicon,
    };
  }

  return metadata;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta name="google" content="notranslate" />
      </Head>
      <QueryProvider>
        <LayoutWrapper />
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${sourceSans.variable} antialiased`}
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
