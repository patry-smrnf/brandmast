"use client";
import React, { useState, useRef, useEffect } from "react";
import CardItem from "./components/CardItem";
import ContextMenu from "./components/ContextMenu";
import { CardType } from "./components/CardItem/CardType";
import Link from "next/link";

export default function BMDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cards: CardType[] = [
    {
      status: "przeszla",
      date: "01.07.2025",
      tag: "ZABKA",
      tagColor: "bg-green-600",
      updated: "1 days ago",
      description: "Chmielna 11",
      details: ["System time: 12:00 - 16:00", "Real time: 12:40 - 16:50"],
      cta: {
        label: "Info",
        href: "/EditPastEvent",
      },
    },
    {
      status: "przeszla",
      date: "02.07.2025",
      tag: "CARREFOUR",
      tagColor: "bg-orange-600",
      updated: "Today",
      description: "Elektryczna 11",
      details: ["System time: 14:00 - 16:00", "Real time: 14:40 - 16:50"],
      cta: {
        label: "Info",
        href: "/EditPastEvent",
      },
    },
    {
      status: "przeszla",
      date: "03.07.2025",
      tag: "CARREFOUR",
      tagColor: "bg-orange-600",
      updated: "1 days ahead",
      description: "Swietokrzyska 18",
      details: ["System time: 13:00 - 18:00"],
      cta: {
        label: "Info",
        href: "/EditPastEvent",
      },
    },
    {
      status: "przeszla",
      date: "03.07.2025",
      tag: "ZABKA",
      tagColor: "bg-green-600",
      updated: "1 days ahead",
      description: "Swietokrzyska 31",
      details: ["System time: 18:00 - 23:00"],
      cta: {
        label: "Info",
        href: "/EditPastEvent",
      },
    },

    {
      status: "przyszla",
      date: "04.07.2025",
      tag: "VELO",
      tagColor: "bg-blue-600",
      updated: "2 days ahead",
      description: "VELO",
      details: ["System time: 18:00 - 23:00"],
      cta: {
        label: "Info",
        href: "/EditNewEvent",
      },
    },
  ];

  // Unique tag list
  const tags = ["All", ...Array.from(new Set(cards.map((card) => card.tag)))];
  const statuses = ["All", "przyszla", "przeszla"];

  // Apply both filters
  const filteredCards = cards.filter((card) => {
    const tagMatches = filterTag === "All" || card.tag === filterTag;
    const statusMatches = filterStatus === "All" || card.status === filterStatus;
    return tagMatches && statusMatches;
  });

  return (
    <>
      {/* Context menu button */}
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

      {/* Page content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col items-center p-4 sm:p-6">
        {/* Tag filter */}
        <div className="w-full max-w-sm sm:max-w-md mb-4 sm:mb-6">
          <label
            htmlFor="tagFilter"
            className="block mb-1 font-semibold text-gray-300 text-sm sm:text-base"
          >
            Filtruj eventy po tagu:
          </label>
          <select
            id="tagFilter"
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

          <label
            htmlFor="statusFilter"
            className="block mb-1 font-semibold text-gray-300 text-sm sm:text-base"
          >
            Filtruj eventy po statusie:
          </label>
          <select
            id="statusFilter"
            className="w-full bg-gray-800 text-white rounded-md p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {statuses.map((status, idx) => (
              <option key={idx} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-4 sm:gap-6 max-w-sm sm:max-w-md w-full">
          {Object.entries(
            filteredCards.reduce<Record<string, CardType[]>>((acc, card) => {
              if (!acc[card.date]) acc[card.date] = [];
              acc[card.date].push(card);
              return acc;
            }, {})
          ).map(([date, cardsOnDate]) => (
            <div
              key={date}
              className="border border-gray-700 rounded-xl p-4 bg-gray-800/50 backdrop-blur-md shadow-lg"
            >
              <h3 className="text-lg font-bold mb-4">{date}</h3>
              <div className="flex flex-col gap-4">
                {cardsOnDate.map((card, index) => (
                  <CardItem key={index} card={card} />
                ))}
              </div>
            </div>
          ))}

          {/* Add new card */}
          <Link href="/EditNewEvent">
            <div className="bg-gray-800/40 backdrop-blur-md border border-dashed border-gray-600 shadow-xl rounded-2xl hover:scale-[1.05] transition-transform duration-300 flex items-center justify-center h-40 cursor-pointer">
              <span className="text-4xl text-gray-400">+</span>
            </div>
          </Link>
        </div>



      </div>
    </>
  );
}
