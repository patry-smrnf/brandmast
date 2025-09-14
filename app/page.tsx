"use client";

import React, { useState, useEffect } from "react";
import BMDashBoard from "./BMDashboard/page";
import SVDashboard from "./SVDashBoard/page";
import NotAuthorized from "./Not-Authorized/page";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "./config";
import AdminPage from "./AdminBoard/page";
import { apiFetch } from "@/lib/api";
import { AuthMeType } from "@/types/AuthMe";

type UserRole = "BM" | "SV" | "ADMIN" | null;

export default function ModernDarkPage() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await apiFetch<AuthMeType>(`/api/auth/me`, {
          method: "GET",
        });

        const userRole = res.role.toUpperCase();
        if(userRole == "BM") {
          setRole("BM");
        }
        if(userRole == "SV") {
          setRole("SV");
        }
        if(userRole == "ADMIN") {
          setRole("ADMIN");
        }

        setLoading(false);
      } catch (err) {
        router.replace("/Login"); // No valid token
      }
    }

    verifyAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (role === "BM") return <BMDashBoard />;
  if (role === "SV") return <SVDashboard />;
  if (role === "ADMIN") return <AdminPage/>
 
  return <NotAuthorized />;
}
