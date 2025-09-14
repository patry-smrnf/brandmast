"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import { shop_response } from "../types/shopsType";
import { apiFetch } from "@/lib/api";

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
    const controller = new AbortController();
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiFetch<shop_response[]>(`/api/general/getAllShops`, {
          method: "GET",
        });

        const json : shop_response[] = res;
        if (!mounted) return;
        setShopsData(Array.isArray(json) ? json : []);
      } catch (error) {
        if ((error as any).name === "AbortError") return;
        console.error("Failed to fetch shops", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const normalizeString = useCallback((str: string) =>
    str
      .normalize?.("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase(), []
  );

  // Filtered suggestions memoized
  const filteredSuggestions = useMemo(() => {
    if (!value) return shopsData.slice(0, 8);
    const needle = normalizeString(value);
    return shopsData.filter((shop) => normalizeString(shop.address).includes(needle)).slice(0, 8);
  }, [shopsData, value, normalizeString]);

  return (
    <div className="relative w-full">
      <div className="mb-6">
        <MapPicker
          shops={shopsData}
          selectedAddress={value}
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
        onBlur={() => {
          // small delay allows selection via mouse before closing
          setTimeout(() => setShowSuggestions(false), 150);
        }}
        className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
        aria-autocomplete="list"
        aria-controls="address-suggestions"
        aria-expanded={showSuggestions}
      />

      {showSuggestions && !loading && filteredSuggestions.length > 0 && (
        <div
          id="address-suggestions"
          role="listbox"
          className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-64 overflow-auto"
        >
          {filteredSuggestions.map((shop) => (
            <div
              key={shop.id_shop}
              role="option"
              aria-selected={shop.address === value}
              className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
              onMouseDown={(ev) => {
                // onMouseDown is used instead of onClick to avoid blur before selection
                ev.preventDefault();
                onChange(shop.address);
                setShowSuggestions(false);
              }}
            >
              <div className="font-medium">{shop.name}</div>
              <div className="text-xs text-gray-300 truncate">{shop.address}</div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="mt-2 text-sm text-gray-400" aria-live="polite">
          Loading addresses...
        </div>
      )}
    </div>
  );
}
