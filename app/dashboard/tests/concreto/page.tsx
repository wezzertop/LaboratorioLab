"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { usePrintScale } from '@/src/lib/hooks/usePrintScale';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Beaker, Activity, FileText, Printer, Save } from 'lucide-react';
import { TestPageHeader } from '@/src/components/ui/TestPageHeader';
import { TestDashboard } from '@/src/components/ui/TestDashboard';
import { supabase } from '@/src/lib/supabase/client';
import { Button } from '@/src/components/ui/Button';
import { useCreditStore } from '@/src/store/useCreditStore';

function ConcretoDashboard() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <TestDashboard
      icon={<Beaker size={18} />}
      title="Dashboard de Concreto"
      subtitle="Historial global de pruebas de compresión de cilindros de concreto."
      accentBg="bg-zinc-600"
      accentText="text-zinc-400"
      accentBorder="border-zinc-500/30"
      accentShadow="shadow-xl"
      testType="concreto"
      tests={tests}
      loading={loading}
    />
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
  const [showPreview, setShowPreview] = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Escala automática para impresión
  usePrintScale(980, 'print-scale-wrapper-concreto');

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

  const handleConfirmPrint = async () => {
    setIsPrinting(true);
    try {
      if (consumeCredit()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({
            credits: useCreditStore.getState().credits,
            free_reports_used: useCreditStore.getState().freeReportsUsed
          }).eq('id', user.id);
        }
        window.print();
        setHasPrinted(true);
        setShowPrintConfirm(false);
        setShowPreview(false);
      } else {
        alert("No tienes suficientes créditos.");
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsPrinting(false);
    }
  };

  const renderReport = () => (
    <>
      <div className="mx-auto w-[980px] border-[3px] border-black text-[12px] relative">
        {profile?.company_logo_url && (
            <img src={profile.company_logo_url} alt="Logo" className="absolute top-2 left-2 w-24 h-auto object-contain z-10" />
        )}
        <div className="bg-gray-200 font-bold text-center py-3 text-[16px] border-b-[3px] border-black uppercase !bg-gray-200" style={{ backgroundColor: '#e5e7eb' }}>
          REPORTE DE ENSAYE A COMPRESI N DE CILINDROS DE CONCRETO
        </div>
        
        <div className="flex border-b-[3px] border-black p-2">
            <div className="w-1/2 space-y-2">
              <div className="flex"><span className="font-bold w-1/3">OBRA / LICITACI N:</span><span>{data.licitacionNo}</span></div>
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
            <div className="w-1/4"><b>TAMA O MÁX.:</b> {data.tamanoMaximo}</div>
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
                    <td className="p-2 border-r border-black font-bold">{cil.porcentaje ? cil.porcentaje + '%' : ''}</td>
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
    </>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 pb-20 font-sans">
      {/* MODAL VISTA PREVIA */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-start overflow-y-auto p-4 print:hidden backdrop-blur-sm">
          <div className="w-full max-w-5xl flex flex-col gap-4 mt-16 md:mt-0">
            <div className="flex justify-end gap-3 bg-[#141414] p-3 rounded-2xl border border-zinc-800 shadow-xl w-full">
               <button onClick={() => setShowPreview(false)} className="flex-1 sm:flex-none bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 rounded-xl font-bold text-xs md:text-sm transition-colors border border-zinc-700">Cerrar</button>
                <button onClick={() => { 
                  setShowPreview(false);
                  setShowPrintConfirm(true);
                }} className="flex-1 sm:flex-none bg-[#FF5F15] hover:bg-[#e04f0f] text-white px-5 py-2 rounded-xl font-bold flex items-center justify-center gap-2 text-xs md:text-sm transition-colors shadow-[0_0_15px_rgba(255,95,21,0.3)]"><Printer size={16}/> Imprimir PDF</button>
            </div>
            
            <div className="w-full bg-white rounded-xl shadow-2xl overflow-x-auto p-4 md:p-8">
               <div className="min-w-[980px]">
                 {renderReport()}
               </div>
            </div>

            <div className="bg-[#FF5F15]/10 border border-[#FF5F15]/20 p-4 rounded-2xl text-center">
               <p className="text-[#FF5F15] text-[10px] md:text-xs font-bold uppercase tracking-widest">Desliza horizontalmente para revisar el reporte completo</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto p-6 space-y-6 print:hidden">
        
        {/* HEADER BAR */}
        <div className="sticky top-0 z-10">
          <TestPageHeader
            icon={<Beaker size={16} className="text-zinc-300" />}
            iconStyle="bg-zinc-800 border-zinc-700"
            title="Ensaye de Concreto"
            subtitle="Resistencia a la compresión."
            status={data.status}
            onStatusChange={val => handleChange('status', val)}
            onSave={handleSave}
            isSaving={isSaving}
            onView={() => setShowPreview(true)}
            onPdf={() => setShowPrintConfirm(true)}
            hasPrinted={hasPrinted}
            isPrinting={isPrinting}
            pdfStyle="bg-[#FF5F15] hover:bg-[#e04f0f] shadow-[0_0_12px_rgba(255,95,21,0.4)]"
            cardBorder="border-zinc-500/30"
          />
        </div>

        {/* MODAL DE CONFIRMACIÓN DE CRÉDITO */}
        {showPrintConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#141414] border border-[#FF5F15]/50 p-8 rounded-3xl max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-white text-center mb-4">¿Confirmar Crédito?</h2>
              <p className="text-zinc-400 text-center mb-8 text-sm">
                Se descontará <span className="text-white font-bold">1 crédito</span> de tu cuenta para generar este reporte oficial.
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={handleConfirmPrint} disabled={isPrinting} className="w-full bg-[#FF5F15] py-6 rounded-2xl font-bold">
                  {isPrinting ? 'Procesando...' : 'Confirmar y Gastar 1 Crédito'}
                </Button>
                <button onClick={() => setShowPrintConfirm(false)} className="w-full py-2 text-zinc-500 text-sm">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* DATOS GENERALES */}
        <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <h2 className="text-zinc-400 font-bold mb-4 text-sm flex items-center gap-2"><FileText size={16} /> DATOS GENERALES</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-4">
            <div><label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-tight">Ensaye N°</label><input type="text" value={data.ensayeNo} onChange={e => handleChange('ensayeNo', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-tight">Licitación No.</label><input type="text" value={data.licitacionNo} onChange={e => handleChange('licitacionNo', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-tight">Fecha Colado</label><input type="date" value={data.fechaColado} onChange={e => handleChange('fechaColado', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-tight">Fecha Ensaye</label><input type="date" value={data.fechaEnsaye} onChange={e => handleChange('fechaEnsaye', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg p-2 text-xs text-white" /></div>
            <div className="sm:col-span-2 md:col-span-1"><label className="block text-[10px] text-[#FF5F15] mb-1 font-bold uppercase tracking-tight">Normativa</label>
              <select value={data.normativa} onChange={e => handleChange('normativa', e.target.value)} className="w-full bg-[#141414] border border-[#FF5F15]/50 rounded-lg p-2 text-xs text-[#FF5F15] font-bold outline-none cursor-pointer">
                <option value="NMX-C-083-ONNCCE">NMX-C-083</option>
                <option value="ASTM C39">ASTM C39</option>
                <option value="NMX-C-156-ONNCCE">NMX-C-156</option>
                <option value="OTRA">OTRA</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
             <div className="md:col-span-2"><label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-tight">Elemento Colado</label><input type="text" value={data.elemento} onChange={e => handleChange('elemento', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg p-2 text-xs text-white" /></div>
             <div className="md:col-span-2"><label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-tight">Coordenadas (GPS)</label>
               <div className="flex gap-2">
                 <input type="text" value={data.coordinates} onChange={e => handleChange('coordinates', e.target.value)} placeholder="Ej. 21.16, -86.85" className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg p-2 text-xs text-white focus:border-[#FF5F15] outline-none" />
                 <button type="button" onClick={getCoordinates} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 rounded-lg transition-colors flex items-center justify-center border border-zinc-700"><Activity size={16} /></button>
               </div>
             </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div><label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-tight text-zinc-300">f'c Proy. (kg/cm²)</label><input type="number" value={data.resistenciaProyecto} onChange={e => handleChange('resistenciaProyecto', e.target.value)} className="w-full bg-black border border-zinc-500 rounded-lg p-2 text-sm text-white font-bold" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-tight">Revenimiento (cm)</label><input type="text" value={data.revenimiento} onChange={e => handleChange('revenimiento', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-tight">Tamaño Máximo</label><input type="text" value={data.tamanoMaximo} onChange={e => handleChange('tamanoMaximo', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg p-2 text-xs text-white" /></div>
            <div><label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-tight">Aditivo</label><input type="text" value={data.aditivo} onChange={e => handleChange('aditivo', e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg p-2 text-xs text-white" /></div>
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

      {/* ZONA DE IMPRESIÓN */}
      <div
        className="print-area"
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '980px',
          background: 'white',
          color: 'black',
        } as React.CSSProperties}
      >
        <div
          id="print-scale-wrapper-concreto"
          className="print-scale-wrapper bg-white text-black font-sans leading-none"
          style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' } as React.CSSProperties}
        >
           {renderReport()}
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
