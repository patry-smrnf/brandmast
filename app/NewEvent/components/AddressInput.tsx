"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import { API_BASE_URL } from "@/app/config";
import { shop_response } from "../types/shopsType";
// Lazy-load MapPicker only on client
const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

type AddressInputProps = {
  value: string;
  onChange: (newValue: string) => void;
};

export default function AddressInput({ value, onChange }: AddressInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shopsData, setShopsData] = useState<shop_response[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/shop/getAll`, {
            method: "GET",
            credentials: "include",
        });        
      const json = await res.json();
        setShopsData(json);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const normalizeString = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredSuggestions = shopsData.filter((shop) =>
    normalizeString(shop.address).includes(normalizeString(value))
  );

  return (
<div className="relative w-full">
  <div className="mb-6">
    <MapPicker shops={shopsData}
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
      {filteredSuggestions.map((shop) => (
        <div
          key={shop.id_shop}
          className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
          onMouseDown={() => {
            onChange(shop.address);
            setShowSuggestions(false);
          }}
        >
          {shop.address}
        </div>
      ))}
    </div>
  )}
</div>

  );
}
