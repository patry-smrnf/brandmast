import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardType } from "./CardType";

export default function CardItem({ card }: { card: CardType }) {
  return (
    <Card className="bg-gray-800/60 backdrop-blur-md border border-gray-700 shadow-xl rounded-xl sm:rounded-2xl hover:scale-[1.02] transition-transform duration-300 relative text-xs sm:text-sm p-3 sm:p-4">
      <CardContent className="">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-semibold text-white">
              {card.description}
            </h2>
          </div>
          {card.tag && (
            <span
              className={`text-[10px] sm:text-xs ${card.tagColor} text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide`}
            >
              {card.tag}
            </span>
          )}
        </div>
        <ul className="list-disc list-inside text-gray-400 text-xs sm:text-sm space-y-1">
          {card.details.map((point, idx) => (
            <li key={idx}>{point}</li>
          ))}
        </ul>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] sm:text-xs text-gray-500">
            {card.updated}
          </span>
          {card.cta && (
            <a href={card.cta.href}>
              <Button variant="secondary" className="text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5">
                {card.cta.label}
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
