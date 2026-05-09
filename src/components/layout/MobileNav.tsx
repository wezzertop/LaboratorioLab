"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, HardHat } from "lucide-react";
import { Sidebar } from "./Sidebar";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden flex flex-col w-full bg-[#050505] border-b border-zinc-800 shrink-0 relative z-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF5F15] p-2 rounded-xl text-white shadow-[0_0_15px_rgba(255,95,21,0.4)]">
            <HardHat size={20} />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">CIVIL-LAB</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 h-[calc(100vh-73px)] bg-[#050505] overflow-y-auto z-50 border-t border-zinc-800 shadow-2xl">
          <div className="w-full">
            <Sidebar isMobile={true} onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
