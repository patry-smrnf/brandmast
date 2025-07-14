"use client";

import AuthGuard from "../AuthGuard";
import EditPastAkcjaPage from "./EditPastEvent";

export default function NewEvent() {
  return (
  <AuthGuard allowedRoles={["BM"]}>
    <EditPastAkcjaPage/>
  </AuthGuard>  
  );
}
