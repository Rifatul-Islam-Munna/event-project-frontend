"use client";

import { useEffect, useRef, useState } from "react";

export default function MutationBasedGoogleTranslate() {
  const [currentInterfaceLang, setCurrentInterfaceLang] = useState("en");
  const scriptRef = useRef(null);
  const observerRef = useRef(null);
  const lastDetectedLang = useRef("en");

  const loadGoogleTranslate = (interfaceLang = "en") => {
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
          pageLanguage: "en",
          includedLanguages:
            "el,ar,hi,bn,pt,ru,zh-CN,ja,ko,en,es,fr,de,it,nl,pl,sv,no,da,fi,cs,sk,hu,ro,bg,hr,sr,sl,et,lv,lt",
          autoDisplay: true,
          layout:
            window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.src = `https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit&hl=${interfaceLang}`;
    script.async = true;

    document.body.appendChild(script);
    scriptRef.current = script;
  };

  const setupMutationObserver = () => {
    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check for changes in Google Translate dropdown
        if (mutation.type === "childList" || mutation.type === "attributes") {
          const translateSelect = document.querySelector(".goog-te-combo");
          if (translateSelect) {
            const selectedValue = translateSelect.value;
            if (
              selectedValue &&
              selectedValue !== "" &&
              selectedValue !== lastDetectedLang.current
            ) {
              console.log(`Language change detected: ${selectedValue}`);
              lastDetectedLang.current = selectedValue;
              setCurrentInterfaceLang(selectedValue);

              // Reload with new interface language
              setTimeout(() => {
                loadGoogleTranslate(selectedValue);
                // Re-setup observer after reload
                setTimeout(() => {
                  setupMutationObserver();
                }, 2000);
              }, 500);
            }
          }
        }

        // Also check for URL hash changes
        const hash = window.location.hash;
        if (hash.includes("googtrans")) {
          const match = hash.match(/googtrans\([^|]*\|([^)]+)\)/);
          if (match) {
            const newLang = match[1];
            if (newLang !== lastDetectedLang.current && newLang !== "auto") {
              lastDetectedLang.current = newLang;
              setCurrentInterfaceLang(newLang);
              setTimeout(() => {
                loadGoogleTranslate(newLang);
                setTimeout(() => {
                  setupMutationObserver();
                }, 2000);
              }, 500);
            }
          }
        }
      });
    });

    // Start observing
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "value"],
    });
  };

  useEffect(() => {
    // Initial load
    loadGoogleTranslate(currentInterfaceLang);

    // Setup observer after initial load
    setTimeout(() => {
      setupMutationObserver();
    }, 2000);

    return () => {
      // Cleanup
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <div>
      <div id="google_translate_element" style={{ padding: 8 }} />
    </div>
  );
}
