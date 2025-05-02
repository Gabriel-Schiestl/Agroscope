"use client";

import { useEffect } from "react";

// Import Leaflet icon resources
const MapIconFixComponent = () => {
  useEffect(() => {
    // Only run on the client side
    if (typeof window !== "undefined") {
      // Dynamically import Leaflet
      const L = require("leaflet");

      // Fix Leaflet's default icon
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    }
  }, []);

  return null;
};

export default MapIconFixComponent;
