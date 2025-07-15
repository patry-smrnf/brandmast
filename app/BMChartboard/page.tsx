"use client";
import AuthGuard from "../AuthGuard";
import BMChartBoard from "./ChartBoard";


export default function BMDashboard() {
  return (
  <AuthGuard allowedRoles={["BM"]}>
    <BMChartBoard/>
  </AuthGuard>  
  );
  
}
