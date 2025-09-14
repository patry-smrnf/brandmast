"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CardItem from "./components/CardItem";
import ContextMenu from "./components/ContextMenu";
import { CardType } from "./components/CardItem/CardType";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

/**
 * Helper: parse "DD.MM.YYYY" into a UTC Date (midnight UTC).
 * Returns null if parsing fails.
 */
function parseActionDateToUTC(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split(".");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map((p) => Number(p));
  if ([d, m, y].some((n) => Number.isNaN(n))) return null;
  // Date.UTC(year, monthIndex, day) -> milliseconds at 00:00:00 UTC
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Difference in full days between actionDate and today (action - today).
 * Uses UTC-midnight to avoid timezone / DST off-by-one issues.
 * Returns a signed integer (negative = past, positive = future, 0 = today).
 * If dateStr invalid => NaN
 */
function daysDiffFromToday(dateStr?: string): number {
  const actionDateUtc = parseActionDateToUTC(dateStr);
  if (!actionDateUtc) return NaN;

  const now = new Date();
  const todayUtcMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffMs = actionDateUtc.getTime() - todayUtcMs;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(diffMs / msPerDay);
}

/** Convert "DD.MM.YYYY" -> "MM.YYYY" used as the month key/value in selects. */
function monthKeyFromActionDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split(".");
  if (parts.length < 3) return null;
  const mm = parts[1].padStart(2, "0");
  const yyyy = parts[2];
  return `${mm}.${yyyy}`;
}

/** Current month key like "09.2025" */
function currentMonthKey(): string {
  const now = new Date();
  // note: getMonth() returns 0-based month index
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = String(now.getFullYear());
  return `${mm}.${yyyy}`;
}

/**
 * Local tag -> color map (kept here for backwards compatibility).
 * Consider centralizing in a shared module if used elsewhere.
 */

