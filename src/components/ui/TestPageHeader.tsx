"use client";

import React from 'react';
import { Activity, FileText, Printer, Save } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

interface TestPageHeaderProps {
  /** Lucide icon element e.g. <Zap size={16} /> */
  icon: React.ReactNode;
  /** Tailwind classes for the icon container bg+border, e.g. "bg-zinc-800 border-zinc-700" */
  iconStyle: string;
  title: string;
  subtitle: string;
  status: string;
  onStatusChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onView: () => void;
  onPdf: () => void;
  hasPrinted: boolean;
  isPrinting: boolean;
  /** Tailwind classes for PDF button active state, e.g. "bg-[#FF5F15] hover:bg-[#e04f0f] shadow-[0_0_12px_rgba(255,95,21,0.4)]" */
  pdfStyle: string;
  /** Tailwind border class for the card, e.g. "border-zinc-500/30" */
  cardBorder: string;
}

export function TestPageHeader({
  icon,
  iconStyle,
  title,
  subtitle,
  status,
  onStatusChange,
  onSave,
  isSaving,
  onView,
  onPdf,
  hasPrinted,
  isPrinting,
  pdfStyle,
  cardBorder,
}: TestPageHeaderProps) {
  return (
    <div className={`bg-[#141414]/95 border ${cardBorder} rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl`}>

      {/* Row 1: Icon + Title + Status */}
      <div className="flex items-center justify-between gap-3 px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-lg border shrink-0 ${iconStyle}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white leading-tight truncate">{title}</h1>
            <p className="text-zinc-500 text-[10px] leading-tight">{subtitle}</p>
          </div>
        </div>
        <select
          value={status}
          onChange={e => onStatusChange(e.target.value)}
          className={`shrink-0 bg-[#0a0a0a] border rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none cursor-pointer ${
            status === 'FINALIZADO'
              ? 'text-[#2BD45A] border-[#2BD45A]/50'
              : 'text-yellow-500 border-yellow-500/50'
          }`}
        >
          <option value="EN PROCESO">EN PROCESO</option>
          <option value="FINALIZADO">FINALIZADO</option>
        </select>
      </div>

      {/* Row 2: Guardar | Ver | PDF */}
      <div className="flex items-stretch gap-1.5 px-3 pb-3 border-t border-zinc-800/60 pt-2">
        <Button
          onClick={onSave}
          className="flex-1 min-w-0 gap-1 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 h-auto py-2 text-[11px] font-bold justify-center shadow-none"
        >
          {isSaving ? <Activity className="animate-spin" size={13} /> : <Save size={13} />}
          <span className="whitespace-nowrap">{isSaving ? 'Guardando' : 'Guardar'}</span>
        </Button>

        <Button
          onClick={onView}
          className="flex-1 min-w-0 gap-1 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 h-auto py-2 text-[11px] font-bold justify-center shadow-none"
        >
          <FileText size={13} />
          <span className="whitespace-nowrap">Ver</span>
        </Button>

        <Button
          onClick={onPdf}
          disabled={hasPrinted || isPrinting}
          className={`flex-1 min-w-0 gap-1 h-auto py-2 text-[11px] font-bold shadow-none justify-center ${
            hasPrinted || isPrinting
              ? 'bg-zinc-700 opacity-50'
              : pdfStyle
          }`}
        >
          <Printer size={13} />
          <span className="whitespace-nowrap">{hasPrinted ? 'Listo' : 'PDF'}</span>
        </Button>
      </div>
    </div>
  );
}
