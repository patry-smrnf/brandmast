"use client";
import React from "react";
import AuthGuard from "../AuthGuard";
import AdminBoard from "./AdminBoard";

export default function AdminPage() {

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <AdminBoard/>
    </AuthGuard>
  );
}
