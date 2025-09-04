// components/IBMTranslate.tsx
"use client";
import { useState } from "react";
import { Globe, ExternalLink, Download } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function ResponsiveTranslate() {
  const [isOpen, setIsOpen] = useState(false);

  const translateWithIBM = (langCode: string) => {
    const currentUrl = window.location.href;
    const ibmUrl = `https://language-translator-demo.ng.bluemix.net/?url=${encodeURIComponent(
      currentUrl
    )}&target=${langCode}&source=auto`;
    window.open(ibmUrl, "_blank");
    setIsOpen(false);
  };

  const languages = [
    { code: "es", name: "Spanish", flag: "🇪🇸", native: "Español" },
    { code: "fr", name: "French", flag: "🇫🇷", native: "Français" },
    { code: "de", name: "German", flag: "🇩🇪", native: "Deutsch" },
    { code: "ar", name: "Arabic", flag: "🇸🇦", native: "العربية" },
    { code: "zh", name: "Chinese", flag: "🇨🇳", native: "中文" },
    { code: "ja", name: "Japanese", flag: "🇯🇵", native: "日本語" },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 px-3 py-2">
          <Globe className="w-4 h-4 text-blue-500" />
          <span className="hidden sm:block font-medium text-sm">Translate</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0" align="end" sideOffset={8}>
        <div className="px-4 py-3 border-b">
          <h4 className="font-semibold text-sm text-gray-900">
            Choose Language
          </h4>
          <p className="text-xs text-gray-500 mt-1">IBM Watson Translator</p>
        </div>

        <div className="py-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => translateWithIBM(lang.code)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group text-left"
            >
              <span className="text-lg">{lang.flag}</span>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 group-hover:text-blue-600">
                  {lang.native}
                </p>
                <p className="text-xs text-gray-500">{lang.name}</p>
              </div>
              <Download className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        <div className="px-4 py-2 bg-blue-50 border-t">
          <p className="text-xs text-blue-700">
            Downloads HTML file of translated page
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
