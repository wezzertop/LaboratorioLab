"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, LayoutList, LayoutGrid, Calendar, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TestDashboardProps {
  /** Icon element for the module, e.g. <Truck size={20}/> */
  icon: React.ReactNode;
  /** Module display name */
  title: string;
  /** Dashboard subtitle */
  subtitle: string;
  /** Accent color class for icon bg on hover, e.g. "bg-[#FF5F15]" */
  accentBg: string;
  /** Accent color class for icon text, e.g. "text-[#FF5F15]" */
  accentText: string;
  /** Accent border class for the header card, e.g. "border-[#FF5F15]/30" */
  accentBorder: string;
  /** Accent shadow class for the header card */
  accentShadow: string;
  /** The test_type string used in URLs, e.g. "asfalto" */
  testType: string;
  /** Pre-fetched tests array */
  tests: any[];
  loading: boolean;
}

export function TestDashboard({
  icon,
  title,
  subtitle,
  accentBg,
  accentText,
  accentBorder,
  accentShadow,
  testType,
  tests,
  loading,
}: TestDashboardProps) {
  const router = useRouter();

  // Default: list on desktop, grid on mobile (detected via window width)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setViewMode(mq.matches ? 'grid' : 'list');
    const handler = (e: MediaQueryListEvent) => setViewMode(e.matches ? 'grid' : 'list');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Activity className={`animate-spin mx-auto mb-3 ${accentText}`} size={32} />
        <p className="text-zinc-500 text-sm">Cargando ensayes...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">

      {/* Header card */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141414] border ${accentBorder} p-5 sm:p-6 rounded-3xl shadow-xl`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-2 ${accentText}`}>
            {icon}
            <span className="text-white">{title}</span>
          </h1>
          <p className="text-sm text-zinc-500">{subtitle}</p>
        </div>
        <Link
          href="/dashboard/projects"
          className="w-full sm:w-auto text-center bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-zinc-700"
        >
          Ir a Proyectos
        </Link>
      </div>

      {/* List section */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl">

        {/* Section header with view toggle */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Activity className={accentText} size={18} />
            Últimos Ensayes
          </h2>
          {tests.length > 0 && (
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                title="Vista lista"
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? `${accentBg} text-white` : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <LayoutList size={15} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Vista cuadrícula"
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? `${accentBg} text-white` : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          )}
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
            <FolderOpen className="mx-auto mb-3 text-zinc-700" size={36} />
            <p className="font-medium text-sm">No hay ensayes registrados aún.</p>
            <p className="text-xs text-zinc-600 mt-1">Ve a un Proyecto y crea un nuevo ensaye.</p>
          </div>
        ) : viewMode === 'list' ? (
          /* ── LIST VIEW ── */
          <div className="space-y-2">
            {tests.map(test => (
              <div
                key={test.id}
                onClick={() => router.push(`/dashboard/tests/${testType}?testId=${test.id}&projectId=${test.project_id}`)}
                className={`flex justify-between items-center p-3 sm:p-4 bg-[#141414] border border-zinc-800 hover:${accentBorder} rounded-xl transition-colors cursor-pointer group`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg bg-zinc-800 ${accentText} group-hover:${accentBg} group-hover:text-white transition-colors shrink-0`}>
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{test.name}</h3>
                    <p className="text-[11px] text-zinc-500 truncate">
                      Obra: <span className="text-zinc-300 font-semibold">{test.projects?.name}</span>
                      {' '}·{' '}
                      {new Date(test.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ml-3 ${test.status === 'FINALIZADO' ? 'bg-[#2BD45A]/20 text-[#2BD45A]' : 'bg-yellow-500/20 text-yellow-500'}`}>
                  {test.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* ── GRID VIEW ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {tests.map(test => (
              <div
                key={test.id}
                onClick={() => router.push(`/dashboard/tests/${testType}?testId=${test.id}&projectId=${test.project_id}`)}
                className="bg-[#141414] border border-zinc-800 hover:border-zinc-600 rounded-2xl p-3 cursor-pointer transition-colors group flex flex-col gap-2"
              >
                {/* Top: icon + status badge */}
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg bg-zinc-800 ${accentText} group-hover:${accentBg} group-hover:text-white transition-colors`}>
                    {icon}
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${test.status === 'FINALIZADO' ? 'bg-[#2BD45A]/20 text-[#2BD45A]' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {test.status === 'FINALIZADO' ? 'OK' : '…'}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-bold text-white text-xs leading-tight line-clamp-2 flex-1">
                  {test.name}
                </h3>

                {/* Meta */}
                <div className="space-y-0.5">
                  <p className="text-[10px] text-zinc-500 truncate flex items-center gap-1">
                    <FolderOpen size={10} />
                    {test.projects?.name || 'Sin obra'}
                  </p>
                  <p className="text-[10px] text-zinc-600 flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(test.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
