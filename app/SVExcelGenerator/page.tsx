"use client";
import React from "react";
import AuthGuard from "../AuthGuard";
import SVExcelGenerator from "./SVExcelGenerator";

export default function SVExcelGeneratorPage() {

  return (
    <AuthGuard allowedRoles={["SV"]}>
      <SVExcelGenerator/>
    </AuthGuard>
  );
}
