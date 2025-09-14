"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { parse, isValid, format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { BMResData } from "./types/BMResponse";
import ContextMenu from "../SVComponents/ContextMenu";
import { apiFetch } from "@/lib/api";

function calculateHours(start: string, stop: string): number {
  if (!start || !stop) return 0;
  const sParts = start.split(":").map(Number);
  const eParts = stop.split(":").map(Number);
  if (sParts.some(isNaN) || eParts.some(isNaN)) return 0;

  const startMinutes = sParts[0] * 60 + (sParts[1] ?? 0) + ((sParts[2] ?? 0) / 60);
  const endMinutes = eParts[0] * 60 + (eParts[1] ?? 0) + ((eParts[2] ?? 0) / 60);

  let diff = endMinutes - startMinutes;
  if (diff < 0) diff += 24 * 60; // cross-midnight
  return diff / 60;
}

/** parse a date string in dd.MM.yyyy; returns a Date or invalid Date */
function parseDDMMYYYY(dateStr: string): Date {
  if (!dateStr) return new Date("invalid");
  const d = parse(dateStr, "dd.MM.yyyy", new Date());
  return isValid(d) ? d : new Date("invalid");
}

export default function SVDashboard() {
  // Server data (typed)
  const [bmData, setBmData] = useState<BMResData[]>([]);
  const [loading, setLoading] = useState(false);

  // Context menu
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateStr = format(selectedDate, "dd.MM.yyyy");

  // Pagination / UI state
  const [rowsPerPage, setRowsPerPage] = useState(10); // default a bit larger on desktop
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data — re-run when month changes (server expects month param)
  useEffect(() => {
    let mounted = true;
    const fetchBMdata = async () => {
      setLoading(true);
      try {
        const res = await apiFetch<BMResData[]>(
          `/api/sv/myBms?month=${currentMonth.getMonth() + 1}`,
          { method: "GET" }
        );
        const data: BMResData[] = res;

        if (mounted) {
          setBmData(data);
        }
      } catch (err: any) {
        console.error("fetchBMdata error:", err);
        toast.error("Błąd pobierania danych: " + (err?.message ?? err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchBMdata();
    return () => {
      mounted = false;
    };
  }, [currentMonth]);

  // Derived: monthly summary (username -> total hours for currentMonth)
  const summaryByMonth = useMemo(() => {
    const acc: Record<string, number> = {};
    bmData.forEach((bm) => {
      const total = (bm.actions ?? [])
        .map((a) => {
          const d = parseDDMMYYYY(a.action_date);
          return { date: d, hours: calculateHours(a.action_system_start, a.action_system_end) };
        })
        .filter(
          (x) =>
            isValid(x.date) &&
            x.date.getFullYear() === currentMonth.getFullYear() &&
            x.date.getMonth() === currentMonth.getMonth()
        )
        .reduce((s, x) => s + x.hours, 0);
      acc[bm.bm_login] = total;
    });
    return acc;
  }, [bmData, currentMonth]);

  const summaryArray = useMemo(
    () => Object.entries(summaryByMonth).map(([username, hrs]) => ({ username, hours: hrs.toFixed(2) })),
    [summaryByMonth]
  );

  // Simple client-side search/filter for desktop
  const filteredSummary = useMemo(() => {
    if (!searchQuery.trim()) return summaryArray;
    const q = searchQuery.trim().toLowerCase();
    return summaryArray.filter((s) => s.username.toLowerCase().includes(q));
  }, [summaryArray, searchQuery]);

  // dayEvents for selected day
  const dayEvents = useMemo(() => {
    return bmData
      .flatMap((bm) =>
        (bm.actions ?? [])
          .filter((a) => {
            return a.action_date === selectedDateStr;
          })
          .map((a) => ({
            ...a,
            username: bm.bm_imie + " " + bm.bm_nazwisko,
          }))
      )
      .sort((x, y) => (x.action_system_start || "").localeCompare(y.action_system_start || ""));
  }, [bmData, selectedDateStr]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filteredSummary.length / rowsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedSummary = useMemo(
    () => filteredSummary.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [filteredSummary, rowsPerPage, currentPage]
  );

  const prevMonth = () => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  // Desktop export handler placeholder (CSV)
  const handleExportCSV = () => {
    // Create simple CSV from summaryArray — replace with server export if needed
    const rows = [["login", "hours"], ...summaryArray.map((s) => [s.username, s.hours])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bm-summary-${format(currentMonth, "yyyy-MM")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Floating context menu button */}
      <div ref={menuRef} className="fixed top-4 right-4 z-50" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center focus:outline-none ring-2 ring-transparent hover:ring-white/20 transition"
          type="button"
        >
          <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
        {menuOpen && <ContextMenu closeMenu={() => setMenuOpen(false)} />}
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto grid gap-8 grid-cols-1 lg:grid-cols-12 items-start">
          {/* MAIN: Summary (spans 8 columns on large screens) */}
          <main className="lg:col-span-8 flex flex-col gap-6">
            <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-700 shadow-lg">
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block text-sm text-gray-400">Miesięczne podsumowanie — {format(currentMonth, "LLLL yyyy")}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-700 rounded px-2 py-1">
                        <button onClick={prevMonth} className="px-2 py-1 rounded-md text-sm" aria-label="Previous month">←</button>
                        <div className="text-sm text-gray-200 font-medium">{format(currentMonth, "LLLL yyyy")}</div>
                        <button onClick={nextMonth} className="px-2 py-1 rounded-md text-sm" aria-label="Next month">→</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Input
                        placeholder="Szukaj loginu..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="bg-gray-800/40 border-gray-700 text-white w-full md:w-56"
                      />

                      <select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="text-sm bg-gray-800/60 border border-gray-700 rounded px-2 py-1 text-gray-200"
                        aria-label="Rows per page"
                      >
                        {[5, 10, 20, 50].map((n) => (
                          <option key={n} value={n}>
                            {n} Rekordów
                          </option>
                        ))}
                      </select>

                      <Button onClick={handleExportCSV} className="hidden md:inline-flex">
                        Eksport CSV
                      </Button>
                    </div>
                  </div>
                </div>

                {/* table area: constrained height with internal scroll on desktop for nicer UX */}
                <div className="mt-4 border border-gray-800 rounded-md overflow-hidden">
                  <div className="bg-gray-900/30 px-4 py-2 text-xs text-gray-400 flex items-center justify-between">
                    <div>Lista bm — {filteredSummary.length} wpisów</div>
                    <div className="hidden sm:block text-xs text-gray-400">Widok mieszczący {rowsPerPage} wpisów na stronę</div>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto">
                    <div className="min-w-full">
                      <Table className="min-w-[600px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-white">Login</TableHead>
                            <TableHead className="text-white text-right">Suma godzin (miesiąc)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedSummary.map((it) => (
                            <TableRow key={it.username} className="hover:bg-gray-900">
                              <TableCell className="font-semibold text-gray-200 truncate max-w-[320px]">{it.username}</TableCell>
                              <TableCell className="text-right text-gray-200">{it.hours} h / 80</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* pagination */}
                  <div className="px-4 py-3 flex items-center justify-between text-sm bg-gray-900/10">
                    <div className="text-gray-300">
                      Strona <span className="font-medium">{currentPage}</span> z <span className="font-medium">{totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="px-3 py-1 text-gray-200 bg-gray-800/60 hover:bg-gray-800 rounded disabled:opacity-50 text-sm"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1 text-gray-200 bg-gray-800/60 hover:bg-gray-800 rounded disabled:opacity-50 text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Optional: additional content area - keep for future widgets */}
            {/* Example placeholder area so the main column doesn't look empty on very wide screens */}
            <div className="hidden lg:block">
              <Card className="bg-gray-900/40 border border-gray-700">
                <CardContent className="p-4 text-sm text-gray-400">
                  {/* Here you can add charts / KPIs / filters for desktop */}
                  Szybkie statystyki / wykresy (miejsce na przyszłe widgety)
                </CardContent>
              </Card>
            </div>
          </main>

          {/* SIDEBAR: Calendar + Form (spans 4 columns) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* Calendar card: sticky on large screens so it remains visible while you scroll the main list */}
            <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-700 text-white">
              <CardContent className="px-4 pt-4">
                <div className="lg:sticky lg:top-24">
                  <div className="mx-auto max-w-[320px]">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      month={currentMonth}
                      onSelect={(d) => d && setSelectedDate(d)}
                      onMonthChange={(d) => setCurrentMonth(d)}
                      className="bg-transparent p-0 text-white"
                      required
                    />
                  </div>

                  <div className="mt-3 text-sm font-medium">{format(selectedDate, "d LLLL yyyy")}</div>

                  <div className="flex flex-col gap-2 w-full mt-3">
                    {dayEvents.length === 0 ? (
                      <div className="text-sm text-gray-400">Brak dodanych akcji</div>
                    ) : (
                      dayEvents.map((evt, i) => (
                        <div
                          key={i}
                          className="bg-gray-800 relative rounded-md p-3 pl-8 text-sm"
                        >
                          <div className="absolute left-3 top-3 h-2 w-2 rounded-full bg-white" />
                          <div className="font-medium">{evt.username}</div>
                          <div className="text-gray-400 text-xs">
                            {evt.action_system_start} - {evt.action_system_end} @ {evt.shop_name}
                            {evt.shop_address ? ` — ${evt.shop_address}` : ""}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form appears below calendar on desktop but is first on mobile (order classes not needed here because grid places sidebar after main) */}
            <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-700 text-white">
              <CardContent className="p-4 flex flex-col gap-3">
                <h3 className="text-lg font-semibold">Dodaj Alert dla swoich BM</h3>
                <div className="text-sm text-gray-400">NIE ZOSTAŁO ZAIMPLEMENTOWANE W SYSTEMIE (demo)</div>
                <Input type="text" placeholder="Treść alertu" className="bg-gray-800/40 border-gray-600 placeholder:text-gray-500 text-white" />
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => toast.message("Dodaj alert (demo)")}>
                    Dodaj
                  </Button>
                  <Button className="hidden sm:inline-flex" onClick={() => console.log("Wyczyść")}>
                    Wyczyść
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* mobile floating Add button (keeps your favorite mobile CTA) */}
        <div className="fixed left-4 bottom-6 z-40 sm:hidden">
          <button
            className="w-12 h-12 rounded-full bg-indigo-600 shadow-lg flex items-center justify-center text-white"
            aria-label="Dodaj alert"
            onClick={() => toast.message("Szybkie dodanie (demo)")}
          >
            +
          </button>
        </div>

        {/* lightweight loading overlay */}
        {loading && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 pointer-events-none">
            <div className="px-4 py-2 rounded bg-gray-800/80 text-white text-sm">Ładowanie danych…</div>
          </div>
        )}
      </div>
    </>
  );
}
