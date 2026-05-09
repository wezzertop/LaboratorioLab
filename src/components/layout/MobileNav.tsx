"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, HardHat } from "lucide-react";
import { Sidebar } from "./Sidebar";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Top bar — always visible on mobile */}
      <div className="md:hidden flex items-center justify-between w-full bg-[#050505] border-b border-zinc-800 shrink-0 z-40 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF5F15] p-2 rounded-xl text-white shadow-[0_0_15px_rgba(255,95,21,0.4)]">
            <HardHat size={20} />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">CIVIL-LAB</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menú"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Full-screen overlay sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[200] md:hidden"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer panel */}
          <div className="absolute inset-y-0 left-0 w-[280px] flex flex-col bg-[#0a0a0a] shadow-2xl border-r border-zinc-800 overflow-y-auto">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-[#FF5F15] p-2 rounded-xl text-white shadow-[0_0_15px_rgba(255,95,21,0.4)]">
                  <HardHat size={18} />
                </div>
                <span className="text-base font-bold text-white tracking-tight">CIVIL-LAB</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar menú"
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sidebar content */}
            <div className="flex-1">
              <Sidebar isMobile={true} onClose={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
