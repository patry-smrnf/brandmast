"use client";

import React from "react";
import { Button } from "@/components/ui/button"; // shadcn button
import Link from "next/link";

export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/BMDashboard">
          <Button className="w-40 text-base">BM DASHBOARD</Button>
        </Link>
        <Link href="/SVDashBoard">
          <Button variant="secondary" className="w-40 text-base">
            SV DASHBOARD
          </Button>
        </Link>
      </div>
    </div>
  );
}
