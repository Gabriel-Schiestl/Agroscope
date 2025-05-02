// This file provides a safe way to import Leaflet components
// It works by only importing Leaflet on the client side, avoiding server-side rendering issues

import type L from "leaflet";
import type {
  MapContainer as MapContainerType,
  TileLayer as TileLayerType,
  Marker as MarkerType,
  Popup as PopupType,
  Polygon as PolygonType,
} from "react-leaflet";

// Export types for TypeScript support
export type {
  MapContainerType,
  TileLayerType,
  MarkerType,
  PopupType,
  PolygonType,
};

// This will be populated with actual implementations on the client side
// but will remain null on the server
let L_Module: typeof L | null = null;
let MapContainer: typeof MapContainerType | null = null;
let TileLayer: typeof TileLayerType | null = null;
let Marker: typeof MarkerType | null = null;
let Popup: typeof PopupType | null = null;
let Polygon: typeof PolygonType | null = null;

// This function safely initializes Leaflet only on the client side
export function initLeaflet() {
  if (typeof window !== "undefined") {
    // We're on the client side, so it's safe to import Leaflet
    // Import the CSS
    require("leaflet/dist/leaflet.css");

    // Import the libraries
    L_Module = require("leaflet");
    const reactLeaflet = require("react-leaflet");

    // Assign the components
    MapContainer = reactLeaflet.MapContainer;
    TileLayer = reactLeaflet.TileLayer;
    Marker = reactLeaflet.Marker;
    Popup = reactLeaflet.Popup;
    Polygon = reactLeaflet.Polygon;

    // Fix the default icon issue
    if (L_Module && L_Module.Icon) {
      L_Module.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    }
  }

  return {
    L: L_Module,
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polygon,
  };
}

export default initLeaflet;
