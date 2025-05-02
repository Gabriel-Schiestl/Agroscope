// Empty mock for react-leaflet components during server-side rendering
module.exports = {
  MapContainer: () => null,
  TileLayer: () => null,
  Marker: () => null,
  Popup: () => null,
  Polygon: () => null,
  useMap: () => null,
  // Add other components as needed
};
