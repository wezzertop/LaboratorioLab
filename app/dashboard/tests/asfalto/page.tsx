"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Printer, FileSpreadsheet, Layers, CheckCircle2, XCircle, Beaker, Settings, FileText, Zap, Activity, Coins, FolderOpen, Truck } from 'lucide-react';
import { EvaluatorEngine } from '@/src/lib/engine/EvaluatorEngine';
import { useCreditStore } from '@/src/store/useCreditStore';
import { Button } from '@/src/components/ui/Button';
import { supabase } from '@/src/lib/supabase/client';

// --- PLANTILLAS (PRESETS) ---
const PRESETS = {
  "AGREGADO 34": {
    descripcionMaterial: 'GRAVA DE 3/4" A No4 TRITURADA AL 100%',
    clasificacionPetrografica: 'GRAVA CALIZA',
    normaGranulometria: 'M.MMP.4.04.002',
    granulometriaLimites: [
      { min: 100, max: 100 }, { min: 90, max: 100 }, { min: 72, max: 89 }, { min: 60, max: 82 },
      { min: 44, max: 71 }, { min: 37, max: 64 }, { min: 20, max: 46 }, { min: 12, max: 35 },
      { min: 8, max: 27 }, { min: 6, max: 21 }, { min: 4, max: 16 }, { min: 2, max: 8 }
    ]
  },
  "AGREGADO 12": {
    descripcionMaterial: 'GRAVA DE 1/2" A No4 TRITURADA AL 100%',
    clasificacionPetrografica: 'GRAVA BASALTICA',
    normaGranulometria: 'M.MMP.4.04.002',
    granulometriaLimites: [
      { min: 100, max: 100 }, { min: 100, max: 100 }, { min: 90, max: 100 }, { min: 75, max: 90 },
      { min: 50, max: 75 }, { min: 35, max: 60 }, { min: 25, max: 45 }, { min: 15, max: 35 },
      { min: 10, max: 25 }, { min: 5, max: 20 }, { min: 3, max: 15 }, { min: 2, max: 8 }
    ]
  },
  "ARENA LAVADA": {
    descripcionMaterial: 'ARENA LAVADA TRITURADA AL 100%',
    clasificacionPetrografica: 'ARENA CALIZA',
    normaGranulometria: 'M.MMP.4.04.002',
    granulometriaLimites: [
      { min: 100, max: 100 }, { min: 100, max: 100 }, { min: 100, max: 100 }, { min: 100, max: 100 },
      { min: 95, max: 100 }, { min: 85, max: 100 }, { min: 65, max: 90 }, { min: 45, max: 70 },
      { min: 25, max: 45 }, { min: 15, max: 30 }, { min: 8, max: 20 }, { min: 4, max: 12 }
    ]
  },
  "ARENA SIN LAVAR": {
    descripcionMaterial: 'ARENA DE MINA SIN LAVAR',
    clasificacionPetrografica: 'ARENA SILICEA',
    normaGranulometria: 'M.MMP.4.04.002',
    granulometriaLimites: [
      { min: 100, max: 100 }, { min: 100, max: 100 }, { min: 100, max: 100 }, { min: 100, max: 100 },
      { min: 90, max: 100 }, { min: 75, max: 100 }, { min: 55, max: 90 }, { min: 35, max: 70 },
      { min: 20, max: 50 }, { min: 10, max: 30 }, { min: 5, max: 20 }, { min: 3, max: 15 }
    ]
  }
};

const INITIAL_GRANULOMETRIA = [
  { malla: '1"', pasa: 100, min: 100, max: 100 },
  { malla: '3/4"', pasa: 98, min: 90, max: 100 },
  { malla: '1/2"', pasa: 84, min: 72, max: 89 },
  { malla: '3/8"', pasa: 46, min: 60, max: 82 },
  { malla: '1/4"', pasa: 23, min: 44, max: 71 },
  { malla: 'N°.4', pasa: 12, min: 37, max: 64 },
  { malla: 'N°.10', pasa: 0, min: 20, max: 46 },
  { malla: 'N°.20', pasa: 0, min: 12, max: 35 },
  { malla: 'N°.40', pasa: 0, min: 8, max: 27 },
  { malla: 'N°.60', pasa: 0, min: 6, max: 21 },
  { malla: 'N°.100', pasa: 0, min: 4, max: 16 },
  { malla: 'N°.200', pasa: 0, min: 2, max: 8 },
];

