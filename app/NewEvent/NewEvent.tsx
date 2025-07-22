"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; 

import "leaflet/dist/leaflet.css";

import DatePickerInput from "./components/DatePickerInput";
import AddressInput from "./components/AddressInput";
import TimeInputs from "./components/TimeInput";
import { API_BASE_URL } from "../config";
import { ArrowLeft } from "lucide-react";


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
      const response = await fetch(`/api/bm/addAction`, {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-gray-800/60 border border-gray-700 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Return Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = "/")}
            className="text-gray-400 hover:text-white flex items-center gap-2 px-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">

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
    </div>
  );
}
