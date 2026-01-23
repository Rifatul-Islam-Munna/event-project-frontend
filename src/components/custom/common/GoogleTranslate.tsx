"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

function GoogleTranslateWidget() {
  const [isClient, setIsClient] = useState(false);

  const detectBrowserLanguage = () => {
    if (typeof window === "undefined") return "el";
    const browserLang = navigator.language || navigator.userLanguage || "el";
    const langCode = browserLang.split("-")[0].toLowerCase();

    const supportedLanguages = [
      "el",
      "ar",
      "hi",
      "bn",
      "pt",
      "ru",
      "zh",
      "ja",
      "ko",
      "en",
      "es",
      "fr",
      "de",
      "it",
      "nl",
      "pl",
      "sv",
      "no",
      "da",
      "fi",
      "cs",
      "sk",
      "hu",
      "ro",
      "bg",
      "hr",
      "sr",
      "sl",
      "et",
      "lv",
      "lt",
    ];

    return supportedLanguages.includes(langCode) ? langCode : "el";
  };

  useEffect(() => {
    setIsClient(true);

    const detectedLang = detectBrowserLanguage();
    console.log(`Browser language detected: ${detectedLang}`);

    // Check if already loaded
    if (document.querySelector('script[src*="translate.google.com"]')) {
      return;
    }

    window.googleTranslateElementInit = function () {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "el",
            includedLanguages:
              "el,ar,hi,bn,pt,ru,zh-CN,ja,ko,en,es,fr,de,it,nl,pl,sv,no,da,fi,cs,sk,hu,ro,bg,hr,sr,sl,et,lv,lt",
            autoDisplay: true,
            layout:
              window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
          },
          "google_translate_element",
        );

        setTimeout(() => {
          const translateSelect = document.querySelector(".goog-te-combo");
          if (translateSelect && detectedLang !== "el") {
            translateSelect.value = detectedLang;
            translateSelect.dispatchEvent(new Event("change"));
          }
        }, 1000);
      } catch (error) {
        console.error("Error initializing Google Translate:", error);
      }
    };

    const script = document.createElement("script");
    script.src = `https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit&hl=${detectedLang}`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  if (!isClient) {
    return <div style={{ padding: 8, minHeight: 40 }} />;
  }

  return (
    <div>
      <div
        id="google_translate_element"
        style={{ padding: 8 }}
        suppressHydrationWarning
      />
    </div>
  );
}

function MutationBasedGoogleTranslate() {
  const pathname = usePathname();

  if (pathname !== "/" && pathname !== "") {
    return null;
  }

  return <GoogleTranslateWidget />;
}

// Export with dynamic import and ssr: false
export default MutationBasedGoogleTranslate;
