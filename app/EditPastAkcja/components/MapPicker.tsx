"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";

// Leaflet icon fix (if needed)
import "leaflet/dist/leaflet.css";

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const locations: { address: string; position: LatLngExpression }[] = [
  { address: "Chmielna 11", position: [52.2305, 21.0069] },
  { address: "Elektryczna 11", position: [52.2365, 21.0020] },
  { address: "Świętokrzyska 31", position: [52.2352, 21.0100] },
  { address: "Marszałkowska 20", position: [52.2297, 21.0117] },
  { address: "Nowy Świat 5", position: [52.2330, 21.0150] },
];

export default function MapPicker({
  onSelect,
}: {
  onSelect: (address: string) => void;
}) {
  const center: LatLngExpression = [52.2305, 21.0069];

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-600 mt-3">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="bg-gray-900"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {locations.map((loc, i) => (
          <Marker
            key={i}
            position={loc.position}
            icon={markerIcon}
            eventHandlers={{
              click: () => onSelect(loc.address),
            }}
          >
            <Popup>{loc.address}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
