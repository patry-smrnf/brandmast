import React, { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardType } from "./CardType";

/**
 * Map store names to tailwind background classes.
 * Consider moving this to a shared constants file if used elsewhere.
 */
const TAG_COLOR_MAP: Record<string, string> = {
  ZABKA: "bg-green-600",
  CARREFOUR: "bg-orange-600",
  VELO: "bg-blue-600",
  BEN: "bg-red-800",
  INMEDIO: "bg-yellow-700",
  "CIRLE K":"bg-red-700"
};

/**
 * Parse a date in "DD.MM.YYYY" and return difference in days from today.
 * Uses UTC-midnight to avoid DST/local-time off-by-one issues.
 *
 * @param dateStr "DD.MM.YYYY"
 * @returns positive => in the future, negative => in the past, 0 => today
 */
function countActionDaysDifference(dateStr: string): number {
  if (!dateStr) return NaN;

  const parts = dateStr.split(".");
  if (parts.length !== 3) return NaN;

  const [day, month, year] = parts.map((p) => Number(p));
  if ([day, month, year].some((n) => Number.isNaN(n))) return NaN;

  const msPerDay = 1000 * 60 * 60 * 24;
  // Use UTC dates at midnight to avoid timezone DST issues
  const actionUtc = Date.UTC(year, month - 1, day);
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const diffMs = actionUtc - todayUtc;
  return Math.round(diffMs / msPerDay);
}

/**
 * Return Tailwind bg-color class for a shop name (case-insensitive).
 * Falls back to neutral gray.
 */
function bgColorForShop(shopName?: string): string {
  if (!shopName) return "bg-gray-400";
  // Normalize (upper-case) to match map keys
  const normalized = shopName.toUpperCase();
  return TAG_COLOR_MAP[normalized] ?? "bg-gray-400";
}

interface Props {
  card: CardType;
}

/**
 * Presentational component for a single card/event.
 * memoized for small performance gains when rendering lists.
 */
const CardItem: React.FC<Props> = ({ card }) => {
  const daysUntil = countActionDaysDifference(card.action_date);

  return (
    <Card className="bg-gray-800/60 backdrop-blur-md border border-gray-700 shadow-xl rounded-xl sm:rounded-2xl hover:scale-[1.02] transition-transform duration-300 relative text-xs sm:text-sm p-3 sm:p-4">
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-semibold text-white">
              {card.shop_address ?? "—"}
            </h2>
          </div>

          {card.shop_name && (
            <span
              className={`text-[10px] sm:text-xs ${bgColorForShop(
                card.shop_name
              )} text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide`}
              aria-hidden
            >
              {card.shop_name}
            </span>
          )}
        </div>

        <ul className="list-disc list-inside text-gray-400 text-xs sm:text-sm space-y-1 mt-2">
          <li>
            Start {card.action_system_start ?? "—"} — Stop {card.action_system_end ?? "—"}
          </li>

          {card.action_real_start && (
            <li>
              Real Start {card.action_real_start} — Real Stop {card.action_real_end ?? "—"}
            </li>
          )}
        </ul>

        <div className="flex items-center justify-between pt-2">
          <span
            className="text-[10px] sm:text-xs text-gray-500"
            title={`Difference in days from ${card.action_date}`}
          >
            {Number.isNaN(daysUntil) ? (
              "—"
            ) : daysUntil < 0 ? (
              <>Odbyło się: {Math.abs(daysUntil)} dni temu</>
            ) : daysUntil > 0 ? (
              <>Odbędzie się za: {daysUntil} dni</>
            ) : (
              "Dzisiaj bedzie:3"
            )}
          </span>

          {card.cta?.href && (
            <a
              href={card.cta.href}
              target={card.cta.href.startsWith("http") ? "_blank" : undefined}
              rel={card.cta.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              <Button
                variant="secondary"
                className="text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5"
                aria-label={card.cta.label ?? "Call to action"}
              >
                {card.cta.label ?? "Open"}
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(CardItem);
