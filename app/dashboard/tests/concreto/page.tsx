"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Beaker, Activity, FileText, Printer, Save } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import { Button } from '@/src/components/ui/Button';
import { useCreditStore } from '@/src/store/useCreditStore';

function ConcretoDashboard() {
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
          .eq('test_type', 'concreto')
          .order('created_at', { ascending: false });
        if (data) setTests(data);
      }
      setLoading(false);
    }
    loadTests();
  }, []);

  if (loading) return <div className="p-12 text-zinc-400 text-center">Cargando dashboard...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141414] border border-zinc-500/30 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Beaker className="text-zinc-400" />
            Dashboard de Concreto
          </h1>
          <p className="text-sm sm:text-base text-zinc-500">Historial global de pruebas de compresión de cilindros de concreto.</p>
        </div>
        <Link href="/dashboard/projects" className="w-full sm:w-auto text-center bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          Ir a Proyectos
        </Link>
      </div>

      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="text-zinc-500" /> �altimos Ensayes
        </h2>

        {tests.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
            Aún no has realizado pruebas de concreto. Ve a un Proyecto y crea un nuevo ensaye.
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map(test => (
              <div key={test.id} onClick={() => router.push(`/dashboard/tests/concreto?testId=${test.id}&projectId=${test.project_id}`)} className="flex justify-between items-center p-4 bg-[#141414] border border-zinc-800 hover:border-zinc-500/50 rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 transition-colors">
                    <Beaker size={20} />
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

function ConcretoTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const testId = searchParams.get('testId');

  const { consumeCredit, initialize } = useCreditStore();
  const [profile, setProfile] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const hoy = new Date().toISOString().split('T')[0];

  const [data, setData] = useState({
    licitacionNo: '001-2026', ensayeNo: 'C-01',
    fechaColado: hoy, fechaEnsaye: hoy,
    elemento: 'COLUMNAS EJE 1 AL 5',
    resistenciaProyecto: '250', revenimiento: '10',
    tamanoMaximo: '3/4"', aditivo: 'REDUCTOR DE AGUA',
    cilindros: [
      { id: 1, edad: '7', diametro: '15.0', area: '176.71', carga: '35000', resistencia: '198.06', porcentaje: '79.2', falla: 'TIPO 2' },
      { id: 2, edad: '14', diametro: '15.0', area: '176.71', carga: '', resistencia: '', porcentaje: '', falla: '' },
      { id: 3, edad: '28', diametro: '15.0', area: '176.71', carga: '', resistencia: '', porcentaje: '', falla: '' },
    ],
    observaciones: 'CILINDROS CURADOS EN PILETA A TEMPERATURA CONTROLADA.',
    tecnico: '',
    normativa: 'NMX-C-083-ONNCCE',
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
  const handleCilindro = (index: number, field: string, value: string) => {
    setData(prev => {
      const newCilindros = [...prev.cilindros];
      newCilindros[index] = { ...newCilindros[index], [field]: value };
      
      // Auto-calc resistance if area and load are present
      if ((field === 'carga' || field === 'area') && newCilindros[index].area && newCilindros[index].carga) {
        const area = parseFloat(newCilindros[index].area);
        const carga = parseFloat(newCilindros[index].carga);
        if (area > 0) {
          const res = (carga / area).toFixed(2);
          newCilindros[index].resistencia = res;
          if (prev.resistenciaProyecto) {
            newCilindros[index].porcentaje = ((parseFloat(res) / parseFloat(prev.resistenciaProyecto)) * 100).toFixed(1);
          }
        }
      }
      return { ...prev, cilindros: newCilindros };
    });
  };
  const handleFocus = (e: any) => e.target.select();

  const handleSave = async () => {
    if (!projectId && !testId) return alert("Falta el proyecto.");
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión no encontrada");

      const payload = {
        project_id: projectId,
        user_id: user.id,
        test_type: 'concreto',
        name: `${data.ensayeNo} - ${data.elemento}`,
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
        router.replace(`/dashboard/tests/concreto?projectId=${projectId}&testId=${newTest.id}`);
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto p-6 space-y-6 print:hidden">
        
        {/* HEADER BAR */}
        <div className="sticky top-4 z-50 bg-[#141414] border border-zinc-500/30 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700"><Beaker className="text-zinc-300" size={24} /></div>
            <div>
              <h1 className="text-xl font-bold text-white">Ensaye de Concreto Hidráulico</h1>
              <p className="text-zinc-500 text-xs">Resistencia a la compresión de cilindros.</p>
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
            <Button onClick={() => { if (consumeCredit()) window.print(); else alert("No tienes créditos."); }} className="w-full sm:w-auto bg-zinc-500 hover:bg-zinc-400 gap-2">
              <Printer size={20} /> Imprimir PDF
            </Button>
          </div>
        </div>

        {/* DATOS GENERALES */}
        <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <h2 className="text-zinc-400 font-bold mb-4 text-sm flex items-center gap-2"><FileText size={16} /> DATOS GENERALES</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div><label className="block text-[10px] text-zinc-500 mb-1">ENSAYE N°</label><input type="text" value={data.ensayeNo} onChange={e => handleChange('ensayeNo', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1">LICITACI�N NO.</label><input type="text" value={data.licitacionNo} onChange={e => handleChange('licitacionNo', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1">FECHA DE COLADO</label><input type="date" value={data.fechaColado} onChange={e => handleChange('fechaColado', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1">FECHA DE ENSAYE</label><input type="date" value={data.fechaEnsaye} onChange={e => handleChange('fechaEnsaye', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-[#FF5F15] mb-1 font-bold">NORMATIVA APLICABLE</label>
              <select value={data.normativa} onChange={e => handleChange('normativa', e.target.value)} className="w-full bg-[#141414] border border-[#FF5F15]/50 rounded p-2 text-xs text-[#FF5F15] font-bold outline-none cursor-pointer">
                <option value="NMX-C-083-ONNCCE">NMX-C-083 (Resistencia)</option>
                <option value="ASTM C39">ASTM C39 (Compresión)</option>
                <option value="NMX-C-156-ONNCCE">NMX-C-156 (Revenimiento)</option>
                <option value="OTRA">OTRA (Indicar en obs.)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
             <div className="md:col-span-2"><label className="block text-[10px] text-zinc-500 mb-1">ELEMENTO COLADO</label><input type="text" value={data.elemento} onChange={e => handleChange('elemento', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
             <div className="md:col-span-2"><label className="block text-[10px] text-zinc-500 mb-1">COORDENADAS DE MUESTREO (GPS)</label>
               <div className="flex gap-2">
                 <input type="text" value={data.coordinates} onChange={e => handleChange('coordinates', e.target.value)} placeholder="Ej. 21.16, -86.85" className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white focus:border-[#FF5F15] outline-none" />
                 <button type="button" onClick={getCoordinates} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 rounded transition-colors flex items-center justify-center border border-zinc-700"><Activity size={16} /></button>
               </div>
             </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="block text-[10px] text-zinc-500 mb-1 text-zinc-300">f'c PROYECTO (kg/cm²)</label><input type="number" value={data.resistenciaProyecto} onChange={e => handleChange('resistenciaProyecto', e.target.value)} className="w-full bg-black border border-zinc-500 rounded p-2 text-sm text-white font-bold" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1">REVENIMIENTO (cm)</label><input type="text" value={data.revenimiento} onChange={e => handleChange('revenimiento', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1">TAMA�O MÁXIMO</label><input type="text" value={data.tamanoMaximo} onChange={e => handleChange('tamanoMaximo', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1">ADITIVO</label><input type="text" value={data.aditivo} onChange={e => handleChange('aditivo', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-2 text-xs text-white" /></div>
          </div>
        </div>

        {/* TABLA DE CILINDROS */}
        <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <h2 className="text-zinc-400 font-bold mb-4 text-sm flex items-center gap-2"><Beaker size={16} /> RESULTADOS DE CILINDROS</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="p-2">No.</th><th className="p-2">Edad (días)</th><th className="p-2">Diám. (cm)</th><th className="p-2">Área (cm²)</th>
                  <th className="p-2">Carga (kg)</th><th className="p-2 text-zinc-300">Resist. (kg/cm²)</th><th className="p-2">% de f'c</th><th className="p-2">Tipo Falla</th>
                </tr>
              </thead>
              <tbody>
                {data.cilindros.map((cil, idx) => (
                  <tr key={idx} className="border-b border-zinc-800/50">
                    <td className="p-2 text-zinc-400 font-bold">{cil.id}</td>
                    <td className="p-2"><input type="number" onFocus={handleFocus} value={cil.edad} onChange={e => handleCilindro(idx, 'edad', e.target.value)} className="w-16 bg-black border border-zinc-700 rounded p-1 text-center" /></td>
                    <td className="p-2"><input type="number" onFocus={handleFocus} value={cil.diametro} onChange={e => handleCilindro(idx, 'diametro', e.target.value)} className="w-16 bg-black border border-zinc-700 rounded p-1 text-center" /></td>
                    <td className="p-2"><input type="number" onFocus={handleFocus} value={cil.area} onChange={e => handleCilindro(idx, 'area', e.target.value)} className="w-20 bg-black border border-zinc-700 rounded p-1 text-center" /></td>
                    <td className="p-2"><input type="number" onFocus={handleFocus} value={cil.carga} onChange={e => handleCilindro(idx, 'carga', e.target.value)} className="w-24 bg-black border border-zinc-700 rounded p-1 text-center font-bold text-white focus:border-zinc-400" /></td>
                    <td className="p-2"><input type="number" value={cil.resistencia} readOnly className="w-20 bg-transparent text-white font-bold text-center outline-none" /></td>
                    <td className="p-2"><span className={`font-bold ${parseFloat(cil.porcentaje) >= 100 ? 'text-[#2BD45A]' : 'text-yellow-500'}`}>{cil.porcentaje ? cil.porcentaje + '%' : ''}</span></td>
                    <td className="p-2"><input type="text" onFocus={handleFocus} value={cil.falla} onChange={e => handleCilindro(idx, 'falla', e.target.value)} className="w-24 bg-black border border-zinc-700 rounded p-1 text-center" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <label className="block text-[10px] text-zinc-500 mb-2">OBSERVACIONES</label>
          <textarea value={data.observaciones} onChange={e => handleChange('observaciones', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded p-3 text-xs text-white" rows={2} />
        </div>
      </div>

      {/* --- VISTA DE IMPRESI�N --- */}
      <div className="hidden print:block bg-white text-black font-sans leading-none pt-2" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
         <div className="mx-auto w-[980px] border-[3px] border-black text-[12px] relative">
          {profile?.company_logo_url && (
             <img src={profile.company_logo_url} alt="Logo" className="absolute top-2 left-2 w-24 h-auto object-contain z-10" />
          )}
          <div className="bg-gray-200 font-bold text-center py-3 text-[16px] border-b-[3px] border-black uppercase !bg-gray-200" style={{ backgroundColor: '#e5e7eb' }}>
            REPORTE DE ENSAYE A COMPRESI�N DE CILINDROS DE CONCRETO
          </div>
          
          <div className="flex border-b-[3px] border-black p-2">
             <div className="w-1/2 space-y-2">
                <div className="flex"><span className="font-bold w-1/3">OBRA / LICITACI�N:</span><span>{data.licitacionNo}</span></div>
                <div className="flex"><span className="font-bold w-1/3">ELEMENTO:</span><span>{data.elemento}</span></div>
             </div>
             <div className="w-1/2 space-y-2 text-right">
                <div className="flex justify-end"><span className="font-bold w-1/3 text-left">ENSAYE N°:</span><span className="w-1/3 text-left">{data.ensayeNo}</span></div>
                <div className="flex justify-end"><span className="font-bold w-1/3 text-left">FECHA COLADO:</span><span className="w-1/3 text-left">{data.fechaColado}</span></div>
             </div>
          </div>

          <div className="flex border-b-[3px] border-black p-2 bg-yellow-100 !bg-yellow-100 font-bold justify-center" style={{ backgroundColor: '#fef9c3' }}>
            NORMATIVA DE REFERENCIA: {data.normativa}
          </div>

          <div className="flex border-b-[3px] border-black p-2 bg-gray-100 !bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
             <div className="w-1/4"><b>f'c PROYECTO:</b> {data.resistenciaProyecto} kg/cm²</div>
             <div className="w-1/4"><b>REVENIMIENTO:</b> {data.revenimiento} cm</div>
             <div className="w-1/4"><b>TAMA�O MÁX.:</b> {data.tamanoMaximo}</div>
             <div className="w-1/4"><b>ADITIVO:</b> {data.aditivo}</div>
          </div>

          <table className="w-full text-center border-collapse mt-4">
             <thead>
                <tr className="border-[2px] border-black bg-gray-200 !bg-gray-200" style={{ backgroundColor: '#e5e7eb' }}>
                   <th className="p-2 border-r border-black">MUESTRA</th>
                   <th className="p-2 border-r border-black">EDAD<br/>(DÍAS)</th>
                   <th className="p-2 border-r border-black">DIÁMETRO<br/>(cm)</th>
                   <th className="p-2 border-r border-black">ÁREA<br/>(cm²)</th>
                   <th className="p-2 border-r border-black">CARGA<br/>MÁXIMA (kg)</th>
                   <th className="p-2 border-r border-black">RESISTENCIA<br/>(kg/cm²)</th>
                   <th className="p-2 border-r border-black">% RESISTENCIA<br/>vs f'c</th>
                   <th className="p-2">TIPO DE<br/>FALLA</th>
                </tr>
             </thead>
             <tbody>
                {data.cilindros.map(cil => (
                   <tr key={cil.id} className="border-b border-black">
                      <td className="p-2 border-r border-black font-bold">{cil.id}</td>
                      <td className="p-2 border-r border-black">{cil.edad}</td>
                      <td className="p-2 border-r border-black">{cil.diametro}</td>
                      <td className="p-2 border-r border-black">{cil.area}</td>
                      <td className="p-2 border-r border-black font-bold">{cil.carga}</td>
                      <td className="p-2 border-r border-black font-bold">{cil.resistencia}</td>
                      <td className="p-2 border-r border-black font-bold">{cil.porcentaje}%</td>
                      <td className="p-2">{cil.falla}</td>
                   </tr>
                ))}
             </tbody>
          </table>

          <div className="p-4 border-[2px] border-black mt-4 h-[100px]">
             <span className="font-bold">OBSERVACIONES:</span><br/>
             <span className="uppercase text-sm">{data.observaciones}</span>
          </div>

          <div className="flex h-[100px] text-center items-end pb-4 text-[11px] font-bold mt-12">
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

function ConcretoRouter() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const testId = searchParams.get('testId');

  if (!projectId && !testId) return <ConcretoDashboard />;
  return <ConcretoTestContent />;
}

export default function App() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-white">Cargando módulo...</div>}>
      <ConcretoRouter />
    </Suspense>
  );
}
