"use client";

import React, { useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {

  //Do przenoszenia User
  const router = useRouter();

  //Do zarzadzania statusem user
  const [login, setLogin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //Zalap logowanie
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      try {
        const res = await apiFetch("/api/auth/login", { 
          method: "POST",
          headers: {
            "Content-Type": "application/json", // required for JSON body
          },
          body: JSON.stringify({
            login: login,
          }),
        })

        router.push("/");
      } catch (err) {
        setError("Blad: " + err);
      } finally {
        setLoading(false);
      }
    },
    [login, router]
  );


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <Card className="w-full max-w-md p-8 shadow-2xl rounded-2xl bg-gray-800 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-white">Brandmasteruj</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="user_login" className="text-gray-300">Login</Label>
              <Input
                id="user_login"
                type="text"
                placeholder="PLH0000"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="mt-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Logowanie..." : "Zaloguj się"}
            </Button>
          </form>

          {error && <p className="mt-4 text-center text-red-400">{error}</p>}

          <p className="mt-6 text-center text-sm text-gray-400">
            Problem z logowaniem?{" "}
            <a className="text-blue-400 hover:underline">
              Pisz do mnie na WhatsApp
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
