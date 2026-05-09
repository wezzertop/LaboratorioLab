"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { FolderOpen, Activity, FileText, TrendingUp, Clock, HardHat, Beaker, Truck, Layers } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    projectsCount: 0,
    testsCount: 0,
    credits: 0,
    recentTests: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profRes, projRes, testRes, recentRes] = await Promise.all([
        supabase.from('profiles').select('credits').eq('id', user.id).single(),
        supabase.from('projects').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('tests').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('tests').select('*, projects(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4)
      ]);

      setStats({
        credits: profRes.data?.credits || 0,
        projectsCount: projRes.count || 0,
        testsCount: testRes.count || 0,
        recentTests: recentRes.data || []
      });
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-full">
        <Activity className="animate-spin text-[#FF5F15] mb-4" size={32} />
        <p className="text-zinc-500">Cargando tu laboratorio...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Panel de Control</h1>
          <p className="text-sm sm:text-base text-zinc-400">Resumen general de tu actividad y recursos de laboratorio.</p>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Saldo de Créditos</p>
          <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            {stats.credits} <span className="text-base sm:text-lg text-yellow-600/50">CRD</span>
          </div>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#141414] border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#FF5F15]/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF5F15]/10 rounded-full blur-xl group-hover:bg-[#FF5F15]/20 transition-all"></div>
          <FolderOpen className="text-[#FF5F15] mb-4" size={28} />
          <p className="text-[10px] font-bold text-zinc-500 mb-1">PROYECTOS ACTIVOS</p>
          <p className="text-4xl font-black text-white">{stats.projectsCount}</p>
        </div>

        <div className="bg-[#141414] border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#FF5F15]/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF5F15]/10 rounded-full blur-xl group-hover:bg-[#FF5F15]/20 transition-all"></div>
          <FileText className="text-[#FF5F15] mb-4" size={28} />
          <p className="text-[10px] font-bold text-zinc-500 mb-1">ENSAYES TOTALES</p>
          <p className="text-4xl font-black text-white">{stats.testsCount}</p>
        </div>

        <div className="bg-[#141414] border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#2BD45A]/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#2BD45A]/10 rounded-full blur-xl group-hover:bg-[#2BD45A]/20 transition-all"></div>
          <TrendingUp className="text-[#2BD45A] mb-4" size={28} />
          <p className="text-[10px] font-bold text-zinc-500 mb-1">EFICIENCIA (QA)</p>
          <p className="text-4xl font-black text-white">98%</p>
        </div>

        <div className="bg-[#FF5F15] rounded-3xl p-6 shadow-[0_0_30px_rgba(255,95,21,0.2)] flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-white font-bold text-lg leading-tight mb-2">Crear nueva licitación</h3>
            <p className="text-white/80 text-xs mb-4">Inicia un proyecto para organizar tus pruebas físicas.</p>
          </div>
          <Link href="/dashboard/projects" className="relative z-10 bg-black/20 hover:bg-black/40 transition-colors text-white text-xs font-bold py-3 rounded-xl text-center backdrop-blur-sm">
            Ir a Proyectos
          </Link>
          <HardHat className="absolute -right-6 -bottom-6 text-black/10 w-40 h-40" />
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Clock size={18} className="text-zinc-500" />
          Actividad Reciente
        </h2>
        
        {stats.recentTests.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800">
              <Activity className="text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium mb-1">No hay actividad aún</p>
            <p className="text-zinc-600 text-sm">Tus últimos ensayes aparecerán aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.recentTests.map((test) => (
              <Link key={test.id} href={`/dashboard/tests/${test.test_type}?testId=${test.id}&projectId=${test.project_id}`} className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition-colors flex items-center gap-4 group">
                <div className={`p-3 rounded-xl ${test.test_type === 'asfalto' ? 'bg-[#FF5F15]/10 text-[#FF5F15]' : test.test_type === 'concreto' ? 'bg-zinc-800 text-zinc-300' : 'bg-[#b87333]/10 text-[#b87333]'}`}>
                  {test.test_type === 'asfalto' && <Truck size={24} />}
                  {test.test_type === 'concreto' && <Beaker size={24} />}
                  {test.test_type === 'suelos' && <Layers size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold truncate group-hover:text-blue-400 transition-colors">{test.name}</h3>
                  <p className="text-xs text-zinc-500 truncate">{test.projects?.name}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${test.status === 'FINALIZADO' ? 'bg-[#2BD45A]/20 text-[#2BD45A]' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {test.status}
                  </span>
                  <p className="text-[10px] text-zinc-600 mt-2">{new Date(test.created_at).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
