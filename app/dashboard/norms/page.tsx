"use client";

import React, { useState } from 'react';
import { BookOpen, Search, Filter, Truck, Beaker, Layers, ChevronRight } from 'lucide-react';
import { Input } from '@/src/components/ui/Input';

const NORMATIVAS = [
  // ASFALTO
  { id: 'M.MMP.4.04.002', categoria: 'Asfalto', nombre: 'Granulometría de Agregados para Mezclas Asfálticas', desc: 'Método para determinar la composición granulométrica de los agregados.', limites: 'Depende de la banda (Ej. 3/4" a No. 4)' },
  { id: 'M.MMP.4.04.003', categoria: 'Asfalto', nombre: 'Densidad y Absorción', desc: 'Determinación de densidad relativa y porcentaje de absorción de agregados gruesos y finos.', limites: 'Densidad > 2.40 / Absorción reportable' },
  { id: 'ASTM D-6928', categoria: 'Asfalto', nombre: 'Desgaste Micro-Deval', desc: 'Resistencia a la degradación de agregados por abrasión en presencia de agua.', limites: '18% MAX' },
  { id: 'M.MMP.4.04.006', categoria: 'Asfalto', nombre: 'Desgaste de Los Ángeles', desc: 'Resistencia a la degradación de agregados de tamaño menor por abrasión e impacto.', limites: '30% MAX' },
  { id: 'M.MMP.4.04.005', categoria: 'Asfalto', nombre: 'Partículas Alargadas y Lajeadas', desc: 'Proporción de partículas con forma inadecuada en agregados gruesos.', limites: 'Alargadas 40% MAX / Lajeadas 40% MAX' },
  { id: 'M.MMP.4.04.004', categoria: 'Asfalto', nombre: 'Equivalente de Arena', desc: 'Proporción relativa de polvo fino nocivo o material arcilloso en los suelos y agregados finos.', limites: '50% MIN' },
  { id: 'M.MMP.4.04.014', categoria: 'Asfalto', nombre: 'Azul de Metileno', desc: 'Determinación del valor de azul de metileno en agregados finos para detectar arcillas.', limites: '15 MAX' },
  { id: 'M.MMP.4.04.013', categoria: 'Asfalto', nombre: 'Partículas Trituradas', desc: 'Porcentaje de partículas con caras fracturadas mecánicamente.', limites: '1 Cara: 95% MIN / 2 Caras: 85% MIN' },
  
  // CONCRETO
  { id: 'NMX-C-156-ONNCCE', categoria: 'Concreto', nombre: 'Revenimiento del Concreto Fresco', desc: 'Método de ensayo para determinar la consistencia del concreto fresco.', limites: 'Tolerancia ± 2.5 cm (típico)' },
  { id: 'NMX-C-083-ONNCCE', categoria: 'Concreto', nombre: 'Resistencia a la Compresión', desc: 'Determinación de la resistencia a la compresión de cilindros de concreto.', limites: 'Cumplir 100% del f\'c de proyecto a los 28 días.' },
  { id: 'NMX-C-109-ONNCCE', categoria: 'Concreto', nombre: 'Cabeceo de Especímenes', desc: 'Procedimiento para el cabeceo de cilindros de concreto antes de la prueba de compresión.', limites: 'Superficie plana < 0.05 mm' },

  // SUELOS
  { id: 'M.MMP.1.09', categoria: 'Suelos', nombre: 'Compactación AASHTO Estándar/Modificada', desc: 'Determinación del Peso Volumétrico Seco Máximo y Humedad �ptima (Prueba Proctor).', limites: 'Grado de compactación exigido: 90% - 100% PVSM' },
  { id: 'M.MMP.1.07', categoria: 'Suelos', nombre: 'Límites de Consistencia', desc: 'Determinación del Límite Líquido, Límite Plástico e Índice de Plasticidad.', limites: 'IP < 12 (Subbase) / IP < 6 (Base)' },
  { id: 'M.MMP.1.11', categoria: 'Suelos', nombre: 'Valor Soporte de California (CBR)', desc: 'Determinación de la resistencia al esfuerzo cortante de un suelo bajo condiciones controladas.', limites: 'CBR > 20% (Subbase) / CBR > 80% (Base)' }
];

export default function NormsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todas');

  const getIcon = (cat: string) => {
    if (cat === 'Asfalto') return <Truck size={16} className="text-[#FF5F15]" />;
    if (cat === 'Concreto') return <Beaker size={16} className="text-zinc-300" />;
    return <Layers size={16} className="text-[#b87333]" />;
  };

  const filteredNorms = NORMATIVAS.filter(n => {
    const matchesSearch = n.nombre.toLowerCase().includes(search.toLowerCase()) || n.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'Todas' || n.categoria === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-[#141414] border border-[#FF5F15]/30 p-6 rounded-3xl shadow-[0_0_30px_rgba(255,95,21,0.05)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen className="text-[#FF5F15]" />
            Biblioteca de Normativas
          </h1>
          <p className="text-sm sm:text-base text-zinc-500">Consulta los límites y especificaciones SCT, NMX y ASTM vigentes.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por código (Ej. ASTM D-6928) o nombre..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141414] border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[#FF5F15] outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          {['Todas', 'Asfalto', 'Concreto', 'Suelos'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${filter === f ? 'bg-[#FF5F15] text-white' : 'bg-[#141414] text-zinc-500 border border-zinc-800 hover:bg-zinc-800'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNorms.map(norma => (
          <div key={norma.id} className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-6 hover:border-[#FF5F15]/50 transition-all group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-lg text-xs font-bold text-white font-mono tracking-wider">
                {norma.id}
              </span>
              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                {getIcon(norma.categoria)}
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-[#FF5F15] transition-colors">{norma.nombre}</h3>
            <p className="text-sm text-zinc-500 mb-6 flex-1 leading-relaxed">{norma.desc}</p>
            
            <div className="mt-auto pt-4 border-t border-zinc-800/50">
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">Límites / Tolerancias Comunes</p>
              <p className="text-xs font-bold text-zinc-300 bg-[#141414] p-3 rounded-xl border border-zinc-800/50">
                {norma.limites}
              </p>
            </div>
          </div>
        ))}

        {filteredNorms.length === 0 && (
          <div className="col-span-full text-center p-12 border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
            No se encontraron normativas que coincidan con tu búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
