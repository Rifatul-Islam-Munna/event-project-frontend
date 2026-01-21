"use client";

import { useEffect, useRef, useState } from "react";

// Country code to language mapping
const countryToLanguage = {
  // European languages
  GR: "el",
  CY: "el", // Greek
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es", // Spanish
  FR: "fr",
  BE: "fr", // French
  DE: "de",
  AT: "de",
  CH: "de", // German
  IT: "it", // Italian
  PT: "pt",
  BR: "pt", // Portuguese
  NL: "nl", // Dutch
  PL: "pl", // Polish
  SE: "sv", // Swedish
  NO: "no", // Norwegian
  DK: "da", // Danish
  FI: "fi", // Finnish
  CZ: "cs", // Czech
  SK: "sk", // Slovak
  HU: "hu", // Hungarian
  RO: "ro", // Romanian
  BG: "bg", // Bulgarian
  HR: "hr", // Croatian
  RS: "sr", // Serbian
  SI: "sl", // Slovenian
  EE: "et", // Estonian
  LV: "lv", // Latvian
  LT: "lt", // Lithuanian

  // Asian languages
  CN: "zh-CN", // Chinese (Simplified)
  TW: "zh-TW",
  HK: "zh-TW", // Chinese (Traditional)
  JP: "ja", // Japanese
  KR: "ko", // Korean
  IN: "hi", // Hindi
  BD: "bn", // Bengali
  PK: "ur", // Urdu

  // Middle Eastern languages
  SA: "ar",
  AE: "ar",
  EG: "ar",
  IQ: "ar",
  JO: "ar",
  KW: "ar", // Arabic
  IR: "fa", // Persian
  TR: "tr", // Turkish
  IL: "iw", // Hebrew

  // Other languages
  RU: "ru",
  BY: "ru",
  KZ: "ru", // Russian
  GB: "en",
  US: "en",
  CA: "en",
  AU: "en",
  NZ: "en", // English
};

export default function AutoTranslateByLocation() {
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const scriptRef = useRef(null);
  const isInitialized = useRef(false);

  // Detect user's country and language
  const detectUserLanguage = async () => {
    try {
      // Method 1: Try Vercel/Cloudflare headers (if available via API route)
      const headerResponse = await fetch("/api/detect-location");
      if (headerResponse.ok) {
        const { country } = await headerResponse.json();
        return countryToLanguage[country] || "en";
      }
    } catch (error) {
      console.log("Header detection failed, trying IP API");
    }

    try {
      // Method 2: Use IP Geolocation API as fallback
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      const countryCode = data.country_code;
      return countryToLanguage[countryCode] || "en";
    } catch (error) {
      console.error("Location detection failed:", error);
      // Fallback to browser language
      const browserLang = navigator.language.split("-")[0];
      return browserLang || "en";
    }
  };

  const loadGoogleTranslate = (targetLang) => {
    // Clean up existing implementation
    if (scriptRef.current) {
      document.body.removeChild(scriptRef.current);
      scriptRef.current = null;
    }

    const existingWidget = document.getElementById("google_translate_element");
    if (existingWidget) {
      existingWidget.innerHTML = "";
    }

    // Initialize Google Translate
    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "el",
          includedLanguages:
            "el,ar,hi,bn,pt,ru,zh-CN,ja,ko,en,es,fr,de,it,nl,pl,sv,no,da,fi,cs,sk,hu,ro,bg,hr,sr,sl,et,lv,lt",
          autoDisplay: false,
          layout:
            window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
        },
        "google_translate_element",
      );

      // Auto-translate after widget loads
      setTimeout(() => {
        const selectElement = document.querySelector(".goog-te-combo");
        if (selectElement && targetLang && targetLang !== "el") {
          selectElement.value = targetLang;
          selectElement.dispatchEvent(new Event("change"));
        }
      }, 1000);
    };

    const script = document.createElement("script");
    script.src = `https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit&hl=${targetLang}`;
    script.async = true;

    document.body.appendChild(script);
    scriptRef.current = script;
  };

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Detect language and auto-translate
    detectUserLanguage().then((lang) => {
      setDetectedLanguage(lang);
      loadGoogleTranslate(lang);
    });

    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
      }
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <div>
      <div id="google_translate_element" style={{ padding: 8 }} />
      {detectedLanguage && (
        <p style={{ fontSize: 12, color: "#666" }}>
          Auto-detected language: {detectedLanguage}
        </p>
      )}
    </div>
  );
}
