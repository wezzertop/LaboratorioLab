import React from "react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { MobileNav } from "@/src/components/layout/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#050505] text-white overflow-hidden">
      {/* Mobile Navigation (top bar — shrinks to its own height) */}
      <MobileNav />

      {/* Desktop + mobile content row */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar for Desktop */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
