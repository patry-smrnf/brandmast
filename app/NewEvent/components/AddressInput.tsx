"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";

// Lazy-load MapPicker only on client
const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

const addressSuggestions = [
  "Chmielna 11",
  "Elektryczna 11",
  "Świętokrzyska 31",
  "Marszałkowska 20",
  "Nowy Świat 5",
];

type AddressInputProps = {
  value: string;
  onChange: (newValue: string) => void;
};

export default function AddressInput({ value, onChange }: AddressInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  

  const filteredSuggestions = addressSuggestions.filter((address) =>
    address.toLowerCase().includes(value.toLowerCase())
  );

  return (
<div className="relative w-full">
  <div className="mb-6">
    <MapPicker
      onSelect={(selectedAddress) => {
        onChange(selectedAddress);
        setShowSuggestions(false);
      }}
    />
  </div>

  <Label htmlFor="address" className="mb-1 text-gray-300">
    Address
  </Label>
  <Input
    id="address"
    type="text"
    placeholder="Address"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onFocus={() => setShowSuggestions(true)}
    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
    className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
    required
  />
  {showSuggestions && filteredSuggestions.length > 0 && (
    <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg">
      {filteredSuggestions.map((suggestion, index) => (
        <div
          key={index}
          className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
          onMouseDown={() => {
            onChange(suggestion);
            setShowSuggestions(false);
          }}
        >
          {suggestion}
        </div>
      ))}
    </div>
  )}
</div>

  );
}
