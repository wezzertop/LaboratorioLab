"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import { FolderOpen, ArrowLeft, Plus, FileText, Loader2, Beaker, Layers, Truck, MapPin, Map, User, Edit, Trash2, X, Crosshair, Calendar } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapWidget = dynamic(() => import('@/src/components/ui/MapWidget'), { ssr: false });

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', client: '', location: '', coordinates: '' });

  const fetchProjectDetails = async () => {
    try {
      const { data: projectData, error: pError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id as string)
        .single();
        
      if (pError) throw pError;
      setProject(projectData);
      setEditData({
         name: projectData.name || '',
         client: projectData.client || '',
         location: projectData.location || '',
         coordinates: projectData.coordinates || ''
      });

      const { data: testData, error: tError } = await supabase
        .from('tests')
        .select('*')
        .eq('project_id', params.id as string)
        .order('created_at', { ascending: false });
        
      if (tError) throw tError;
      setTests(testData || []);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [params.id]);

  const handleNewTest = (type: string) => {
    router.push(`/dashboard/tests/${type}?projectId=${params.id}`);
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que deseas eliminar esta obra y todos sus ensayes? Esta acción no se puede deshacer.")) return;
    try {
       await supabase.from('projects').delete().eq('id', params.id as string);
       router.push('/dashboard/projects');
    } catch(error: any) {
       alert(error.message); 
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('projects').update(editData).eq('id', params.id as string);
      setIsEditing(false);
      fetchProjectDetails();
    } catch(error: any) { 
      alert(error.message); 
    }
  };

  const getCoordinates = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEditData(prev => ({ ...prev, coordinates: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}` }));
        },
        (error) => alert("No se pudo obtener la ubicación exacta. Asegúrate de dar permisos de GPS al navegador."),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("La geolocalización no es soportada por este navegador.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px] text-[#FF5F15]">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center text-zinc-500">
        Proyecto no encontrado.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 bg-[#141414] border border-zinc-800 p-4 sm:p-6 rounded-3xl shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button onClick={() => router.push('/dashboard/projects')} className="text-zinc-500 hover:text-white transition-colors shrink-0 p-1">
              <ArrowLeft size={22} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-white flex items-center gap-2 leading-tight">
                <FolderOpen className="text-[#FF5F15] shrink-0" size={24} />
                <span className="truncate">{project.name}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-medium mt-1">
                {project.client && <span className="flex items-center gap-1"><User size={12}/> {project.client}</span>}
                {project.location && <span className="flex items-center gap-1"><MapPin size={12}/> {project.location}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-1 bg-[#2BD45A]/10 text-[#2BD45A] border border-[#2BD45A]/20 rounded-full text-[9px] font-bold tracking-wider hidden sm:inline-flex">
              {project.status}
            </span>
            <button onClick={() => setIsEditing(true)} className="p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-colors border border-zinc-800 hover:border-[#FF5F15]/30" title="Editar Proyecto">
              <Edit size={16} />
            </button>
            <button onClick={handleDelete} className="p-2 bg-zinc-900 hover:bg-red-900/50 text-red-500 rounded-lg transition-colors border border-zinc-800 hover:border-red-500/30" title="Eliminar Proyecto">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* MAPA INTERACTIVO (Si hay coordenadas o ensayes con coordenadas) */}
      {(project.coordinates || tests.some(t => t.data?.coordinates)) && (
         <MapWidget projectCoords={project.coordinates} projectName={project.name} tests={tests} />
      )}

      {/* NUEVOS ENSAYES */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => handleNewTest('asfalto')} className="flex-1 bg-[#141414] hover:bg-[#1a1a1a] border border-zinc-800 hover:border-[#FF5F15]/50 p-4 rounded-2xl flex items-center justify-center gap-3 transition-colors text-white font-bold group">
          <Truck className="text-zinc-500 group-hover:text-[#FF5F15]" /> + Asfalto
        </button>
        <button onClick={() => handleNewTest('concreto')} className="flex-1 bg-[#141414] hover:bg-[#1a1a1a] border border-zinc-800 hover:border-[#FF5F15]/50 p-4 rounded-2xl flex items-center justify-center gap-3 transition-colors text-white font-bold group">
          <Beaker className="text-zinc-500 group-hover:text-[#FF5F15]" /> + Concreto
        </button>
        <button onClick={() => handleNewTest('suelos')} className="flex-1 bg-[#141414] hover:bg-[#1a1a1a] border border-zinc-800 hover:border-[#FF5F15]/50 p-4 rounded-2xl flex items-center justify-center gap-3 transition-colors text-white font-bold group">
          <Layers className="text-zinc-500 group-hover:text-[#FF5F15]" /> + Suelos
        </button>
      </div>

      {/* HISTORIAL */}
      <div className="bg-[#141414] border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FileText className="text-[#FF5F15]" /> Historial de Ensayes
        </h2>
        
        {tests.length === 0 ? (
          <div className="text-center p-12 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-500">
            Aún no hay ensayes registrados en este proyecto.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map(test => (
              <Link href={`/dashboard/tests/${test.test_type}?projectId=${project.id}&testId=${test.id}`} key={test.id} className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-4 hover:border-[#FF5F15]/50 transition-colors group">
                 <div className="flex justify-between items-start mb-2">
                   <div className={`px-2 py-1 rounded-full text-[9px] font-bold tracking-wider ${test.status === 'FINALIZADO' ? 'bg-[#2BD45A]/10 text-[#2BD45A] border border-[#2BD45A]/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                     {test.status || 'EN PROCESO'}
                   </div>
                   <span className="text-[10px] text-zinc-500 uppercase font-bold">{test.test_type}</span>
                 </div>
                 <h3 className="text-sm font-bold text-white leading-tight mb-2">{test.name}</h3>
                 <p className="text-[10px] text-zinc-500 flex items-center gap-1"><Calendar size={12}/> {new Date(test.created_at).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* MODAL EDITAR PROYECTO */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Edit className="text-[#FF5F15]" /> Editar Proyecto</h2>
              <button onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1 font-bold">NOMBRE DE LA OBRA O TRAMO *</label>
                <input required type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-[#141414] border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#FF5F15] outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1 font-bold">CLIENTE O DEPENDENCIA</label>
                <input type="text" value={editData.client} onChange={e => setEditData({...editData, client: e.target.value})} className="w-full bg-[#141414] border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#FF5F15] outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1 font-bold">DESCRIPCIÓN DE UBICACIÓN</label>
                <input type="text" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} className="w-full bg-[#141414] border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#FF5F15] outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1 font-bold">COORDENADAS GPS</label>
                <div className="flex gap-2">
                  <input type="text" value={editData.coordinates} onChange={e => setEditData({...editData, coordinates: e.target.value})} className="flex-1 bg-[#141414] border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#FF5F15] outline-none transition-colors" />
                  <button type="button" onClick={getCoordinates} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 rounded-xl flex items-center justify-center border border-zinc-700" title="Obtener mi ubicación actual">
                    <Crosshair size={20} />
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 rounded-xl bg-transparent border border-zinc-700 hover:bg-zinc-800 text-white font-bold transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-[#FF5F15] hover:bg-[#e04f0f] text-white font-bold shadow-[0_0_20px_rgba(255,95,21,0.3)] transition-all">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
