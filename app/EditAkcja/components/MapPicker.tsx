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

type Shop = {
  name: string
  id_shop: number;
  address: string;
  lat: string;
  lon: string;
};

export default function MapPicker({
  shops,
  onSelect,
}: {
  shops: Shop[],
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

        {shops.map((shop) => (
          <Marker
            key={shop.id_shop}
            position={[parseFloat(shop.lat), parseFloat(shop.lon)]}
            icon={markerIcon}
            eventHandlers={{
              click: () => onSelect(shop.address),
            }}
          >
            <Popup>{shop.name} - {shop.address}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
