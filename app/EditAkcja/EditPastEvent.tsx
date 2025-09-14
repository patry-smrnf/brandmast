"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";

import DatePickerInput from "./components/DatePickerInput";
import AddressInput from "./components/AddressInput";
import TimeInputs from "./components/TimeInput";
import { akcja_data } from "./types/akcja";
import { format as formatDate, parse, isValid as isValidDate } from "date-fns";
import { apiFetch } from "@/lib/api";

/**
 * Normalize a time-ish string to "HH:mm:ss" or return null if empty.
 * Accepts "HH", "HH:mm", "HH:mm:ss" and pads/truncates as needed.
 */
function normalizeTime(input: string | null | undefined): string | null {
  if (!input) return null;

  // Accept separators ":" only
  const parts = String(input).split(":").map((p) => p.trim());

  // allow up to 3 parts
  const [hh = "00", mm = "00", ss = "00"] = [...parts].slice(0, 3);
  const pad2 = (v: string) => v.padStart(2, "0").slice(-2);

  // basic numeric validation & bounds
  const numH = Number(hh) || 0;
  const numM = Number(mm) || 0;
  const numS = Number(ss) || 0;

  if (numH < 0 || numH > 23 || numM < 0 || numM > 59 || numS < 0 || numS > 59) {
    return null;
  }

  return `${pad2(String(numH))}:${pad2(String(numM))}:${pad2(String(numS))}`;
}

/** Convert "HH:mm:ss" or "HH:mm" to "HH:mm" for UI */
const normalizeTimeForUI = (t?: string | null) => {
  if (!t) return "";
  return t.length >= 5 ? t.slice(0, 5) : t;
};

