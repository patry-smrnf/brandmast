"use client";
import React from "react";
import AuthGuard from "../AuthGuard";
import SVBmChartPage from "./SVBMsChart";

export default function SVBmChart() {

  return (
    <AuthGuard allowedRoles={["SV"]}>
      <SVBmChartPage/>
    </AuthGuard>
  );
}
