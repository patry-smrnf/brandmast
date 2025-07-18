"use client";
import React from "react";
import AuthGuard from "../AuthGuard";
import SVShopboard from "./SVShopboard";

export default function SVDashPage() {

  return (
    <AuthGuard allowedRoles={["SV"]}>
      <SVShopboard/>
    </AuthGuard>
  );
}
