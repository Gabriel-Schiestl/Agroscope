"use client";

import { useEffect } from "react";
import L from "leaflet";

// Import Leaflet icon resources
const MapIconFixComponent = () => {
  useEffect(() => {
    // Fix Leaflet's default icon
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  return null;
};

export default MapIconFixComponent;
