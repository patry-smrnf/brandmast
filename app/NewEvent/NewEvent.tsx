"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";

import DatePickerInput from "./components/DatePickerInput";
import AddressInput from "./components/AddressInput";
import TimeInputs from "./components/TimeInput";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { format as formatDate } from "date-fns";
import { apiFetch } from "@/lib/api";

/**
 * Normalize a time input to "HH:mm:ss" (returns null on invalid).
 * Accepts "HH", "HH:mm", "HH:mm:ss" and pads/truncates as needed.
 */
function normalizeTime(input?: string | null): string | null {
  if (!input) return null;
  const parts = String(input).trim().split(":").map((p) => p.trim());
  const [h = "0", m = "0", s = "0"] = parts.slice(0, 3);

  const pad2 = (v: string) =>
    String(Number(v || 0)).padStart(2, "0").slice(-2);

  const hh = Number(h);
  const mm = Number(m);
  const ss = Number(s);

  if (!Number.isFinite(hh) || hh < 0 || hh > 23) return null;
  if (!Number.isFinite(mm) || mm < 0 || mm > 59) return null;
  if (!Number.isFinite(ss) || ss < 0 || ss > 59) return null;

  return `${pad2(String(hh))}:${pad2(String(mm))}:${pad2(String(ss))}`;
}

/** Simple validator for HH:mm format */
const isHHMM = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

export default function NewEventPage() {
  const router = useRouter();

  const [address, setAddress] = useState("");
  const [systemStart, setSystemStart] = useState(""); // expected "HH:mm" in UI
  const [systemEnd, setSystemEnd] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [saving, setSaving] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // basic validation
      if (!date || !systemStart || !systemEnd || !address.trim()) {
        toast.error("Please fill all fields.");
        return;
      }

      if (!isHHMM(systemStart) || !isHHMM(systemEnd)) {
        toast.error("Times must be in HH:mm format.");
        return;
      }

      setSaving(true);

      const startNorm = normalizeTime(systemStart);
      const stopNorm = normalizeTime(systemEnd);

      if (!startNorm || !stopNorm) {
        toast.error("Invalid time values.");
        setSaving(false);
        return;
      }


      try {
        const res = await apiFetch(`/api/bm/addAction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action_date: formatDate(date, "dd.MM.yyyy"),
            action_system_start: `${startNorm}`, // "YYYY-MM-DD HH:mm:ss"
            action_system_end: `${stopNorm}`,
            shop_address: address.trim(),
          }),
        });

        toast.success("Event saved successfully!");
        router.push("/");

      } catch (err: any) {
        if (err?.name === "AbortError") {
          console.warn("Request aborted");
        } else {
          console.error("Error:", err);
          toast.error("[!] Error: " + err);
        }
      } finally {
        setSaving(false);
      }
    },
    [address, date, router, systemStart, systemEnd]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-gray-800/60 border border-gray-700 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white flex items-center gap-2 px-0"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <Label htmlFor="date" className="mb-1 text-gray-300 text-sm sm:text-base">
              Event Date
            </Label>
            <DatePickerInput value={date} onChange={setDate} />
          </div>

          <div className="mt-4 sm:mt-6">
            <AddressInput value={address} onChange={setAddress} />
          </div>

          <div className="mt-4 sm:mt-6">
            <TimeInputs
              startTime={systemStart}
              stopTime={systemEnd}
              onStartChange={setSystemStart}
              onStopChange={setSystemEnd}
            />
          </div>

          <Button type="submit" className="w-full text-sm sm:text-base" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
