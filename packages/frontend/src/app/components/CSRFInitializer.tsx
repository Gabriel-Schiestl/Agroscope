"use client";

import { useEffect } from "react";
import { initializeCSRF } from "../../../shared/http/http.config";

export default function CSRFInitializer() {
  useEffect(() => {
    initializeCSRF();
  }, []);

  return null;
}
