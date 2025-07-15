"use client";
import React from "react";
import AuthGuard from "../AuthGuard";
import SVDashboard from "./SVDashboard";

export default function SVDashPage() {

  return (
    <AuthGuard allowedRoles={["SV"]}>
      <SVDashboard/>
    </AuthGuard>
  );
}
