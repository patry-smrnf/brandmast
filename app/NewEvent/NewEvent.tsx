"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; 

import "leaflet/dist/leaflet.css";

import DatePickerInput from "./components/DatePickerInput";
import AddressInput from "./components/AddressInput";
import TimeInputs from "./components/TimeInput";

function normalizeTime(input: string): string {
  const parts = input.split(":");

  if (parts.length === 1) return `${parts[0].padStart(2, "0")}:00:00`;
  if (parts.length === 2) return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
  if (parts.length === 3) return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}`;

  return "00:00:00";
}

export default function NewEventPage() {
  const [title, setTitle] = useState("");
  const [startTimeSys, setTimeStartSys] = useState("");
  const [stopTimeSys, setTimeStopSys] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !startTimeSys || !stopTimeSys || !title) {
      toast.error("Please fill all fields.");
      return;
    }

    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const normalizedStart = normalizeTime(startTimeSys);
    const normalizedStop = normalizeTime(stopTimeSys);

    const payload = {
      data: formattedDate,
      start: `${formattedDate} ${normalizedStart}`,
      stop: `${formattedDate} ${normalizedStop}`,
      address: title,
    };

    try {
      const response = await fetch("http://localhost:8081/api/bm/addAction", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });


      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      toast.success(result.message || "Event saved successfully!");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error?.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 sm:p-8 max-w-md w-full space-y-4 sm:space-y-6 shadow-xl border border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-4 sm:mb-6">
          Dodaj akcje
        </h1>

        <div>
          <Label htmlFor="date" className="mb-1 text-gray-300 text-sm sm:text-base">
            Event Date
          </Label>
          <DatePickerInput value={date} onChange={setDate} />
        </div>

        <div className="mt-4 sm:mt-6">
          <AddressInput value={title} onChange={setTitle} />
        </div>

        <div className="mt-4 sm:mt-6">
          <TimeInputs
            startTime={startTimeSys}
            stopTime={stopTimeSys}
            onStartChange={setTimeStartSys}
            onStopChange={setTimeStopSys}
          />
        </div>

        <Button type="submit" className="w-full text-sm sm:text-base">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
