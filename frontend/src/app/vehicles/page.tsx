import VehiclesView from "@/views/VehiclesView";
import { Suspense } from "react";

export default function Page() {
 return (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground font-black uppercase tracking-widest animate-pulse">Initializing Vehicle Registry...</div>}>
  <VehiclesView />
  </Suspense>
 );
}
