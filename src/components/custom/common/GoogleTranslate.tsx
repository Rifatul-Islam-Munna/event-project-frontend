"use client";

import { useEffect } from "react";

export default function GoogleTranslate() {
  useEffect(() => {
    // Define init function before script loads
    // @ts-ignore
    window.googleTranslateElementInit = function () {
      // @ts-ignore
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

    // Add Google script
    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      // @ts-ignore
      delete window.googleTranslateElementInit;
    };
  }, []);

  return <div id="google_translate_element" style={{ padding: 8 }} />;
}