export default function EditPastAkcjaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams?.get("id") ?? undefined;

  // form states (more explicit names)
  const [shopAddress, setShopAddress] = useState("");
  const [systemStart, setSystemStart] = useState("");
  const [systemEnd, setSystemEnd] = useState("");
  const [realStart, setRealStart] = useState("");
  const [realEnd, setRealEnd] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSzkolenie, setIsSzkolenie] = useState(false);

  // meta
  const [actionData, setActionData] = useState<akcja_data | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Safe normalization when API returns array or object
  const normalizeResponse = useCallback((json: any) => {
    if (Array.isArray(json)) return json[0] ?? null;
    return json;
  }, []);

  // Fetch action data
  useEffect(() => {
    if (!idParam) return;
    const controller = new AbortController();
    let mounted = true;

    const fetchAkcjaData = async () => {
      setLoading(true);
      try {
        const resp = await apiFetch<akcja_data>(
          `/api/bm/actions?actionID=${encodeURIComponent(idParam)}`,
          {
            method: "GET",
          }
        );

        const json = resp;
        const data = normalizeResponse(json) as akcja_data | null;

        if (!data) {
          throw new Error("No action data returned from API");
        }

        if (!mounted) return;

        setActionData(data);

        // Map API fields -> state
        setShopAddress(data.shop_address ?? "");
        setSystemStart(normalizeTimeForUI(data.action_system_start ?? ""));
        setSystemEnd(normalizeTimeForUI(data.action_system_end ?? ""));
        setRealStart(normalizeTimeForUI(data.action_real_start ?? ""));
        setRealEnd(normalizeTimeForUI(data.action_real_end ?? ""));

        // parse date safely from "dd.MM.yyyy"
        if (data.action_date) {
          const parsed = parse(data.action_date, "dd.MM.yyyy", new Date());
          setDate(isValidDate(parsed) ? parsed : undefined);
        } else {
          setDate(undefined);
        }

        // `past` might be boolean or string like "true"/"false"
        const pastFlag =
          typeof data.past === "boolean" ? data.past : String(data.past).toLowerCase() === "true";

        // keep original intent: szkolenie shown when past and data.szkolenie truthy
        setIsSzkolenie(Boolean(data.szkolenie) && pastFlag);
      } catch (err) {
        if ((err as any).name === "AbortError") {
          // ignore abort
          return;
        }
        console.error(err);
        toast.error("Failed to load event data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAkcjaData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [idParam, normalizeResponse]);

  // Derived flag whether to show szkolenie checkbox
  const showSzkolenieCheckbox = useMemo(() => {
    if (!actionData) return false;
    const p = actionData.past;
    return typeof p === "boolean" ? p : String(p).toLowerCase() === "true";
  }, [actionData]);

  // Validate a simple HH:mm string
  const isValidHHMM = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

  // Submit (edit)
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!idParam) {
        toast.error("Missing action ID.");
        return;
      }

      // Basic validation
      if (systemStart && !isValidHHMM(systemStart)) {
        toast.error("System start time must be in HH:mm format.");
        return;
      }
      if (systemEnd && !isValidHHMM(systemEnd)) {
        toast.error("System end time must be in HH:mm format.");
        return;
      }
      if (realStart && !isValidHHMM(realStart)) {
        toast.error("Real start time must be in HH:mm format.");
        return;
      }
      if (realEnd && !isValidHHMM(realEnd)) {
        toast.error("Real end time must be in HH:mm format.");
        return;
      }

      setSaving(true);
      try {
        const response = await apiFetch(`/api/bm/editAction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_action: Number(idParam),
            action_date: date ? formatDate(date, "dd.MM.yyyy") : "",
            shop_address: shopAddress,
            action_system_start: normalizeTime(systemStart) ?? null,
            action_system_end: normalizeTime(systemEnd) ?? null,
            action_real_start: normalizeTime(realStart) ?? null,
            action_real_end: normalizeTime(realEnd) ?? null,
            szkolenie: Boolean(isSzkolenie)
          }),
        });

        toast.success("Changes saved successfully!");
        router.push("/");
      } catch (error) {
        console.error(error);
        toast.error("[!] Error: " + error);
      } finally {
        setSaving(false);
      }
    },
    [
      idParam,
      date,
      shopAddress,
      systemStart,
      systemEnd,
      realStart,
      realEnd,
      isSzkolenie,
      router,
    ]
  );

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!idParam) {
      toast.error("Missing action ID.");
      return;
    }


    setDeleting(true);
    try {
      const response = await apiFetch(`/api/bm/delAction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_action: Number(idParam) }),
      });

      toast.success("Event deleted successfully!");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("[!] Error: " + error);
    } finally {
      setDeleting(false);
    }
  }, [idParam, router]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center px-4 py-10"
      aria-busy={loading}
    >
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

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Edit Event</h1>

        {loading && <div className="mb-4 text-center text-sm text-gray-300">Loading...</div>}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <Label htmlFor="date" className="text-sm text-gray-300 mb-1 block">
              Event Date
            </Label>
            <DatePickerInput value={date} onChange={setDate} />
          </div>

          <AddressInput value={shopAddress} onChange={setShopAddress} />

          <TimeInputs
            startTime={systemStart}
            stopTime={systemEnd}
            onStartChange={setSystemStart}
            onStopChange={setSystemEnd}
            startTimeReal={realStart}
            stopTimeReal={realEnd}
            onStartRealChange={setRealStart}
            onStopRealChange={setRealEnd}
            status_akcji={actionData ? actionData.past: false}
          />

          {showSzkolenieCheckbox && (
            <div className="flex items-center gap-3 pt-2">
              <input
                id="szkolenie"
                type="checkbox"
                checked={isSzkolenie}
                onChange={(e) => setIsSzkolenie(e.target.checked)}
                className="form-checkbox h-4 w-4 text-green-500 bg-gray-700 border-gray-600 focus:ring-green-500"
                aria-checked={isSzkolenie}
              />
              <Label htmlFor="szkolenie" className="text-sm text-gray-300">
                Szkolenie
              </Label>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              variant="default"
              className="w-full sm:w-1/2 text-base bg-green-900 hover:bg-green-700"
              disabled={saving}
              aria-disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-1/2 text-base bg-red-900 hover:bg-red-800"
              onClick={handleDelete}
              disabled={deleting}
              aria-disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
