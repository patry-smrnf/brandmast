"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import "leaflet/dist/leaflet.css";

import DatePickerInput from "./components/DatePickerInput";
import AddressInput from "./components/AddressInput";
import TimeInputs from "./components/TimeInput";

export default function EditEventPage() {
  const [title, setTitle] = useState("");
  const [startTimeSys, setTimeStartSys] = useState("");
  const [stopTimeSys, setTimeStopSys] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isActive, setIsActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, startTimeSys, stopTimeSys, date, isActive });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 sm:p-8 max-w-md w-full space-y-4 sm:space-y-6 shadow-xl border border-gray-700"
      >
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-4 sm:mb-6">
          Edit Event
        </h1>

        <div>
          <Label
            htmlFor="date"
            className="mb-1 text-gray-300 text-sm sm:text-base"
          >
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