export default function BMDashboardPanel() {
  // UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All"); // "All" | "Past" | "Future"
  const [filterMonth, setFilterMonth] = useState<string>("All"); // "All" or "MM.YYYY"

  // data state
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Fetch cards on mount
  useEffect(() => {
    const controller = new AbortController();

    async function fetchCards() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const response = await apiFetch<CardType[]>(`/api/bm/actions`, {
          method: "GET",
        });

        const data: CardType[] = response;

        // Attach a tagColor early so UI components can rely on it.
        const updated = data.map((card) => ({
          ...card,
          // keep consistent fallback color (normalize key to uppercase)
        }));

        setCards(updated);

        // After we have data, set default month filter to the current month if present,
        // otherwise leave as "All".
        const monthsSet = new Set(
          updated
            .map((c) => monthKeyFromActionDate(c.action_date))
            .filter(Boolean) as string[]
        );
        const thisMonth = currentMonthKey();
        if (monthsSet.has(thisMonth)) {
          setFilterMonth(thisMonth);
        } else {
          setFilterMonth("All");
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error fetching cards:", err);
        setErrorMsg("Nie udało się pobrać danych.");
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
    return () => controller.abort();
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derived lists: tags and months (memoized)
  const tags = useMemo(
    () => ["All", ...Array.from(new Set(cards.map((c) => c.shop_name ?? "Unknown")))],
    [cards]
  );

  const months = useMemo(() => {
    const setMonths = new Set(
      cards
        .map((card) => monthKeyFromActionDate(card.action_date))
        .filter(Boolean) as string[]
    );
    // return "All" plus the found month keys in chronological order (sort by YYYY-MM)
    const monthArray = Array.from(setMonths).sort((a, b) => {
      // a and b like "MM.YYYY"
      const [am, ay] = a.split(".");
      const [bm, by] = b.split(".");
      const aKey = `${ay}-${am}`;
      const bKey = `${by}-${bm}`;
      if (aKey < bKey) return -1;
      if (aKey > bKey) return 1;
      return 0;
    });
    return ["All", ...monthArray];
  }, [cards]);

  // Status options in the UI (polish labels kept)
  const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: "All", label: "Wszystkie" },
    { value: "Past", label: "Odbyta" }, // past = strictly before today
    { value: "Future", label: "Nadchodzaca" }, // future = today or after
  ];

  // New filtering logic:
  // - Tag: straightforward equality (or All)
  // - Month: filter by "MM.YYYY" extracted from action_date (or All)
  // - Status: compute daysDiff = daysDiffFromToday(action_date)
  //     Past  => daysDiff < 0
  //     Future => daysDiff >= 0
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Tag filter
      const tagMatches = filterTag === "All" || card.shop_name === filterTag;

      // Month filter
      const cardMonth = monthKeyFromActionDate(card.action_date);
      const monthMatches = filterMonth === "All" || cardMonth === filterMonth;

      // Status filter
      if (filterStatus === "All") {
        // both past and future allowed
        return tagMatches && monthMatches;
      }
      const diff = daysDiffFromToday(card.action_date);
      // if invalid date, exclude from Past/Future specific filters
      if (Number.isNaN(diff)) return false;

      const isPast = diff < 0;
      const isFuture = diff >= 0; // today counts as future/upcoming for UI purposes

      const statusMatches =
        (filterStatus === "Past" && isPast) || (filterStatus === "Future" && isFuture);

      return tagMatches && monthMatches && statusMatches;
    });
  }, [cards, filterTag, filterMonth, filterStatus]);

  // Group cards by action_date for display (memoized)
  const groupedByDate = useMemo(() => {
    return Object.entries(
      filteredCards.reduce<Record<string, CardType[]>>((acc, card) => {
        const key = card.action_date ?? "Unknown Date";
        if (!acc[key]) acc[key] = [];
        acc[key].push(card);
        return acc;
      }, {})
    );
  }, [filteredCards]);

  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <span role="status">Loading cards…</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p>{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Context menu button (top-right) */}
      <div
        ref={menuRef}
        className="fixed top-4 right-4 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={toggleMenu}
          aria-label="Toggle menu"
          className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center focus:outline-none"
          type="button"
        >
          <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>

        {menuOpen && <ContextMenu closeMenu={() => setMenuOpen(false)} />}
      </div>

      {/* Main content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col items-center p-4 sm:p-6">
        {/* Filters */}
        <div className="w-full max-w-sm sm:max-w-md mb-4 sm:mb-6">
          <label htmlFor="tagFilter" className="block mb-1 font-semibold text-gray-300 text-sm sm:text-base">
            Filtruj eventy po tagu:
          </label>
          <select
            id="tagFilter"
            aria-label="Filter by tag"
            className="w-full bg-gray-800 text-white rounded-md p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          >
            {tags.map((tag, idx) => (
              <option key={idx} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          <label htmlFor="statusFilter" className="block mb-1 font-semibold text-gray-300 text-sm sm:text-base">
            Filtruj eventy po statusie:
          </label>
          <select
            id="statusFilter"
            aria-label="Filter by status"
            className="w-full bg-gray-800 text-white rounded-md p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <label htmlFor="monthFilter" className="block mb-1 font-semibold text-gray-300 text-sm sm:text-base">
            Filtruj eventy po miesiącu:
          </label>
          <select
            id="monthFilter"
            aria-label="Filter by month"
            className="w-full bg-gray-800 text-white rounded-md p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            {months.map((m, idx) => (
              <option key={idx} value={m}>
                {m === "All" ? "All months" : m}
              </option>
            ))}
          </select>
        </div>

        {/* Cards grouped by date */}
        <div className="flex flex-col gap-4 sm:gap-6 max-w-sm sm:max-w-md w-full">
          {groupedByDate.length === 0 && (
            <div className="text-gray-400">Brak eventów pasujących do filtrów.</div>
          )}

          {groupedByDate.map(([date, cardsOnDate]) => (
            <div
              key={date}
              className="border border-gray-700 rounded-xl p-4 bg-gray-800/50 backdrop-blur-md shadow-lg"
            >
              <h3 className="text-lg font-bold mb-4">{date}</h3>

              <div className="flex flex-col gap-4">
                {cardsOnDate.map((card, index) => {
                  // Prefer stable unique ID if available; fallback to composite key
                  const key = (card as any).id ?? `${card.shop_name}-${card.action_date}-${index}`;
                  return <CardItem key={key} card={card} />;
                })}
              </div>
            </div>
          ))}

          {/* Add new card placeholder */}
          <Link href="/NewEvent" passHref>
            <div className="bg-gray-800/40 backdrop-blur-md border border-dashed border-gray-600 shadow-xl rounded-2xl hover:scale-[1.05] transition-transform duration-300 flex items-center justify-center h-40 cursor-pointer">
              <span className="text-4xl text-gray-400" aria-hidden>
                +
              </span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
