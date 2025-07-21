"use client"
import React from "react";
import { useState, useEffect, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { parse, format } from "date-fns";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { BMResData } from "./types/BMResponse";
import ContextMenu from "./ContextMenu";
import { API_BASE_URL } from "../config";

function calculateHours(start: string, stop: string): number {
  const [h1, m1] = start.split(":").map(Number);
  const [h2, m2] = stop.split(":").map(Number);
  return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
}

export default function SVDashboard() {
    const [currentMonth, setCurrentMonth] = React.useState(new Date(2025, 6, 1)); // July 2025
    const [selectedDate, setSelectedDate] = React.useState(new Date(2025, 6, 1));
    const [bmData, setBmData] = useState<BMResData[]>();

    const menuRef = useRef<HTMLDivElement | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

      const handleClick = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sv/dyspo`, {
        method: 'GET',
        credentials: 'include', // This sends cookies/auth info
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // If you expect a file (Excel), handle the response as a blob:
      const blob = await response.blob();

      // Create a download link and click it programmatically
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'file.xlsx'; // Set desired file name
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error fetching the Excel file:', error);
    }
  };
  
    useEffect(() => {
        const fetchBMdata = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/sv/myBMs`, {
                    method: "GET",
                    credentials: "include"
                });

                if(!response.ok) {
                    const errorData = await response.json();
                    toast.error(errorData.message || "Unknown error occurred");
                    throw new Error("Failed to fetch data");
                }

                const data: BMResData[] = await response.json();
                setBmData(data);
            }
            catch(error) {
                toast.error("Erorr: " + error);
            }
        };
        fetchBMdata();
    }, []);

    const selectedDateStr = format(selectedDate, "dd.MM.yyyy");

    const summaryByMonth = (bmData ?? []).reduce<Record<string, number>>((acc, user) => {
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

    acc[user.login] = total;
    return acc;
    }, {});

    const summaryArray = Object.entries(summaryByMonth).map(([username, hrs]) => ({
    username,
    hours: hrs.toFixed(2),
    }));

    const dayEvents = (bmData ?? []).flatMap((user) =>
    user.akcje
        .filter((a) => a.date === selectedDateStr)
        .map((a) => ({ ...a, username: user.login }))
    );

    const prevMonth = () =>
        setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
    const nextMonth = () =>
        setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

    return(
        <>
        {/* Context menu button */}
        <div ref={menuRef} className="fixed top-4 right-4 z-50" onClick={(e) => e.stopPropagation()} >
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center focus:outline-none" type="button">
            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            </button>
            {menuOpen && <ContextMenu closeMenu={() => setMenuOpen(false)} />}
        </div>
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
          <Link href="/" className="flex-1">
            <div onClick={handleClick} className="h-full bg-green-800/20 backdrop-blur-md border border-dashed border-green-600 shadow-xl rounded-2xl hover:scale-[1.05] transition-transform duration-300 flex items-center justify-center cursor-pointer">
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
        </>
    );
}