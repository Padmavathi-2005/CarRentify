"use client";

import React from "react";
import AdminClaimsView from "@/admin/views/AdminClaimsView";

export default function AdminClaimsPage() {
  return (
    <div className="admin-page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[var(--admin-text-main)] tracking-tight">
          Claims Management
        </h1>
        <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">
          Review and process protection plan claims
        </p>
      </div>
      <AdminClaimsView />
    </div>
  );
}
