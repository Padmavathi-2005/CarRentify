"use client";

import AdminAnalysisView from "@/admin/views/AdminAnalysisView";
import { Suspense } from "react";

export default function AdminAnalysisPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <AdminAnalysisView />
    </Suspense>
  );
}
