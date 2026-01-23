"use client";

import { useEffect } from "react";
import applyGoogleTranslateDOMPatch from "./googleTranslatePatch";

export default function LayoutWrapper() {
  useEffect(() => {
    // Apply the patch once when the app loads
    applyGoogleTranslateDOMPatch();
  }, []);

  return null;
}
