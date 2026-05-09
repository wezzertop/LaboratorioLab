"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layers, Activity, FileText, Printer, Save } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import { Button } from '@/src/components/ui/Button';
import { useCreditStore } from '@/src/store/useCreditStore';

function SuelosDashboard() {
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
          .eq('test_type', 'suelos')
          .order('created_at', { ascending: false });
        if (data) setTests(data);
      }
      setLoading(false);
    }
    loadTests();
  }, []);

  if (loading) return <div className="p-12 text-[#b87333] text-center">Cargando dashboard...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141414] border border-[#b87333]/30 p-6 rounded-3xl shadow-[0_0_30px_rgba(184,115,51,0.05)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Layers className="text-[#b87333]" />
            Dashboard de Mecánica de Suelos
          </h1>
          <p className="text-sm sm:text-base text-zinc-500">Historial de pruebas de compactación (Proctor) y Límites de Atterberg.</p>
        </div>
        <Link href="/dashboard/projects" className="w-full sm:w-auto text-center bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          Ir a Proyectos
        </Link>
      </div>

      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="text-[#b87333]" /> �altimos Ensayes
        </h2>

        {tests.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
            Aún no has realizado pruebas de mecánica de suelos. Ve a un Proyecto y crea un nuevo ensaye.
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map(test => (
              <div key={test.id} onClick={() => router.push(`/dashboard/tests/suelos?testId=${test.id}&projectId=${test.project_id}`)} className="flex justify-between items-center p-4 bg-[#141414] border border-zinc-800 hover:border-[#b87333]/50 rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-[#b87333]/10 text-[#b87333] group-hover:bg-[#b87333] group-hover:text-white transition-colors">
                    <Layers size={20} />
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

function SuelosTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const testId = searchParams.get('testId');

  const { consumeCredit, initialize } = useCreditStore();
  const [profile, setProfile] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const hoy = new Date().toISOString().split('T')[0];

  const [data, setData] = useState({
    licitacionNo: 'SUE-002-26', ensayeNo: 'MS-01',
    fechaMuestreo: hoy, fechaEnsaye: hoy,
    descripcionMaterial: 'MATERIAL DE BANCO (TEPETATE)',
    ubicacionBanco: 'BANCO SAN JOSE, KM 12',
    proctorPVSM: '1850', proctorHumedad: '14.5',
    limiteLiquido: '35', limitePlastico: '20', indicePlasticidad: '15',
    observaciones: 'MATERIAL APTO PARA CAPA SUBRASANTE SEG�aN NORMATIVA VIGENTE.',
    tecnico: '',
    normativa: 'M.MMP.1.09 (Proctor AASHTO)',
    coordinates: '',
    status: 'FINALIZADO'
  });

  const getCoordinates = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setData(prev => ({ ...prev, coordinates: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}` }));
        },
        (error) => alert("No se pudo obtener la ubicación exacta. Asegúrate de dar permisos de GPS al navegador."),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("La geolocalización no es soportada.");
    }
  };

  useEffect(() => {
    async function fetchProfileAndTest() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (pData) {
          setProfile(pData);
          initialize(pData.credits || 0, pData.free_reports_used || 0);
          setData(prev => ({ ...prev, tecnico: `${pData.full_name || 'T�0CNICO'} - Céd: ${pData.license_number || 'S/N'}`.toUpperCase() }));
        }
      }

      if (testId) {
        const { data: testData } = await supabase.from('tests').select('*').eq('id', testId).single();
        if (testData && testData.data) {
          setData(testData.data);
        }
      }
    }
    fetchProfileAndTest();
  }, [testId, initialize]);

  const handleChange = (field: string, value: string) => setData(prev => ({ ...prev, [field]: value }));
  const handleFocus = (e: any) => e.target.select();

  // Auto calcular IP
  useEffect(() => {
    const ll = parseFloat(data.limiteLiquido);
    const lp = parseFloat(data.limitePlastico);
    if (!isNaN(ll) && !isNaN(lp)) {
      setData(prev => ({ ...prev, indicePlasticidad: (ll - lp).toString() }));
    }
  }, [data.limiteLiquido, data.limitePlastico]);

  const handleSave = async () => {
    if (!projectId && !testId) return alert("Falta el proyecto.");
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión no encontrada");

      const payload = {
        project_id: projectId,
        user_id: user.id,
        test_type: 'suelos',
        name: `${data.ensayeNo} - ${data.descripcionMaterial}`,
        status: data.status,
        data: data
      };

      if (testId) {
        const { error } = await supabase.from('tests').update(payload).eq('id', testId);
        if (error) throw error;
        alert("Ensaye actualizado.");
      } else {
        const { data: newTest, error } = await supabase.from('tests').insert([payload]).select().single();
        if (error) throw error;
        alert("Ensaye guardado.");
        router.replace(`/dashboard/tests/suelos?projectId=${projectId}&testId=${newTest.id}`);
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 pb-20 font-sans">
      <div className="max-w-[1000px] mx-auto p-6 space-y-6 print:hidden">
        
        {/* HEADER BAR */}
        <div className="sticky top-4 z-50 bg-[#141414] border border-[#b87333]/30 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-[0_0_30px_rgba(184,115,51,0.05)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="bg-[#b87333]/10 p-3 rounded-xl border border-[#b87333]/30"><Layers className="text-[#b87333]" size={24} /></div>
            <div>
              <h1 className="text-xl font-bold text-white">Ensaye de Calidad de Suelos</h1>
              <p className="text-zinc-500 text-xs">Reporte de Compactación y Atterberg.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
            <select value={data.status} onChange={e => handleChange('status', e.target.value)} className={`bg-[#0a0a0a] border rounded-lg p-2 text-xs font-bold outline-none cursor-pointer ${data.status === 'FINALIZADO' ? 'text-[#2BD45A] border-[#2BD45A]/50' : 'text-yellow-500 border-yellow-500/50'}`}>
              <option value="EN PROCESO">EN PROCESO</option>
              <option value="FINALIZADO">FINALIZADO</option>
            </select>
            <Button onClick={handleSave} className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white gap-2 shadow-none border border-zinc-700">
              {isSaving ? <Activity className="animate-spin" size={20} /> : <Save size={20} />} {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button onClick={() => { if (consumeCredit()) window.print(); else alert("No tienes créditos."); }} className="w-full sm:w-auto bg-[#b87333] hover:bg-[#a0632a] text-white shadow-[0_0_20px_rgba(184,115,51,0.3)] gap-2">
              <Printer size={20} /> Imprimir PDF
            </Button>
          </div>
        </div>

        {/* DATOS GENERALES */}
        <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <h2 className="text-[#b87333] font-bold mb-4 text-sm flex items-center gap-2"><FileText size={16} /> IDENTIFICACI�N DE LA MUESTRA</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div><label className="block text-[10px] text-zinc-500 mb-1">ENSAYE N°</label><input type="text" value={data.ensayeNo} onChange={e => handleChange('ensayeNo', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1">LICITACI�N NO.</label><input type="text" value={data.licitacionNo} onChange={e => handleChange('licitacionNo', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1">FECHA MUESTREO</label><input type="date" value={data.fechaMuestreo} onChange={e => handleChange('fechaMuestreo', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1">FECHA ENSAYE</label><input type="date" value={data.fechaEnsaye} onChange={e => handleChange('fechaEnsaye', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-[#b87333] mb-1 font-bold">NORMATIVA APLICABLE</label>
              <select value={data.normativa} onChange={e => handleChange('normativa', e.target.value)} className="w-full bg-[#141414] border border-[#b87333]/50 rounded p-2 text-xs text-[#b87333] font-bold outline-none cursor-pointer">
                <option value="M.MMP.1.09 (Proctor AASHTO)">M.MMP.1.09 (Proctor)</option>
                <option value="M.MMP.1.07 (Atterberg)">M.MMP.1.07 (Límites)</option>
                <option value="ASTM D1557 (Modificado)">ASTM D1557</option>
                <option value="OTRA">OTRA (Indicar en obs.)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
             <div><label className="block text-[10px] text-zinc-500 mb-1">DESCRIPCI�N DEL MATERIAL</label><input type="text" value={data.descripcionMaterial} onChange={e => handleChange('descripcionMaterial', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
             <div><label className="block text-[10px] text-zinc-500 mb-1">UBICACI�N DEL BANCO / TRAMO</label><input type="text" value={data.ubicacionBanco} onChange={e => handleChange('ubicacionBanco', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
             <div><label className="block text-[10px] text-zinc-500 mb-1">COORDENADAS DE MUESTREO (GPS)</label>
               <div className="flex gap-2">
                 <input type="text" value={data.coordinates} onChange={e => handleChange('coordinates', e.target.value)} placeholder="Ej. 21.16, -86.85" className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white focus:border-[#b87333] outline-none" />
                 <button type="button" onClick={getCoordinates} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 rounded transition-colors flex items-center justify-center border border-zinc-700"><Activity size={16} /></button>
               </div>
             </div>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 shadow-lg">
             <h2 className="text-[#b87333] font-bold mb-4 text-sm flex items-center gap-2"><Activity size={16} /> PRUEBA DE COMPACTACI�N (PROCTOR)</h2>
             <div className="space-y-4">
               <div><label className="block text-[10px] text-zinc-500 mb-1">PESO VOLUM�0TRICO SECO MÁXIMO (kg/m³)</label><input type="number" onFocus={handleFocus} value={data.proctorPVSM} onChange={e => handleChange('proctorPVSM', e.target.value)} className="w-full bg-black border border-zinc-500 rounded p-3 text-lg text-white font-black text-center" /></div>
               <div><label className="block text-[10px] text-zinc-500 mb-1">HUMEDAD �PTIMA (%)</label><input type="number" step="0.1" onFocus={handleFocus} value={data.proctorHumedad} onChange={e => handleChange('proctorHumedad', e.target.value)} className="w-full bg-black border border-[#b87333] rounded p-3 text-lg text-[#b87333] font-black text-center" /></div>
             </div>
          </div>
          
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 shadow-lg">
             <h2 className="text-[#b87333] font-bold mb-4 text-sm flex items-center gap-2"><Layers size={16} /> LÍMITES DE ATTERBERG</h2>
             <div className="space-y-4">
               <div className="flex gap-4">
                 <div className="flex-1"><label className="block text-[10px] text-zinc-500 mb-1">LÍMITE LÍQUIDO (%)</label><input type="number" onFocus={handleFocus} value={data.limiteLiquido} onChange={e => handleChange('limiteLiquido', e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-2 text-white text-center font-bold" /></div>
                 <div className="flex-1"><label className="block text-[10px] text-zinc-500 mb-1">LÍMITE PLÁSTICO (%)</label><input type="number" onFocus={handleFocus} value={data.limitePlastico} onChange={e => handleChange('limitePlastico', e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-2 text-white text-center font-bold" /></div>
               </div>
               <div><label className="block text-[10px] text-zinc-500 mb-1">ÍNDICE DE PLASTICIDAD (IP)</label><input type="text" readOnly value={data.indicePlasticidad} className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-lg text-white font-black text-center outline-none" /></div>
             </div>
          </div>
        </div>

        <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <label className="block text-[10px] text-zinc-500 mb-2">OBSERVACIONES</label>
          <textarea value={data.observaciones} onChange={e => handleChange('observaciones', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-3 text-xs text-white" rows={3} />
        </div>
      </div>

      {/* --- VISTA DE IMPRESI�N --- */}
      <div className="hidden print:block bg-white text-black font-sans leading-none pt-2" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
         <div className="mx-auto w-[980px] border-[3px] border-black text-[12px] relative h-[700px] flex flex-col">
          {profile?.company_logo_url && (
             <img src={profile.company_logo_url} alt="Logo" className="absolute top-2 left-2 w-24 h-auto object-contain z-10" />
          )}
          <div className="bg-gray-200 font-bold text-center py-3 text-[16px] border-b-[3px] border-black uppercase !bg-gray-200" style={{ backgroundColor: '#e5e7eb' }}>
            REPORTE DE CALIDAD DE MATERIALES (MECÁNICA DE SUELOS)
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

          <div className="flex flex-1 p-4 gap-8">
             <div className="w-1/2 border-[2px] border-black rounded-lg p-4 h-max">
                <h3 className="font-bold border-b border-black pb-2 mb-4 text-center">PRUEBA DE COMPACTACI�N (PROCTOR)</h3>
                <div className="space-y-6 text-[14px]">
                   <div className="flex justify-between border-b border-gray-300 pb-2">
                      <span>PESO VOLUM�0TRICO SECO MÁX.</span>
                      <span className="font-bold">{data.proctorPVSM} kg/m³</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-300 pb-2">
                      <span>HUMEDAD �PTIMA</span>
                      <span className="font-bold">{data.proctorHumedad} %</span>
                   </div>
                </div>
             </div>
             
             <div className="w-1/2 border-[2px] border-black rounded-lg p-4 h-max">
                <h3 className="font-bold border-b border-black pb-2 mb-4 text-center">LÍMITES DE CONSISTENCIA (ATTERBERG)</h3>
                <div className="space-y-6 text-[14px]">
                   <div className="flex justify-between border-b border-gray-300 pb-2">
                      <span>LÍMITE LÍQUIDO (LL)</span>
                      <span className="font-bold">{data.limiteLiquido} %</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-300 pb-2">
                      <span>LÍMITE PLÁSTICO (LP)</span>
                      <span className="font-bold">{data.limitePlastico} %</span>
                   </div>
                   <div className="flex justify-between border-b border-black pb-2 bg-gray-100 px-2 mt-2 !bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
                      <span className="font-bold">ÍNDICE DE PLASTICIDAD (IP)</span>
                      <span className="font-bold">{data.indicePlasticidad}</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="p-4 border-t-[3px] border-black h-[100px]">
             <span className="font-bold">OBSERVACIONES:</span><br/>
             <span className="uppercase text-sm">{data.observaciones}</span>
          </div>

          <div className="flex h-[100px] text-center items-end pb-4 text-[11px] font-bold mt-auto border-t-[3px] border-black pt-12 bg-white">
            <div className="w-1/2 px-20">
              <div className="border-t-[2px] border-black pt-2 uppercase">{data.tecnico}</div>
              <div>LABORATORISTA</div>
            </div>
            <div className="w-1/2 px-20">
              <div className="border-t-[2px] border-black pt-2">SUPERVISOR / VO.BO.</div>
            </div>
          </div>

         </div>
      </div>
    </div>
  );
}

function SuelosRouter() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const testId = searchParams.get('testId');

  if (!projectId && !testId) return <SuelosDashboard />;
  return <SuelosTestContent />;
}

export default function App() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-white">Cargando módulo...</div>}>
      <SuelosRouter />
    </Suspense>
  );
}
