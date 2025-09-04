// components/TranslatePopover.tsx
"use client";
import { useState } from "react";
import { Globe, ExternalLink } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TranslatePopover() {
  const [isOpen, setIsOpen] = useState(false);

  const translatePage = async (language: string) => {
    try {
      // Check if browser supports translation
      if ("translate" in document.documentElement.dataset) {
        document.documentElement.lang = language;
        document.documentElement.setAttribute("translate", "yes");
      }

      // Fallback: Use Google Translate iframe embed
      const iframe = document.createElement("iframe");
      iframe.src = `https://translate.google.com/translate?sl=auto&tl=${language}&u=${encodeURIComponent(
        window.location.href
      )}`;
      iframe.style.width = "100%";
      iframe.style.height = "100vh";
      iframe.style.border = "none";
      iframe.style.position = "fixed";
      iframe.style.top = "0";
      iframe.style.left = "0";
      iframe.style.zIndex = "9999";
      iframe.style.backgroundColor = "white";

      // Add close button
      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = "✕ Close Translation";
      closeBtn.style.position = "fixed";
      closeBtn.style.top = "16px";
      closeBtn.style.right = "16px";
      closeBtn.style.zIndex = "10000";
      closeBtn.style.padding = "12px 20px";
      closeBtn.style.backgroundColor = "#ef4444";
      closeBtn.style.color = "white";
      closeBtn.style.border = "none";
      closeBtn.style.borderRadius = "8px";
      closeBtn.style.cursor = "pointer";
      closeBtn.style.fontSize = "14px";
      closeBtn.style.fontWeight = "500";
      closeBtn.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";

      closeBtn.onclick = () => {
        document.body.removeChild(iframe);
        document.body.removeChild(closeBtn);
      };

      document.body.appendChild(iframe);
      document.body.appendChild(closeBtn);
    } catch (error) {
      console.error("Translation failed:", error);
      window.open(
        `https://translate.google.com/translate?sl=auto&tl=${language}&u=${encodeURIComponent(
          window.location.href
        )}`,
        "_blank"
      );
    }

    setIsOpen(false);
  };

  const languages = [
    { code: "es", name: "Español", flag: "🇪🇸", native: "Español" },
    { code: "fr", name: "Français", flag: "🇫🇷", native: "Français" },

    { code: "de", name: "Deutsch", flag: "🇩🇪", native: "Deutsch" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳", native: "हिन्दी" },
    { code: "ar", name: "العربية", flag: "🇸🇦", native: "العربية" },
    { code: "zh", name: "中文", flag: "🇨🇳", native: "中文" },
    { code: "ja", name: "日本語", flag: "🇯🇵", native: "日本語" },
    { code: "el", name: "Greek", flag: "🇬🇷", native: "Ελληνικά" },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 px-3 py-2 h-auto",
            "border-gray-200 hover:bg-gray-50 transition-colors shadow-sm",
            "bg-white text-gray-700"
          )}
        >
          <Globe className="w-4 h-4 text-blue-500" />
          <span className="hidden sm:block font-medium text-sm">Translate</span>
          <ExternalLink className="hidden sm:block w-3 h-3 text-gray-400" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0 mt-2" align="end" sideOffset={8}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <h4 className="font-semibold text-sm text-gray-900">
            Choose Language
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Translate this page to your preferred language
          </p>
        </div>

        {/* Language List */}
        <div className="py-2 max-h-80 overflow-y-auto">
          {languages.map((lang, index) => (
            <button
              key={lang.code}
              onClick={() => translatePage(lang.code)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3",
                "hover:bg-blue-50 transition-colors duration-200 group",
                "text-left border-0 outline-none focus:bg-blue-50"
              )}
            >
              <span className="text-lg flex-shrink-0">{lang.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 group-hover:text-blue-600 truncate">
                  {lang.native}
                </p>
                <p className="text-xs text-gray-500 truncate">{lang.name}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Globe className="w-3 h-3" />
            Powered by Google Translate
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
