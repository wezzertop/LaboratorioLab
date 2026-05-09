"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FolderOpen, HardHat, Layers, Settings, LogOut, Beaker, Truck, BookOpen } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';

export const Sidebar = ({ isMobile = false, onClose }: { isMobile?: boolean, onClose?: () => void }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  return (
    <aside className={`${isMobile ? 'w-full h-full' : 'w-64 hidden md:flex h-screen border-r border-zinc-800'} bg-[#0a0a0a] flex flex-col text-zinc-300 print:hidden shrink-0`}>
      {/* Logo header — only shown on desktop sidebar */}
      {!isMobile && (
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <div className="bg-[#FF5F15] p-2 rounded-xl text-white shadow-[0_0_15px_rgba(255,95,21,0.4)]">
            <HardHat size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">CIVIL-LAB</h1>
            <p className="text-[10px] text-[#FFEA00] font-bold tracking-widest uppercase">Sistema SaaS</p>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-4 no-scrollbar">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-2">Principal</div>
        
        <Link onClick={() => onClose?.()} href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${pathname === '/dashboard' ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-900/50 text-zinc-400 hover:text-white'}`}>
          <Home size={18} className={`${pathname === '/dashboard' ? 'text-[#FF5F15]' : 'group-hover:text-[#FF5F15]'}`} />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>
        
        <Link onClick={() => onClose?.()} href="/dashboard/projects" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${pathname.startsWith('/dashboard/projects') ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-900/50 text-zinc-400 hover:text-white'}`}>
          <FolderOpen size={18} className={`${pathname.startsWith('/dashboard/projects') ? 'text-[#FF5F15]' : 'group-hover:text-[#FF5F15]'}`} />
          <span className="text-sm font-medium">Proyectos</span>
        </Link>
        
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-6 mb-2 ml-2">Laboratorio</div>
        
        <Link onClick={() => onClose?.()} href="/dashboard/tests/asfalto" className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all shadow-sm ${pathname.startsWith('/dashboard/tests/asfalto') ? 'bg-[#141414] text-white border border-[#FF5F15]/30 shadow-[0_0_15px_rgba(255,95,21,0.05)]' : 'hover:bg-zinc-900/50 text-zinc-400 hover:text-white border border-transparent'}`}>
          <div className="flex items-center gap-3">
            <Truck size={18} className={`${pathname.startsWith('/dashboard/tests/asfalto') ? 'text-[#FF5F15]' : 'group-hover:text-[#FF5F15]'}`} />
            <span className="text-sm font-medium">Asfalto</span>
          </div>
          {pathname.startsWith('/dashboard/tests/asfalto') && <div className="w-1.5 h-1.5 rounded-full bg-[#FF5F15] shadow-[0_0_5px_#FF5F15]"></div>}
        </Link>
        
        <Link onClick={() => onClose?.()} href="/dashboard/tests/concreto" className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all shadow-sm ${pathname.startsWith('/dashboard/tests/concreto') ? 'bg-[#141414] text-white border border-zinc-500/30' : 'hover:bg-zinc-900/50 text-zinc-400 hover:text-white border border-transparent'}`}>
          <div className="flex items-center gap-3">
            <Beaker size={18} className={`${pathname.startsWith('/dashboard/tests/concreto') ? 'text-zinc-300' : 'group-hover:text-zinc-300'}`} />
            <span className="text-sm font-medium">Concreto</span>
          </div>
        </Link>
        
        <Link onClick={() => onClose?.()} href="/dashboard/tests/suelos" className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all shadow-sm ${pathname.startsWith('/dashboard/tests/suelos') ? 'bg-[#141414] text-white border border-[#b87333]/30' : 'hover:bg-zinc-900/50 text-zinc-400 hover:text-white border border-transparent'}`}>
          <div className="flex items-center gap-3">
            <Layers size={18} className={`${pathname.startsWith('/dashboard/tests/suelos') ? 'text-[#b87333]' : 'group-hover:text-[#b87333]'}`} />
            <span className="text-sm font-medium">Mecánica de Suelos</span>
          </div>
        </Link>

        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-6 mb-2 ml-2">Gestión</div>
        
        <Link onClick={() => onClose?.()} href="/dashboard/norms" className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all shadow-sm ${pathname.startsWith('/dashboard/norms') ? 'bg-[#141414] text-white border border-[#FF5F15]/30 shadow-[0_0_15px_rgba(255,95,21,0.05)]' : 'hover:bg-zinc-900/50 text-zinc-400 hover:text-white border border-transparent'}`}>
          <div className="flex items-center gap-3">
            <BookOpen size={18} className={`${pathname.startsWith('/dashboard/norms') ? 'text-[#FF5F15]' : 'group-hover:text-[#FF5F15]'}`} />
            <span className="text-sm font-medium">Normativas (SCT)</span>
          </div>
        </Link>
      </div>

      <div className="p-4 border-t border-zinc-800">
        <Link onClick={() => onClose?.()} href="/dashboard/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group mb-1 ${pathname === '/dashboard/settings' ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-900/50 text-zinc-400 hover:text-white'}`}>
          <Settings size={18} className={`${pathname === '/dashboard/settings' ? 'text-white' : 'group-hover:text-white'}`} />
          <span className="text-sm font-medium">Mi Perfil</span>
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors group">
          <LogOut size={18} />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