function AsphaltDashboard() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadTests() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('tests')
          .select('*, projects(name)')
          .eq('user_id', user.id)
          .eq('test_type', 'asfalto')
          .order('created_at', { ascending: false });
        if (data) setTests(data);
      }
      setLoading(false);
    }
    loadTests();
  }, []);

  if (loading) return <div className="p-12 text-[#FF5F15] text-center">Cargando dashboard...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141414] border border-[#FF5F15]/30 p-6 rounded-3xl shadow-[0_0_30px_rgba(255,95,21,0.05)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Truck className="text-[#FF5F15]" />
            Dashboard de Asfalto
          </h1>
          <p className="text-sm sm:text-base text-zinc-500">Historial global de todas tus pruebas de asfalto realizadas en diferentes obras.</p>
        </div>
        <Link href="/dashboard/projects" className="w-full sm:w-auto text-center bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          Ir a Proyectos
        </Link>
      </div>

      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="text-[#FF5F15]" /> �altimos Ensayes
        </h2>

        {tests.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
            Aún no has realizado pruebas de asfalto. Ve a un Proyecto y crea un nuevo ensaye.
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map(test => (
              <div key={test.id} onClick={() => router.push(`/dashboard/tests/asfalto?testId=${test.id}&projectId=${test.project_id}`)} className="flex justify-between items-center p-4 bg-[#141414] border border-zinc-800 hover:border-[#FF5F15]/50 rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-[#FF5F15]/10 text-[#FF5F15] group-hover:bg-[#FF5F15] group-hover:text-white transition-colors">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{test.name}</h3>
                    <p className="text-xs text-zinc-500">Obra: <span className="text-zinc-300 font-semibold">{test.projects?.name}</span> ⬢ {new Date(test.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${test.status === 'FINALIZADO' ? 'bg-[#2BD45A]/20 text-[#2BD45A]' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {test.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AsphaltTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const testId = searchParams.get('testId');

  const hoy = new Date().toISOString().split('T')[0];
  const [activePreset, setActivePreset] = useState("AGREGADO 34");
  const [viewMode, setViewMode] = useState("DATA"); // DATA o GRAFICA
  const [profile, setProfile] = useState<any>(null);

  const { credits, freeReportsUsed, consumeCredit, addCredits, initialize } = useCreditStore();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchProfileAndTest() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
          initialize(data.credits || 0, data.free_reports_used || 0);
          setData(prev => ({ 
            ...prev, 
            tecnico: `${data.full_name || 'T�0CNICO'} - Céd: ${data.license_number || 'S/N'}`.toUpperCase()
          }));
        }
      }

      // Si existe un testId, cargamos la info previa
      if (testId) {
        const { data: testData } = await supabase.from('tests').select('*').eq('id', testId).single();
        if (testData && testData.data) {
          setData(testData.data);
          setActivePreset("HISTORIAL CARGADO");
        }
      }
    }
    fetchProfileAndTest();
  }, [initialize, testId]);

  const [data, setData] = useState({
    licitacionNo: '00009047-017-09', ensayeNo: 'AEC #1',
    fechaMuestreo: hoy, fechaEnsaye: hoy,
    material: 'Concreto Asfáltico (C.A.)', tramo: 'Km 12+000 al 14+500',
    tecnico: '',
    normativa: 'M.MMP.4.04.002 (Granulometría SCT)',
    coordinates: '',
    status: 'FINALIZADO',
    descripcionMaterial: PRESETS["AGREGADO 34"].descripcionMaterial,
    paraUsarseEn: 'MEZCLA ASFALTICA', tratamientoPrevio: 'HOMOGENIZACION Y CUARTEO',
    claseDeposito: 'CONO DE ALMACENAMIENTO EN PLAN DE ASFALTOS "ASFALSUR"', ubicacionBanco: 'BANCO ABC, CANCUN',
    clasificacionPetrografica: PRESETS["AGREGADO 34"].clasificacionPetrografica,
    pesoVolSuelto: '1,155.0',
    normaGranulometria: PRESETS["AGREGADO 34"].normaGranulometria,
    granulometria: INITIAL_GRANULOMETRIA,
    caracteristicasAgregado: [
      { car: 'DENSIDAD', norma: 'M.MMP.4.04.003', res: '2.24', proy: '2.40 MIN' },
      { car: 'ABSORCION %', norma: 'M.MMP.4.04.003', res: '4.65', proy: '-----' },
      { car: 'DESG. MICRODEVAL %', norma: 'ASTM D-6928', res: '', proy: '18 MAX.' },
      { car: 'DESG. DE LOS ANGELES %', norma: 'M.MMP.4.04.006', res: '32.4', proy: '30 MAX' },
      { car: 'PART. ALARGADAS %', norma: 'M.MMP.4.04.005', res: '7.4', proy: '40 MAX' },
      { car: 'PART. LAJEADAS %', norma: 'M.MMP.4.04.005', res: '8.2', proy: '40 MAX' },
      { car: 'EQUIV. DE ARENA %', norma: 'M.MMP.4.04.004', res: '', proy: '50 MIN' },
      { car: 'AZUL DE METILENO %', norma: 'M.MMP.4.04.014', res: '', proy: '15 MAX' },
      { car: 'PART. TRITURADAS 1 CARA', norma: 'M.MMP.4.04.013', res: '', proy: '95 % MIN.' },
      { car: 'PART. TRITURADAS 2 CARAS', norma: 'M.MMP.4.04.013', res: '', proy: '85 % MIN.' },
      { car: 'DESP. POR FRICCION', norma: 'M.MMP.4.04.009', res: '', proy: '20.0 MAX' },
      { car: 'ANGULARIDAD %', norma: '', res: '', proy: '45 % MIN.' },
    ],
    mezcla: { contenidoAsfalto: '2.76', marca: '', tipo: '', cantidad: '', afinidad: 'BUENA', perdidaEstabilidad: '' },
    especimen: { pesoVol: '', estabilidad: '816', flujo: '2-3.5', vacios: '3-5', vam: '13.0', vaf: '65-75' },
    asfalto: { tipoPG: 'PG76-22', penetracion: '', viscosidad: '', tempRecom: '', tempAplic: '' },
    observaciones: 'GRAVA CALIZA PRODUCTO DE TRITURACION DE 3/4 A No. 4',
    formatoUnico: 'FCC-11',
    extras: { cemPeso1: '2.76', cemPeso2: '0.00', cementoAsfaltico: '0.0', materialPetreo: '0.0', densidadCAsf: '1.03' }
  });

  const applyPreset = (presetName: string) => {
    setViewMode("DATA");
    setActivePreset(presetName);
    const presetData = (PRESETS as any)[presetName];
    if (!presetData) return;
    setData(prev => {
      const newGranulometria = prev.granulometria.map((item, idx) => ({
        ...item, min: presetData.granulometriaLimites[idx].min, max: presetData.granulometriaLimites[idx].max
      }));
      return {
        ...prev, descripcionMaterial: presetData.descripcionMaterial, clasificacionPetrografica: presetData.clasificacionPetrografica,
        normaGranulometria: presetData.normaGranulometria, granulometria: newGranulometria
      };
    });
  };

  const handleChange = (field: string, value: any) => setData(prev => ({ ...prev, [field]: value }));
  const handleNested = (category: string, field: string, value: any) => setData((prev: any) => ({ ...prev, [category]: { ...prev[category], [field]: value } }));
  const handleArray = (arrayName: string, index: number, field: string, value: any) => {
    setData((prev: any) => {
      const newArray = [...prev[arrayName]];
      newArray[index][field] = field === 'pasa' ? (value === '' ? '' : Number(value)) : value;
      return { ...prev, [arrayName]: newArray };
    });
  };
  const handleFocus = (e: any) => e.target.select();

  const handleSave = async () => {
    if (!projectId && !testId) {
      alert("Este ensaye no está vinculado a ningún proyecto. Ve a la pestaña Proyectos para crear uno primero.");
      return;
    }
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión no encontrada");

      const payload = {
        project_id: projectId,
        user_id: user.id,
        test_type: 'asfalto',
        name: `${data.ensayeNo} - ${data.material}`,
        status: data.status,
        data: data
      };

      if (testId) {
        // Update existing
        const { error } = await supabase.from('tests').update(payload).eq('id', testId);
        if (error) throw error;
        alert("Ensaye actualizado correctamente.");
      } else {
        // Create new
        const { data: newTest, error } = await supabase.from('tests').insert([payload]).select().single();
        if (error) throw error;
        alert("Ensaye guardado correctamente.");
        router.replace(`/dashboard/tests/asfalto?projectId=${projectId}&testId=${newTest.id}`);
      }
    } catch (error: any) {
      alert("Error al guardar: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- MOTOR SVG PARA LA GRÁFICA �PTIMA ---
  const renderChart = () => {
    const W = 800; const H = 400; const padX = 60; const padY = 40;
    const plotW = W - padX * 2; const plotH = H - padY * 2;
    const stepX = plotW / (data.granulometria.length - 1);

    const getY = (val: number) => H - padY - (val / 100) * plotH;

    const maxPoints = data.granulometria.map((g, i) => `${padX + i * stepX},${getY(g.max)}`).join(' ');
    const minPoints = data.granulometria.map((g, i) => `${padX + i * stepX},${getY(g.min)}`).join(' ');
    const actualPoints = data.granulometria.map((g, i) => `${padX + i * stepX},${getY(g.pasa || 0)}`).join(' ');

    return (
      <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-x-auto print:hidden">
        <h2 className="text-[#FF5F15] font-semibold text-xl mb-2 flex items-center gap-2"><Activity /> Curva Granulométrica (Gráfica �ptima)</h2>
        <p className="text-zinc-500 text-sm mb-6">Visualización en tiempo real de los límites del proyecto frente a tu muestra física.</p>

        <div className="min-w-[800px] bg-[#0a0a0a] rounded-xl p-4 border border-zinc-800">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto font-sans">
            {/* Grid Lineas Horizontales (0 a 100%) */}
            {[0, 20, 40, 60, 80, 100].map(val => (
              <g key={val}>
                <line x1={padX} y1={getY(val)} x2={W - padX} y2={getY(val)} stroke="#333" strokeDasharray="4 4" />
                <text x={padX - 10} y={getY(val) + 4} fill="#888" fontSize="12" textAnchor="end">{val}%</text>
              </g>
            ))}

            {/* Grid Lineas Verticales (Mallas) */}
            {data.granulometria.map((g, i) => (
              <g key={i}>
                <line x1={padX + i * stepX} y1={padY} x2={padX + i * stepX} y2={H - padY} stroke="#222" />
                <text x={padX + i * stepX} y={H - padY + 20} fill="#888" fontSize="11" textAnchor="middle" transform={`rotate(-45, ${padX + i * stepX}, ${H - padY + 20})`}>{g.malla}</text>
              </g>
            ))}

            {/* Area del Proyecto (Sombreado entre Max y Min) */}
            <polygon
              points={`${maxPoints} ${minPoints.split(' ').reverse().join(' ')}`}
              fill="rgba(0, 159, 219, 0.1)"
            />

            {/* Linea Proyecto MAX */}
            <polyline points={maxPoints} fill="none" stroke="#FF5F15" strokeWidth="2" strokeDasharray="5 5" />

            {/* Linea Proyecto MIN */}
            <polyline points={minPoints} fill="none" stroke="#FF5F15" strokeWidth="2" strokeDasharray="5 5" />

            {/* Linea ACTUAL (% Que Pasa) */}
            <polyline points={actualPoints} fill="none" stroke="#2BD45A" strokeWidth="3" />
            {data.granulometria.map((g, i) => (
              <circle key={`dot-${i}`} cx={padX + i * stepX} cy={getY(g.pasa || 0)} r="4" fill="#2BD45A" stroke="#111" strokeWidth="2" />
            ))}
          </svg>

          <div className="flex justify-center gap-6 mt-4 text-xs font-bold">
            <div className="flex items-center gap-2"><span className="w-4 h-1 border-t-2 border-dashed border-[#FF5F15]"></span> Límites Proyecto (Min-Max)</div>
            <div className="flex items-center gap-2"><span className="w-4 h-1 bg-[#2BD45A]"></span> Resultado Real (% Pasa)</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans pb-20">

      {/* VISTA WEB MAIN */}
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6 print:hidden">

        {/* TABS SUPERIORES */}
        <div className="sticky top-4 z-50">
          <div className="flex overflow-x-auto no-scrollbar gap-1 mb-2 px-2">
            {Object.keys(PRESETS).map(preset => (
              <button key={preset} onClick={() => applyPreset(preset)} className={`px-5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x ${activePreset === preset && viewMode === "DATA" ? 'bg-[#141414] text-[#FF5F15] border-[#FF5F15]/50' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:bg-zinc-800'}`}>
                {preset}
              </button>
            ))}
            <button onClick={() => setViewMode("GRAFICA")} className={`px-5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x flex items-center gap-2 ${viewMode === "GRAFICA" ? 'bg-[#141414] text-[#2BD45A] border-[#2BD45A]/50 shadow-[0_-5px_15px_rgba(43,212,90,0.15)]' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:bg-zinc-800'}`}>
              <Activity size={14} /> GRAFICA OPTIMA
            </button>
          </div>

          <div className="bg-[#141414] border border-[#FF5F15]/30 rounded-2xl rounded-tl-none p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="bg-[#FF5F15]/20 p-3 rounded-xl border border-[#FF5F15]/30"><Zap className="text-[#FF5F15]" size={24} /></div>
              <div>
                <h1 className="text-xl font-bold text-white">Laboratorio Asfaltos PRO V2</h1>
                <p className="text-zinc-500 text-xs">Evaluador inteligente de granulometría y características.</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center w-full md:w-auto">
              <select value={data.status} onChange={e => handleChange('status', e.target.value)} className={`w-full md:w-auto bg-[#0a0a0a] border rounded-lg p-2 text-xs font-bold outline-none cursor-pointer ${data.status === 'FINALIZADO' ? 'text-[#2BD45A] border-[#2BD45A]/50' : 'text-yellow-500 border-yellow-500/50'}`}>
                <option value="EN PROCESO">EN PROCESO</option>
                <option value="FINALIZADO">FINALIZADO</option>
              </select>
              <div className="flex items-center justify-between md:justify-start gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 w-full md:w-auto">
                 <div className="flex items-center gap-2">
                   <Coins size={16} className="text-yellow-500" />
                   <div className="text-xs">
                     <span className="text-zinc-400">Créditos: </span>
                     <span className="font-bold text-white">{freeReportsUsed < 3 ? `Gratis (${3 - freeReportsUsed})` : credits}</span>
                   </div>
                 </div>
                 <button onClick={() => addCredits(5)} className="ml-2 text-[10px] bg-zinc-800 hover:bg-[#FF5F15] px-2 py-1 rounded text-white transition-colors border border-zinc-700">+ Recargar</button>
              </div>
              <Button 
                onClick={handleSave} 
                className="w-full md:w-auto gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 shadow-none"
              >
                {isSaving ? <Activity className="animate-spin" size={20} /> : <FileText size={20} />}
                {isSaving ? 'Guardando...' : 'Guardar Ensaye'}
              </Button>
              <Button 
                onClick={() => {
                  if (consumeCredit()) {
                    window.print();
                  } else {
                    alert("No tienes suficientes créditos. Por favor recarga para imprimir este reporte.");
                  }
                }} 
                className="w-full md:w-auto gap-2 bg-[#FF5F15] hover:bg-[#e04f0f] shadow-[0_0_20px_rgba(255,95,21,0.3)]"
              >
                <Printer size={20} /> Imprimir PDF
              </Button>
            </div>
          </div>
        </div>

        {/* CONTENIDO CONDICIONAL (Datos vs Gráfica) */}
        {viewMode === "GRAFICA" ? renderChart() : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

            {/* COLUMNA IZQUIERDA */}
            <div className="xl:col-span-7 space-y-6">

              {/* 1. Muestreo */}
              <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <h2 className="text-[#FF5F15] font-semibold mb-4 flex items-center gap-2 text-sm"><Beaker size={16} /> DATOS DEL MUESTREO</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div><label className="block text-[10px] text-zinc-500 mb-1">ENSAYE N°</label><input type="text" value={data.ensayeNo} onChange={e => handleChange('ensayeNo', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
                  <div><label className="block text-[10px] text-zinc-500 mb-1">LICITACI�N NO.</label><input type="text" value={data.licitacionNo} onChange={e => handleChange('licitacionNo', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
                  <div><label className="block text-[10px] text-zinc-500 mb-1">FECHA MUESTREO</label><input type="date" value={data.fechaMuestreo} onChange={e => handleChange('fechaMuestreo', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
                  <div><label className="block text-[10px] text-zinc-500 mb-1">FECHA ENSAYE</label><input type="date" value={data.fechaEnsaye} onChange={e => handleChange('fechaEnsaye', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
                  <div><label className="block text-[10px] text-[#FF5F15] mb-1 font-bold">NORMATIVA APLICABLE</label>
                    <select value={data.normativa} onChange={e => handleChange('normativa', e.target.value)} className="w-full bg-[#141414] border border-[#FF5F15]/50 rounded p-2 text-xs text-[#FF5F15] font-bold outline-none cursor-pointer">
                      <option value="M.MMP.4.04.002 (Granulometría SCT)">M.MMP.4.04.002 (Granulometría)</option>
                      <option value="M.MMP.4.04.003 (Densidad)">M.MMP.4.04.003 (Densidad)</option>
                      <option value="ASTM D-6928 (Micro-Deval)">ASTM D-6928 (Micro-Deval)</option>
                      <option value="OTRA">OTRA (Indicar en obs.)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="md:col-span-2"><label className="block text-[10px] text-zinc-500 mb-1">COORDENADAS DE MUESTREO (GPS)</label>
                    <div className="flex gap-2">
                      <input type="text" value={data.coordinates} onChange={e => handleChange('coordinates', e.target.value)} placeholder="Ej. 21.16, -86.85" className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white focus:border-[#FF5F15] outline-none" />
                      <button type="button" onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => setData(prev => ({ ...prev, coordinates: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}` })),
                            () => alert("GPS denegado"), { enableHighAccuracy: true }
                          );
                        }
                      }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 rounded transition-colors flex items-center justify-center border border-zinc-700"><Beaker size={16} /></button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2"><label className="block text-[10px] text-zinc-500 mb-1 text-[#FF5F15]">DESCRIPCI�N DEL MATERIAL</label><input type="text" value={data.descripcionMaterial} onFocus={handleFocus} onChange={e => handleChange('descripcionMaterial', e.target.value)} className="w-full bg-[#0a0a0a] border border-[#FF5F15]/30 rounded p-2 text-xs text-white outline-none" /></div>
                  <div className="md:col-span-2"><label className="block text-[10px] text-zinc-500 mb-1">UBICACI�N DEL BANCO</label><input type="text" value={data.ubicacionBanco} onFocus={handleFocus} onChange={e => handleChange('ubicacionBanco', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white focus:border-[#FF5F15] outline-none" /></div>
                  <div><label className="block text-[10px] text-zinc-500 mb-1">TRATAMIENTO PREVIO</label><input type="text" value={data.tratamientoPrevio} onFocus={handleFocus} onChange={e => handleChange('tratamientoPrevio', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white focus:border-[#FF5F15] outline-none" /></div>
                  <div><label className="block text-[10px] text-zinc-500 mb-1 text-[#FF5F15]">CLASIFICACI�N PETROGRÁFICA</label><input type="text" value={data.clasificacionPetrografica} onFocus={handleFocus} onChange={e => handleChange('clasificacionPetrografica', e.target.value)} className="w-full bg-[#0a0a0a] border border-[#FF5F15]/30 rounded p-2 text-xs text-white outline-none" /></div>
                  <div><label className="block text-[10px] text-zinc-500 mb-1">PARA USARSE EN</label><input type="text" value={data.paraUsarseEn} onFocus={handleFocus} onChange={e => handleChange('paraUsarseEn', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white focus:border-[#FF5F15] outline-none" /></div>
                  <div><label className="block text-[10px] text-zinc-500 mb-1">PESO VOL. SUELTO (kg/m3)</label><input type="text" value={data.pesoVolSuelto} onFocus={handleFocus} onChange={e => handleChange('pesoVolSuelto', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-[#2BD45A] font-bold focus:border-[#FF5F15] outline-none" /></div>
                </div>
              </div>

              {/* 2. Granulometría */}
              <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[#FF5F15] font-semibold flex items-center gap-2 text-sm"><Layers size={16} /> GRANULOMETRÍA</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {data.granulometria.map((row, idx) => {
                    const pass = row.pasa >= row.min && row.pasa <= row.max;
                    return (
                      <div key={idx} className={`bg-[#0a0a0a] border ${pass ? 'border-zinc-800' : 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]'} rounded-xl p-2 flex flex-col items-center justify-center transition-all`}>
                        <span className="text-[10px] font-bold text-zinc-400 mb-1">{row.malla}</span>
                        <input type="number" value={row.pasa} onFocus={handleFocus} onChange={e => handleArray('granulometria', idx, 'pasa', e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-1.5 text-center text-white font-bold text-lg focus:border-[#2BD45A] focus:ring-2 focus:ring-[#2BD45A] outline-none" />
                        <div className="flex gap-1 mt-1 justify-center items-center w-full">
                          <span className="text-[8px] text-zinc-600">R:</span>
                          <input type="number" value={row.min} onFocus={handleFocus} onChange={e => handleArray('granulometria', idx, 'min', Number(e.target.value))} className="w-full bg-transparent text-[9px] text-zinc-500 border-b border-zinc-800 hover:border-zinc-500 focus:border-[#FF5F15] text-center outline-none transition-colors" />
                          <span className="text-[8px] text-zinc-600">-</span>
                          <input type="number" value={row.max} onFocus={handleFocus} onChange={e => handleArray('granulometria', idx, 'max', Number(e.target.value))} className="w-full bg-transparent text-[9px] text-zinc-500 border-b border-zinc-800 hover:border-zinc-500 focus:border-[#FF5F15] text-center outline-none transition-colors" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* COLUMNA DERECHA */}
            <div className="xl:col-span-5 space-y-6">

              {/* 3. Agregado con Validación Inteligente */}
              <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 shadow-lg">
                <h2 className="text-[#FF5F15] font-semibold mb-4 text-sm flex justify-between items-center">
                  CARACTERÍSTICAS AGREGADO
                  <span className="text-[9px] bg-zinc-800 px-2 py-1 rounded text-zinc-400 font-normal border border-zinc-700">Auto-evaluador Activo</span>
                </h2>
                <div className="grid grid-cols-1 gap-2">
                  {data.caracteristicasAgregado.map((row, idx) => {
                    const status = EvaluatorEngine.evaluateSpec(row.res, row.proy);
                    let borderColor = "border-zinc-800";
                    let textColor = "text-white";
                    if (status === true) { borderColor = "border-[#2BD45A]/50"; textColor = "text-[#2BD45A]"; }
                    if (status === false) { borderColor = "border-red-500/50"; textColor = "text-red-500"; }

                    return (
                      <div key={idx} className={`bg-[#0a0a0a] px-3 py-2 rounded-lg border ${borderColor} flex justify-between items-center transition-colors`}>
                        <div className="flex flex-col w-[50%]">
                          <span className="text-[9px] text-zinc-400 font-bold truncate">{row.car}</span>
                          <span className="text-[8px] text-zinc-600">Norma: {row.norma}</span>
                        </div>
                        <div className="flex items-center gap-2 w-[50%] justify-end">
                          <input type="text" value={row.res} onFocus={handleFocus} onChange={e => handleArray('caracteristicasAgregado', idx, 'res', e.target.value)} placeholder="-" className={`w-[50%] bg-black border border-zinc-700 rounded p-1 text-center text-xs font-bold focus:border-[#FF5F15] outline-none ${textColor}`} />
                          <input type="text" value={row.proy} onFocus={handleFocus} onChange={e => handleArray('caracteristicasAgregado', idx, 'proy', e.target.value)} className="w-[50%] text-[9px] text-zinc-400 text-right bg-transparent border-b border-dashed border-zinc-700 hover:border-[#FF5F15] focus:border-[#FF5F15] focus:text-[#FF5F15] outline-none transition-colors" title="Editar Límite de Proyecto" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Footers Compactos */}
              <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0a0a0a] p-2 rounded-xl border border-zinc-800">
                    <h3 className="text-[9px] text-[#FF5F15] font-bold mb-2">MEZCLA</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between"><label className="text-[9px] text-zinc-500">Asfalto %</label><input value={data.mezcla.contenidoAsfalto} onChange={e => handleNested('mezcla', 'contenidoAsfalto', e.target.value)} className="w-12 bg-black rounded p-1 text-[9px] text-center text-white border border-zinc-700" /></div>
                      <div className="flex justify-between"><label className="text-[9px] text-zinc-500">Afinidad</label><input value={data.mezcla.afinidad} onChange={e => handleNested('mezcla', 'afinidad', e.target.value)} className="w-12 bg-black rounded p-1 text-[9px] text-center text-white border border-zinc-700" /></div>
                    </div>
                  </div>
                  <div className="bg-[#0a0a0a] p-2 rounded-xl border border-zinc-800">
                    <h3 className="text-[9px] text-[#FF5F15] font-bold mb-2 flex justify-between">ASFALTO <input value={data.asfalto.tipoPG} onChange={e => handleNested('asfalto', 'tipoPG', e.target.value)} className="w-12 bg-transparent text-right outline-none text-zinc-400" /></h3>
                    <div className="space-y-1">
                      <div className="flex justify-between"><label className="text-[9px] text-zinc-500">Penet.</label><input value={data.asfalto.penetracion} onChange={e => handleNested('asfalto', 'penetracion', e.target.value)} className="w-12 bg-black rounded p-1 text-[9px] text-center text-white border border-zinc-700" /></div>
                      <div className="flex justify-between"><label className="text-[9px] text-zinc-500">Viscosid.</label><input value={data.asfalto.viscosidad} onChange={e => handleNested('asfalto', 'viscosidad', e.target.value)} className="w-12 bg-black rounded p-1 text-[9px] text-center text-white border border-zinc-700" /></div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] p-2 rounded-xl border border-zinc-800">
                  <h3 className="text-[9px] text-[#FF5F15] font-bold mb-2">ESP�0CIMEN</h3>
                  <div className="grid grid-cols-6 gap-1">
                    <div className="text-center"><label className="block text-[8px] text-zinc-500">Vol</label><input value={data.especimen.pesoVol} onChange={e => handleNested('especimen', 'pesoVol', e.target.value)} className="w-full bg-black rounded p-1 text-[9px] text-center text-white border border-zinc-700" /></div>
                    <div className="text-center"><label className="block text-[8px] text-zinc-500">Est</label><input value={data.especimen.estabilidad} onChange={e => handleNested('especimen', 'estabilidad', e.target.value)} className="w-full bg-black rounded p-1 text-[9px] text-center text-white border border-zinc-700" /></div>
                    <div className="text-center"><label className="block text-[8px] text-zinc-500">Flujo</label><input value={data.especimen.flujo} onChange={e => handleNested('especimen', 'flujo', e.target.value)} className="w-full bg-black rounded p-1 text-[9px] text-center text-white border border-zinc-700" /></div>
                    <div className="text-center"><label className="block text-[8px] text-zinc-500">Vac</label><input value={data.especimen.vacios} onChange={e => handleNested('especimen', 'vacios', e.target.value)} className="w-full bg-black rounded p-1 text-[9px] text-center text-white border border-zinc-700" /></div>
                    <div className="text-center"><label className="block text-[8px] text-zinc-500">VAM</label><input value={data.especimen.vam} onChange={e => handleNested('especimen', 'vam', e.target.value)} className="w-full bg-black rounded p-1 text-[9px] text-center text-white border border-zinc-700" /></div>
                    <div className="text-center"><label className="block text-[8px] text-zinc-500">VAF</label><input value={data.especimen.vaf} onChange={e => handleNested('especimen', 'vaf', e.target.value)} className="w-full bg-black rounded p-1 text-[9px] text-center text-white border border-zinc-700" /></div>
                  </div>
                </div>

                <div><label className="block text-[10px] text-zinc-500 mb-1">OBSERVACIONES FINAL</label><textarea value={data.observaciones} onChange={e => handleChange('observaciones', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white outline-none" rows={2} /></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================
          VISTA DE IMPRESI�N (PDF PIXEL PERFECT)
          ========================================= */}
      <div className="hidden print:block bg-white text-black font-sans leading-none pt-2" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
        <div className="mx-auto w-[980px] border-[3px] border-black text-[10px] relative">
          {profile?.company_logo_url && (
             <img src={profile.company_logo_url} alt="Logo" className="absolute top-2 left-2 w-24 h-auto object-contain z-10" />
          )}
          <div className="bg-yellow-300 font-bold text-center py-2 text-[14px] border-b-[3px] border-black uppercase !bg-yellow-300" style={{ backgroundColor: '#fde047' }}>
            REPORTE DE ENSAYE DE CONCRETO ASFALTICO
          </div>

          <div className="flex border-b-[3px] border-black p-2">
             <div className="w-1/2 space-y-2 text-[10px]">
                <div className="flex"><span className="font-bold w-[40%]">OBRA / LICITACI�N:</span><span>{data.licitacionNo}</span></div>
                <div className="flex"><span className="font-bold w-[40%]">MATERIAL:</span><span>{data.descripcionMaterial}</span></div>
                <div className="flex"><span className="font-bold w-[40%]">UBICACI�N:</span><span>{data.ubicacionBanco}</span></div>
             </div>
             <div className="w-1/2 space-y-2 text-right text-[10px]">
                <div className="flex justify-end"><span className="font-bold w-[40%] text-left">ENSAYE N°:</span><span className="w-1/3 text-left">{data.ensayeNo}</span></div>
                <div className="flex justify-end"><span className="font-bold w-[40%] text-left">FECHA MUESTREO:</span><span className="w-1/3 text-left">{data.fechaMuestreo}</span></div>
                <div className="flex justify-end"><span className="font-bold w-[40%] text-left">FECHA ENSAYE:</span><span className="w-1/3 text-left">{data.fechaEnsaye}</span></div>
             </div>
          </div>

          <div className="flex border-b-[3px] border-black p-2 bg-yellow-100 !bg-yellow-100 font-bold justify-center" style={{ backgroundColor: '#fef9c3' }}>
            NORMATIVA DE REFERENCIA: {data.normativa}
          </div>

          <div className="flex border-b-[3px] border-black text-[9px]">
            <div className="w-[15%] p-2 font-bold flex items-center justify-center text-center border-r-[2px] border-black">DATOS DEL MUESTREO</div>
            <div className="w-[85%] p-1.5">
              <table className="w-full">
                <tbody>
                  <tr><td className="font-bold w-[28%] pb-1">DESCRIPCION DEL MATERIAL:</td><td className="w-[42%] italic pb-1">{data.descripcionMaterial}</td><td className="font-bold w-[15%] pb-1">PARA USARSE EN:</td><td className="italic pb-1">{data.paraUsarseEn}</td></tr>
                  <tr><td className="font-bold pb-1">TRATAMIENTO PREVIO AL MUESTREO:</td><td colSpan={3} className="italic pb-1">{data.tratamientoPrevio}</td></tr>
                  <tr><td className="font-bold pb-1">CLASE DE DEPOSITO MUESTREADO:</td><td colSpan={3} className="italic pb-1">{data.claseDeposito}</td></tr>
                  <tr><td className="font-bold">UBICACI N DEL BANCO DONDE PROCEDE EL MATERIAL PETREO:</td><td colSpan={3} className="italic">{data.ubicacionBanco}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex border-b-[3px] border-black">
            <div className="w-[68%] border-r-[3px] border-black flex flex-col">
              <div className="flex border-b-[2px] border-black text-[9px] h-[34px]">
                <div className="w-[50%] flex flex-col">
                  <div className="flex flex-1 border-b border-black">
                    <div className="w-[55%] p-1 font-bold border-r border-black flex items-center">CLASIFICACION PETROGRAFICA</div>
                    <div className="w-[45%] p-1 font-bold text-center flex items-center justify-center">{data.clasificacionPetrografica}</div>
                  </div>
                  <div className="flex flex-1">
                    <div className="w-[55%] p-1 font-bold border-r border-black flex items-center">PESO VOL. SUELTO, kg/m3</div>
                    <div className="w-[45%] p-1 font-bold text-center flex items-center justify-center">{data.pesoVolSuelto}</div>
                  </div>
                </div>
                <div className="w-[50%] border-l border-black flex flex-col items-end pt-1 pr-1 text-[7px] text-gray-500"><span>VO _________</span><span>USADO _________</span></div>
              </div>
              <div className="bg-gray-200 text-center font-bold py-1 border-b-[2px] border-black text-[10px] !bg-gray-200" style={{ backgroundColor: '#e5e7eb' }}>GRANULOMETRIA</div>
              <table className="w-full text-center border-collapse text-[9px]">
                <thead>
                  <tr className="border-b-[2px] border-black font-bold">
                    <th className="border-r border-black p-1">MALLA</th><th className="border-r border-black p-1">NORMA</th><th className="border-r border-black p-1">% QUE PASA</th><th className="p-1">PROYECTO</th>
                  </tr>
                </thead>
                <tbody>
                  {data.granulometria.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-400 last:border-b-[2px] last:border-black h-[16px]">
                      <td className="border-r border-black font-bold text-left pl-2">{row.malla}</td><td className="border-r border-black text-[8px]">{data.normaGranulometria}</td><td className="border-r border-black font-bold">{row.pasa}</td><td>{row.min}-{row.max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-gray-200 text-center font-bold py-1 border-b-[2px] border-black text-[10px] !bg-gray-200" style={{ backgroundColor: '#e5e7eb' }}>CARACTERISTICAS DEL AGREGADO</div>
              <table className="w-full text-left border-collapse text-[8px]">
                <tbody>
                  {data.caracteristicasAgregado.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-400 h-[15px]">
                      <td className="border-r border-black font-bold uppercase w-[42%] pl-1">{row.car}</td><td className="border-r border-black w-[25%] text-center">{row.norma}</td><td className="border-r border-black font-bold w-[15%] text-center">{row.res}</td><td className="text-center font-bold">{row.proy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="w-[32%] flex flex-col bg-white text-[8px]">
              <div className="h-[34px] border-b-[2px] border-black"></div>
              <table className="w-full text-center border-collapse">
                <tbody>
                  {[...data.granulometria].reverse().map((row, idx) => {
                    const m = row.malla.match(/\(([\d.]+)/);
                    const s = m ? parseFloat(m[1]) : 0;
                    return (
                      <tr key={idx} className="border-b border-gray-400 h-[16px]">
                        <td className="border-r border-black w-[15%]">{s > 0 ? s.toFixed(3) : 0}</td><td className="border-r border-black w-[20%]">{s > 0 ? Math.log10(s).toFixed(4) : 0}</td>
                        <td className="border-r border-black w-[15%]">{row.min.toFixed(1)}</td><td className="border-r border-black w-[15%]">{row.max.toFixed(1)}</td>
                        <td className="border-r border-black w-[15%]">{Number(row.pasa).toFixed(1)}</td><td className="w-[20%]">{row.min.toFixed(1)}-{row.max.toFixed(1)}</td>
                      </tr>
                    )
                  })}
                  {Array.from({ length: 6 }).map((_, i) => (<tr key={`f-${i}`} className="border-b border-gray-400 h-[16px]"><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td></tr>))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex border-b-[3px] border-black text-[8px] h-[130px]">
            <div className="w-[38%] border-r-[3px] border-black flex flex-col">
              <table className="w-full text-center border-collapse h-full">
                <thead>
                  <tr className="bg-gray-200 border-b-[2px] border-black h-[24px] !bg-gray-200" style={{ backgroundColor: '#e5e7eb' }}>
                    <th className="border-r border-black leading-tight">CARACTERISTICAS<br />DE LA MEZCLA</th><th className="border-r border-black leading-tight w-[20%]">MUESTREADA</th><th className="leading-tight w-[20%]">DEL<br />PROYECTO</th>
                  </tr>
                </thead>
                <tbody className="text-left font-bold">
                  <tr className="border-b border-gray-300"><td className="border-r border-black pl-2 py-1">CONTENIDO DE ASFALTO %</td><td className="border-r border-black text-center">{data.mezcla.contenidoAsfalto}</td><td className="text-center">-</td></tr>
                  <tr className="border-b border-gray-300"><td className="border-r border-black pl-8 text-[7px] py-1">MARCA.</td><td className="border-r border-black text-center font-normal">{data.mezcla.marca}</td><td></td></tr>
                  <tr className="border-b border-gray-300"><td className="border-r border-black pl-8 text-[7px] py-1">TIPO.</td><td className="border-r border-black text-center font-normal">{data.mezcla.tipo}</td><td></td></tr>
                  <tr className="border-b border-gray-300"><td className="border-r border-black pl-8 text-[7px] py-1">CANTIDAD./CA%</td><td className="border-r border-black text-center font-normal">{data.mezcla.cantidad}</td><td></td></tr>
                  <tr className="border-b border-gray-300"><td className="border-r border-black pl-2 py-1 text-[7px]">AFINIDAD DEL MAT. PETREO. <span className="font-normal text-[6px] ml-1">M.MMP.4.04.009</span></td><td className="border-r border-black text-center">{data.mezcla.afinidad}</td><td className="text-center">BUENA</td></tr>
                  <tr><td className="border-r border-black pl-2 py-1 leading-none text-[7px]">PERDIDA DE ESTABILIDAD POR INMERSION EN AGUA%</td><td className="border-r border-black text-center font-normal">{data.mezcla.perdidaEstabilidad}</td><td className="text-center">25 MAX.</td></tr>
                </tbody>
              </table>
            </div>
            <div className="w-[34%] border-r-[3px] border-black flex flex-col">
              <table className="w-full text-center border-collapse h-full">
                <thead>
                  <tr className="bg-gray-200 border-b-[2px] border-black h-[24px] !bg-gray-200" style={{ backgroundColor: '#e5e7eb' }}>
                    <th className="border-r border-black leading-tight">CARACTERISTICAS DEL<br />ESPECIMEN</th><th className="border-r border-black w-[20%]">NORMAS</th><th className="border-r border-black w-[20%]">RESULTADOS</th><th className="w-[15%]">ESPECIF.</th>
                  </tr>
                </thead>
                <tbody className="font-bold">
                  <tr className="border-b border-gray-300"><td className="border-r border-black text-[7px] py-1 text-left pl-1">PESO VOLUMETRICO (KG/cm³)</td><td className="border-r border-black text-[6px]">M.MMP.4.05.031</td><td className="border-r border-black text-center">{data.especimen.pesoVol}</td><td></td></tr>
                  <tr className="border-b border-gray-300"><td className="border-r border-black text-[7px] py-1 text-left pl-1">ESTABILIDAD (KGS.)</td><td className="border-r border-black text-[6px]">M.MMP.4.05.031</td><td className="border-r border-black text-center">{data.especimen.estabilidad} MIN</td><td></td></tr>
                  <tr className="border-b border-gray-300"><td className="border-r border-black text-[7px] py-1 text-left pl-1">FLUJO (mm.)</td><td className="border-r border-black text-[6px]">M.MMP.4.05.031</td><td className="border-r border-black text-center">{data.especimen.flujo}</td><td></td></tr>
                  <tr className="border-b border-gray-300"><td className="border-r border-black text-[7px] py-1 text-left pl-1">VACIOS (%)</td><td className="border-r border-black text-[6px]">M.MMP.4.05.031</td><td className="border-r border-black text-center">{data.especimen.vacios}</td><td></td></tr>
                  <tr className="border-b border-gray-300"><td className="border-r border-black text-[7px] py-1 text-left pl-1">V.A.M. (%)</td><td className="border-r border-black text-[6px]">M.MMP.4.05.031</td><td className="border-r border-black text-center">{data.especimen.vam} MIN</td><td></td></tr>
                  <tr><td className="border-r border-black text-[7px] py-1 text-left pl-1">V.A.F. %</td><td className="border-r border-black text-[6px]">M.MMP.4.05.031</td><td className="border-r border-black text-center">{data.especimen.vaf}</td><td></td></tr>
                </tbody>
              </table>
            </div>
            <div className="w-[28%] flex flex-col">
              <table className="w-full text-center border-collapse h-full">
                <thead>
                  <tr className="bg-gray-200 border-b-[2px] border-black h-[24px] !bg-gray-200" style={{ backgroundColor: '#e5e7eb' }}>
                    <th className="border-r border-black leading-tight">CARACTERISTICAS<br />DEL ASFALTO.</th><th className="text-[7px] border-b border-black">TIPO &nbsp;&nbsp;&nbsp;&nbsp; {data.asfalto.tipoPG} &nbsp;&nbsp;&nbsp;&nbsp; NORMAS</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-[7px]">
                  <tr className="border-b border-gray-300"><td className="border-r border-black text-right pr-2 py-1.5">PENET. 25°C 100g 5s.</td><td className="text-left pl-2 flex justify-between pr-2"><span>{data.asfalto.penetracion}</span> <span className="font-normal text-[6px]">M.MMP.4-05-006</span></td></tr>
                  <tr className="border-b border-gray-300"><td className="border-r border-black text-right pr-2 py-1.5">VISCOSIDAD SAYBOLT F.S</td><td className="text-left pl-2 flex justify-between pr-2"><span>{data.asfalto.viscosidad}</span> <span className="font-normal text-[6px]">M.MMP.4-05-004</span></td></tr>
                  <tr className="border-b border-gray-300"><td className="border-r border-black text-right pr-2 py-1.5">TEMP. RECOM.</td><td className="text-center">{data.asfalto.tempRecom}</td></tr>
                  <tr><td className="border-r border-black text-right pr-2 py-1.5">TEMP. APLIC.</td><td className="text-center">{data.asfalto.tempAplic}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-2 border-b-[3px] border-black h-[80px]"><div className="font-bold text-[9px]">OBSERVACIONES:</div><div className="text-center font-bold uppercase mt-4 text-[12px] tracking-wide">{data.observaciones}</div></div>
          <div className="flex h-[70px] text-center items-end pb-2 text-[9px] font-bold">
            <div className="w-1/3 px-12"><div className="border-t border-black pt-1">LABORATORISTA.</div></div>
            <div className="w-1/3 px-12"><div className="border-t border-black pt-1">JEFE DE LABORATORIO</div></div>
            <div className="w-1/3 px-12"><div className="border-t border-black pt-1">VO.BO.</div></div>
          </div>
        </div>
        <div className="mx-auto mt-2 text-[9px] font-bold relative w-[980px]">
          <div className="mb-2 text-gray-700 ml-4">{data.tecnico}</div>
          <table className="w-[180px] ml-4 text-gray-700">
            <tbody>
              <tr><td className="pb-1 align-top w-[60%]">% de Cem. En peso</td><td className="text-right pb-1 leading-tight">{data.extras.cemPeso1}<br />{data.extras.cemPeso2}</td></tr>
              <tr><td className="py-0.5">Cemento Asfaltico</td><td className="text-right py-0.5">{data.extras.cementoAsfaltico}</td></tr>
              <tr><td className="py-0.5">Material petreo</td><td className="text-right py-0.5">{data.extras.materialPetreo}</td></tr>
              <tr><td className="py-0.5">Densidad del C. Asf.</td><td className="text-right py-0.5">{data.extras.densidadCAsf}</td></tr>
            </tbody>
          </table>
          <div className="absolute right-4 bottom-0 text-gray-700 text-[10px] tracking-wider">{data.formatoUnico}</div>
        </div>
      </div>
    </div>
  );
}

function AsphaltRouter() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const testId = searchParams.get('testId');

  if (!projectId && !testId) {
    return <AsphaltDashboard />;
  }
  return <AsphaltTestContent />;
}

export default function App() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-white">Cargando módulo...</div>}>
      <AsphaltRouter />
    </Suspense>
  );
}