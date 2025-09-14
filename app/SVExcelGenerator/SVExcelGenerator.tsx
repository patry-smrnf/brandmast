import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ContextMenu from "../SVComponents/ContextMenu";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "../config";

// Format for <input type="date"> (yyyy-MM-dd)
const formatDateForInput = (date: Date) => date.toISOString().split("T")[0];

// Format for API query (dd.MM.yyyy)
const formatDateForApi = (dateString: string) => {
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
};

const ExcelGeneratorBoard: React.FC = () => {
  const today = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(today.getMonth() + 1);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [startDate, setStartDate] = useState<string>(formatDateForInput(today));
  const [endDate, setEndDate] = useState<string>(formatDateForInput(oneMonthLater));
  const [isGenerating, setIsGenerating] = useState(false);
  const [fileReady, setFileReady] = useState(false);

  const [status, setStatus] = useState<"idle" | "generating" | "ready" | "error">("idle");

  const handleGenerate = async () => {
    setStatus("generating");

    // Convert to dd.MM.yyyy before sending
    const fromParam = formatDateForApi(startDate);
    const toParam = formatDateForApi(endDate);

    try {
      const response = await fetch(
        `/api/sv/dyspo?from=${fromParam}&to=${toParam}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${fromParam}-${toParam}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setStatus("ready");
    } catch (err) {
      console.error("File generation failed:", err);
      setStatus("error");
    }
  };


  return (
    <>
      <div
        ref={menuRef}
        className="fixed top-4 right-4 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center focus:outline-none"
          type="button"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
        {menuOpen && <ContextMenu closeMenu={() => setMenuOpen(false)} />}
      </div>

      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-zinc-900 text-white p-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <h1 className="text-3xl font-bold text-center text-white">
            Excel generator
          </h1>

          {/* Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Start Date */}
            <Card className="bg-gray-800/60 border border-gray-700/60 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400">
                  Start Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label
                  htmlFor="start-date"
                  className="text-gray-300 mb-2 block"
                >
                  Choose starting day
                </Label>
                <Input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-gray-700 text-white border-gray-600 focus:border-green-500 focus:ring-green-500"
                />
              </CardContent>
            </Card>

            {/* End Date */}
            <Card className="bg-gray-800/60 border border-gray-700/60 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400">
                  End Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="end-date" className="text-gray-300 mb-2 block">
                  Choose ending day
                </Label>
                <Input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-gray-700 text-white border-gray-600 focus:border-green-500 focus:ring-green-500"
                />
              </CardContent>
            </Card>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-8 py-3 text-lg font-semibold bg-green-700 hover:bg-green-600 rounded-xl shadow-lg"
            >
              {isGenerating ? "Generowanie..." : "Wygeneruj excel z dyspo"}
            </Button>
          </div>

          {/* Status Section */}
          <div className="flex justify-center">
            {status === "generating" && (
              <div className="bg-yellow-900/60 border border-yellow-700/60 text-yellow-200 px-6 py-3 rounded-xl shadow-lg animate-pulse">
                ⏳ Generowanie pliku... Please wait.
              </div>
            )}

            {status === "ready" && (
              <div className="bg-green-900/60 border border-green-700/60 text-green-200 px-6 py-3 rounded-xl shadow-lg">
                ✅ Plik zaczal sie pobierac!
              </div>
            )}

            {status === "error" && (
              <div className="bg-red-900/60 border border-red-700/60 text-red-200 px-6 py-3 rounded-xl shadow-lg">
                ❌ Jakis dziwny blad, upewnij ze daty sa ok.
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ExcelGeneratorBoard;
