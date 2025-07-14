"use client";

import AuthGuard from "../AuthGuard";
import NewEventPage from "./NewEvent";

export default function NewEvent() {
  return (
  <AuthGuard allowedRoles={["BM"]}>
    <NewEventPage/>
  </AuthGuard>  
  );
}
