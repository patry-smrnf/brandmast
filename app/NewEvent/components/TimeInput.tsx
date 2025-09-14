"use client";

import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TimeInputsProps = {
  startTime: string; // "HH:mm" or empty
  stopTime: string;
  startTimeReal?: string; // optional, "HH:mm"
  stopTimeReal?: string;
  onStartChange: (val: string) => void;
  onStopChange: (val: string) => void;
  onStartRealChange?: (val: string) => void;
  onStopRealChange?: (val: string) => void;
  status_akcji?: boolean | string; // truthy => show real times
};

/** Ensure a UI value for input[type=time] (HH:mm) or empty string */
const toInputHHMM = (v?: string | null) => {
  if (!v) return "";
  const s = v.trim();
  // Accept "HH:mm:ss" or "HH:mm"
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
  if (/^\d{1,2}:\d{2}$/.test(s)) return s.padStart(5, "0");
  return s;
};

export default function TimeInputs({
  startTime,
  stopTime,
  startTimeReal,
  stopTimeReal,
  onStartChange,
  onStopChange,
  onStartRealChange,
  onStopRealChange,
  status_akcji,
}: TimeInputsProps) {
  // treat many possible status types as truthy
  const showReal = useMemo(() => {
    if (typeof status_akcji === "boolean") return status_akcji;
    if (typeof status_akcji === "string")
      return status_akcji.toLowerCase() === "true" || status_akcji === "1" || status_akcji === "odbyta";
    return Boolean(status_akcji);
  }, [status_akcji]);

  const uiStart = toInputHHMM(startTime);
  const uiStop = toInputHHMM(stopTime);
  const uiStartReal = toInputHHMM(startTimeReal);
  const uiStopReal = toInputHHMM(stopTimeReal);

  return (
    <div className="space-y-6">
      {/* System times row */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Label htmlFor="start_time_sys" className="mb-1 text-gray-300 text-sm font-medium">
            Start (System)
          </Label>
          <Input
            id="start_time_sys"
            type="time"
            step={60}
            placeholder="HH:mm"
            value={uiStart}
            onChange={(e) => onStartChange(e.target.value)}
            className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-green-500 focus:ring-green-500 transition"
            aria-label="System start time"
          />
        </div>

        <div className="flex-1">
          <Label htmlFor="stop_time_sys" className="mb-1 text-gray-300 text-sm font-medium">
            Stop (System)
          </Label>
          <Input
            id="stop_time_sys"
            type="time"
            step={60}
            placeholder="HH:mm"
            value={uiStop}
            onChange={(e) => onStopChange(e.target.value)}
            className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-green-500 focus:ring-green-500 transition"
            aria-label="System stop time"
          />
        </div>
      </div>

      {/* Real times row - optional */}
      {showReal && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <Label htmlFor="start_time_real" className="mb-1 text-gray-300 text-sm font-medium">
              Start (Real)
            </Label>
            <Input
              id="start_time_real"
              type="time"
              step={60}
              placeholder="HH:mm"
              value={uiStartReal}
              onChange={(e) => onStartRealChange?.(e.target.value)}
              className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-green-500 focus:ring-green-500 transition"
              aria-label="Real start time"
            />
          </div>

          <div className="flex-1">
            <Label htmlFor="stop_time_real" className="mb-1 text-gray-300 text-sm font-medium">
              Stop (Real)
            </Label>
            <Input
              id="stop_time_real"
              type="time"
              step={60}
              placeholder="HH:mm"
              value={uiStopReal}
              onChange={(e) => onStopRealChange?.(e.target.value)}
              className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-green-500 focus:ring-green-500 transition"
              aria-label="Real stop time"
            />
          </div>
        </div>
      )}
    </div>
  );
}
