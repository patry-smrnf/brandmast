"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TimeInputs({
  startTime,
  stopTime,
  onStartChange,
  onStopChange,
}: {
  startTime: string;
  stopTime: string;
  onStartChange: (val: string) => void;
  onStopChange: (val: string) => void;
}) {
  return (
    <>
    <div className="flex flex-col md:flex-row gap-4 space-y-5">
      <div className="flex-1">
        <Label htmlFor="start_time" className="mb-1 text-gray-300">
          Start ( System )
        </Label>
        <Input
          id="start_time"
          type="text"
          placeholder="Time (e.g. 12:00, 13:00)"
          value={startTime}
          onChange={(e) => onStartChange(e.target.value)}
          className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="stop_time" className="mb-1 text-gray-300">
          Stop ( Real )
        </Label>
        <Input
          id="stop_time"
          type="text"
          placeholder="Time (e.g. 18:00, 19:00)"
          value={stopTime}
          onChange={(e) => onStopChange(e.target.value)}
          className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
        />
      </div>
    </div>
    <div className="flex flex-col md:flex-row gap-5">
      <div className="flex-1">
        <Label htmlFor="start_time" className="mb-1 text-gray-300">
          Start ( Real )
        </Label>
        <Input
          id="start_time"
          type="text"
          placeholder="Time (e.g. 12:00, 13:00)"
          value={startTime}
          onChange={(e) => onStartChange(e.target.value)}
          className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="stop_time" className="mb-1 text-gray-300">
          Stop ( System )
        </Label>
        <Input
          id="stop_time"
          type="text"
          placeholder="Time (e.g. 18:00, 19:00)"
          value={stopTime}
          onChange={(e) => onStopChange(e.target.value)}
          className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
        />
      </div>
    </div>
    </>

  );
}
