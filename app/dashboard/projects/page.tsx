"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderOpen, Plus, MapPin, Calendar, Loader2, Map, Crosshair, X } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { supabase } from '@/src/lib/supabase/client';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', client: '', location: '', coordinates: '' });

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .select(`
          id, name, location, status,
          tests ( count )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getCoordinates = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewProject(prev => ({ ...prev, coordinates: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}` }));
        },
        (error) => alert("No se pudo obtener la ubicación exacta. Asegúrate de dar permisos de GPS al navegador."),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("La geolocalización no es soportada por este navegador.");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;
    
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      const { error } = await supabase.from('projects').insert([{
        user_id: user.id,
        name: newProject.name,
        client: newProject.client,
        location: newProject.location,
        coordinates: newProject.coordinates,
        status: 'EN EJECUCI�N'
      }]);

      if (error) throw error;
      
      setIsModalOpen(false);
      setNewProject({ name: '', client: '', location: '', coordinates: '' });
      fetchProjects();
    } catch (error: any) {
      alert("Error al crear proyecto: " + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141414] border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FolderOpen className="text-[#FF5F15]" />
            Mis Proyectos
          </h1>
          <p className="text-sm sm:text-base text-zinc-500">Gestiona las licitaciones y obras asignadas a tu laboratorio.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-[#FF5F15] hover:bg-[#e04f0f] shadow-[0_0_20px_rgba(255,95,21,0.3)] gap-2">
          <Plus size={18} /> Nuevo Proyecto
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-[#FF5F15]">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center p-12 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-500">
          No tienes proyectos. Crea uno nuevo para comenzar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => (
          <div key={p.id} className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-6 hover:border-[#FF5F15]/50 transition-colors group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${p.status === 'EN EJECUCI�N' ? 'bg-[#2BD45A]/10 text-[#2BD45A] border border-[#2BD45A]/20' : 'bg-zinc-800 text-zinc-500'}`}>
                {p.status}
              </div>
              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-[#FF5F15]/10 group-hover:text-[#FF5F15] transition-colors">
                <FolderOpen size={14} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 leading-tight">{p.name}</h3>
            <div className="space-y-2 mt-4 text-xs text-zinc-500 font-medium">
              <p className="flex items-center gap-2"><MapPin size={14} /> {p.location || 'Sin ubicación'}</p>
              <p className="flex items-center gap-2"><Calendar size={14} /> Ensayes: <span className="text-white font-bold">{p.tests?.[0]?.count || 0}</span></p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-zinc-800 flex gap-2">
              <Link href={`/dashboard/projects/${p.id}`} className="flex-1 text-center py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors border border-zinc-800 hover:border-[#FF5F15]/30">
                Abrir Carpeta
              </Link>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* --- MODAL CREAR PROYECTO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><FolderOpen className="text-[#FF5F15]" /> Nueva Licitación / Proyecto</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1 font-bold">NOMBRE DE LA OBRA O TRAMO *</label>
                <input required type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full bg-[#141414] border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#FF5F15] outline-none transition-colors" placeholder="Ej. Pavimentación Av. Principal" />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1 font-bold">CLIENTE O DEPENDENCIA</label>
                <input type="text" value={newProject.client} onChange={e => setNewProject({...newProject, client: e.target.value})} className="w-full bg-[#141414] border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#FF5F15] outline-none transition-colors" placeholder="Ej. Secretaría de Infraestructura (SCT)" />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1 font-bold">DESCRIPCI�N DE UBICACI�N</label>
                <input type="text" value={newProject.location} onChange={e => setNewProject({...newProject, location: e.target.value})} className="w-full bg-[#141414] border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#FF5F15] outline-none transition-colors" placeholder="Ej. Km 12+000 al 14+500, Cancún Q. Roo." />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1 font-bold">COORDENADAS GPS (OPCIONAL)</label>
                <div className="flex gap-2">
                  <input type="text" value={newProject.coordinates} onChange={e => setNewProject({...newProject, coordinates: e.target.value})} className="flex-1 bg-[#141414] border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#FF5F15] outline-none transition-colors" placeholder="Ej. 21.1619, -86.8515" />
                  <button type="button" onClick={getCoordinates} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 rounded-xl transition-colors flex items-center justify-center border border-zinc-700" title="Obtener mi ubicación actual">
                    <Crosshair size={20} />
                  </button>
                </div>
                <p className="text-[9px] text-zinc-600 mt-1">Presiona el icono del objetivo estando físicamente en el banco o la obra para fijar el GPS.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-transparent border border-zinc-700 hover:bg-zinc-800 text-white">Cancelar</Button>
                <Button type="submit" disabled={isCreating} className="flex-1 bg-[#FF5F15] hover:bg-[#e04f0f] shadow-[0_0_20px_rgba(255,95,21,0.3)]">
                  {isCreating ? <Loader2 className="animate-spin" /> : 'Crear Proyecto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
