"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import DatePickerInput from "./components/DatePickerInput";
import AddressInput from "./components/AddressInput";
import TimeInputs from "./components/TimeInput";
import { akcja_data } from "./types/akcja";
import { format, parse } from "date-fns";

export default function EditPastAkcjaPage() {
  const [title, setTitle] = useState("");
  const [startTimeSys, setTimeStartSys] = useState("");
  const [stopTimeSys, setTimeStopSys] = useState("");
  const [startTimeReal, setTimeStartReal] = useState("");
  const [stopTimeReal, setTimeStopReal] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isActive, setIsActive] = useState(false);
  const [action_data, setActionData] = useState<akcja_data>();

  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("Missing action ID.");
      return;
    }

    try {
      const payload = {
        id_akcja: Number(id),
        date: date ? format(date, "dd.MM.yyyy") : "",
        address: title,
        start_sys: startTimeSys,
        stop_sys: stopTimeSys,
        start_real: startTimeReal,
        stop_real: stopTimeReal,
        szkolenie: isActive,
      };

      const response = await fetch("http://localhost:8081/api/bm/editAction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        toast.error("Failed to save changes.");
        return;
      }

      toast.success("Changes saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving.");
    }
  };

  const handleDelete = async () => {
    if (!id) {
      toast.error("Missing action ID.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/bm/delAction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ action_id: Number(id) }),
      });

      if (!response.ok) {
        toast.error("Failed to delete event.");
        return;
      }

      toast.success("Event deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting.");
    }
  };

  useEffect(() => {
    const fetchAkcjaData = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/bm/action?id=" + id, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          toast.error("Something went wrong.");
          throw new Error("Failed to get data abt this akcja");
        }

        const data: akcja_data = await response.json();

        setActionData(data);
        setTitle(data.address || "");
        setTimeStartSys(data.start_sys || "");
        setTimeStopSys(data.stop_sys || "");
        setTimeStartReal(data.start_real || "");
        setTimeStopReal(data.stop_real || "");
        setDate(data.date ? parse(data.date, "dd.MM.yyyy", new Date()) : undefined);
        setIsActive(data.szkolenie === true);
      } catch (error) {
        toast.error("Something went wrong.");
        console.error(error);
      }
    };

    if (id) {
      fetchAkcjaData();
    }
  }, [id]);

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

        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Edit Event
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="date" className="text-sm text-gray-300 mb-1 block">
              Event Date
            </Label>
            <DatePickerInput value={date} onChange={setDate} />
          </div>

          <AddressInput value={title} onChange={setTitle} />

          <TimeInputs
            startTime={startTimeSys}
            stopTime={stopTimeSys}
            onStartChange={setTimeStartSys}
            onStopChange={setTimeStopSys}
            startTimeReal={startTimeReal}
            stopTimeReal={stopTimeReal}
            onStartRealChange={setTimeStartReal}
            onStopRealChange={setTimeStopReal}
          />

          <div className="flex items-center gap-3 pt-2">
            <input
              id="active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="form-checkbox h-4 w-4 text-green-500 bg-gray-700 border-gray-600 focus:ring-green-500"
            />
            <Label htmlFor="active" className="text-sm text-gray-300">
              Szkolenie
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              variant="default"
              className="w-full sm:w-1/2 text-base bg-green-900 hover:bg-green-700"
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-1/2 text-base bg-red-900 hover:bg-red-800"
              onClick={handleDelete}
            >
              Delete Event
            </Button>

          </div>
        </form>
      </div>
    </div>
  );
}
