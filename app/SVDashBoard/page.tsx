"use client";
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { BMData } from "./types/BMSData";
import { parse, format } from "date-fns";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthGuard from "../AuthGuard";

// Sample data (dates in DD.MM.YYYY)
const data: BMData[] = [
  {
    username: "PLH7502",
    akcje: [
      { date: "01.07.2025", address: "Chmielna 11", start_sys: "09:00", stop_sys: "13:00" },
      { date: "02.07.2025", address: "Chmielna 35", start_sys: "10:00", stop_sys: "14:30" },
    ],
  },
  {
    username: "PLH21372",
    akcje: [],
  },
  {
    username: "PLH0000",
    akcje: [
      { date: "01.07.2025", address: "Elektryczna 11", start_sys: "11:00", stop_sys: "15:00" },
      { date: "04.07.2025", address: "Swietokrzyska 31", start_sys: "08:00", stop_sys: "12:00" },
    ],
  },
  {
    username: "PLH6622",
    akcje: [
      { date: "03.07.2025", address: "Chmielna 11", start_sys: "12:30", stop_sys: "17:00" },
    ],
  },
  {
    username: "PLH2321",
    akcje: [
      { date: "02.07.2025", address: "Marszalkowska 11", start_sys: "09:00", stop_sys: "11:00" },
    ],
  },
];

function calculateHours(start: string, stop: string): number {
  const [h1, m1] = start.split(":").map(Number);
  const [h2, m2] = stop.split(":").map(Number);
  return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
}

export default function SVDashboard() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date(2025, 6, 1)); // July 2025
  const [selectedDate, setSelectedDate] = React.useState(new Date(2025, 6, 1));

  const selectedDateStr = format(selectedDate, "dd.MM.yyyy");

  // Sum hours per user for currentMonth
  const summaryByMonth = data.reduce<Record<string, number>>((acc, user) => {
    const total = user.akcje
      .map((a) => {
        const d = parse(a.date, "dd.MM.yyyy", new Date());
        return {
          date: d,
          hours: calculateHours(a.start_sys, a.stop_sys),
        };
      })
      .filter((x) =>
        x.date.getFullYear() === currentMonth.getFullYear() &&
        x.date.getMonth() === currentMonth.getMonth()
      )
      .reduce((sum, x) => sum + x.hours, 0);

    acc[user.username] = total;
    return acc;
  }, {});

  const summaryArray = Object.entries(summaryByMonth).map(([username, hrs]) => ({
    username,
    hours: hrs.toFixed(2),
  }));

  const dayEvents = data.flatMap((user) =>
    user.akcje
      .filter((a) => a.date === selectedDateStr)
      .map((a) => ({ ...a, username: user.username }))
  );
  const prevMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  return (
    <AuthGuard allowedRoles={["SV"]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col items-center p-4 sm:p-6 gap-8">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {/* Monthly Summary */}
          <div className="border border-gray-700 rounded-xl p-4 bg-gray-800/50 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Podsumowanie BM</h2>
              <div className="flex gap-2 items-center">
                <button onClick={prevMonth} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">
                  ← Prev
                </button>
                <span className="text-sm">
                  {format(currentMonth, "LLLL yyyy")}
                </span>
                <button onClick={nextMonth} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">
                  Next →
                </button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Login</TableHead>
                  <TableHead className="text-white text-right">Suma godzin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryArray.map((it, i) => (
                  <TableRow key={i} className="hover:bg-gray-900">
                    <TableCell className="font-semibold">{it.username}</TableCell>
                    <TableCell className="text-right">{it.hours} h / 80</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Calendar & Add New Event */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Calendar */}
          <Card className="w-fit py-4 bg-gray-900/50 backdrop-blur-md border border-gray-700 text-white">
              <CardContent className="px-4">
              <Calendar
                  mode="single"
                  selected={selectedDate}
                  month={currentMonth}
                  onSelect={(d) => d && setSelectedDate(d)}
                  onMonthChange={(d) => setCurrentMonth(d)}
                  className="bg-transparent p-0 text-white"
                  required
              />
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-3 border-t border-gray-700 px-4 !pt-4">
              <div className="text-sm font-medium">
                  {format(selectedDate, "d LLLL yyyy")}
              </div>
              <div className="flex flex-col gap-2 w-full">
                  {dayEvents.length === 0 ? (
                  <div className="text-sm text-gray-400">Brak dodanych akcji</div>
                  ) : (
                  dayEvents.map((evt, i) => (
                      <div
                      key={i}
                      className="bg-gray-800 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full after:bg-white"
                      >
                      <div className="font-medium">{evt.username}</div>
                      <div className="text-gray-400 text-xs">
                          {evt.start_sys} - {evt.stop_sys} @ {evt.address}
                      </div>
                      </div>
                  ))
                  )}
              </div>
              </CardFooter>
          </Card>
          <Link href="/EditNewEvent" className="flex-1">
            <div className="h-full bg-green-800/20 backdrop-blur-md border border-dashed border-green-600 shadow-xl rounded-2xl hover:scale-[1.05] transition-transform duration-300 flex items-center justify-center cursor-pointer">
              <span className="text-4xl text-gray-400">Pobierz Excela</span>
            </div>
          </Link>
          </div>
          {/* Form Section */}
        <Card className="w-full bg-gray-900/50 backdrop-blur-md border border-gray-700 text-white">
          <CardContent className="p-6 flex flex-col gap-4">
            <h1 className="text-xl font-bold">Dodaj Alert dla swoich bm</h1>
            <Input
              type="text"
              placeholder="Tresc alertu"
              className="bg-gray-800/40 border-gray-600 placeholder:text-gray-500 text-white"
            />
            <Button className="bg-gray-700 hover:bg-gray-600 transition-colors">
              Dodaj
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    </AuthGuard>

  );
}
