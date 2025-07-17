"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react"; // optional icon for animation
import { API_BASE_URL } from "./config"

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        });

        const userRole = data.role?.toUpperCase();
        if (!allowedRoles.includes(userRole)) {
          router.replace("/Not-Authorized");
          return;
        }

        setLoading(false);
      } catch (err) {
        router.replace("/Login");
      }
    }

    verifyAuth();
  }, [allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
          <p className="text-lg font-medium text-muted-foreground tracking-wide">
            Verifying your access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
