"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TimeInputs({
  startTime,
  stopTime,
  startTimeReal,
  stopTimeReal,
  onStartChange,
  onStopChange,
  onStartRealChange,
  onStopRealChange,
  status_akcji
}: {
  startTime: string;
  stopTime: string;
  startTimeReal: string;
  stopTimeReal: string;
  onStartChange: (val: string) => void;
  onStopChange: (val: string) => void;
  onStartRealChange: (val: string) => void;
  onStopRealChange: (val: string) => void;
  status_akcji?: string;
}) {
  return (
    <div className="space-y-6">
      {/* First Row */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Label htmlFor="start_time_sys" className="mb-1 text-gray-300 text-sm font-medium">
            Start (System)
          </Label>
          <Input
            id="start_time_sys"
            type="text"
            placeholder="e.g. 12:00"
            value={startTime}
            onChange={(e) => onStartChange(e.target.value)}
            className="bg-gray-700 text-white border-gray-600 placeholder-gray-400
              focus:border-green-500 focus:ring-green-500 transition"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="stop_time_real" className="mb-1 text-gray-300 text-sm font-medium">
            Stop (Real)
          </Label>
          <Input
            id="stop_time_real"
            type="text"
            placeholder="e.g. 18:00"
            value={stopTime}
            onChange={(e) => onStopChange(e.target.value)}
            className="bg-gray-700 text-white border-gray-600 placeholder-gray-400
              focus:border-green-500 focus:ring-green-500 transition"
          />
        </div>
      </div>
      
{status_akcji === "Odbyta" && (
  <div className="flex flex-col md:flex-row gap-6">
    <div className="flex-1">
      <Label htmlFor="start_time_real" className="mb-1 text-gray-300 text-sm font-medium">
        Start (Real)
      </Label>
      <Input
        id="start_time_real"
        type="text"
        placeholder="e.g. 12:00"
        value={startTimeReal}
        onChange={(e) => onStartRealChange(e.target.value)}
        className="bg-gray-700 text-white border-gray-600 placeholder-gray-400
          focus:border-green-500 focus:ring-green-500 transition"
      />
    </div>
    <div className="flex-1">
      <Label htmlFor="stop_time_sys" className="mb-1 text-gray-300 text-sm font-medium">
        Stop (System)
      </Label>
      <Input
        id="stop_time_sys"
        type="text"
        placeholder="e.g. 18:00"
        value={stopTimeReal}
        onChange={(e) => onStopRealChange(e.target.value)}
        className="bg-gray-700 text-white border-gray-600 placeholder-gray-400
          focus:border-green-500 focus:ring-green-500 transition"
      />
    </div>
  </div>
)}

    </div>
  );
}
