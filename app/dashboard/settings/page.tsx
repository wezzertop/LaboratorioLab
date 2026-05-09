"use client";

import React, { useEffect, useState } from 'react';
import { User, ShieldCheck, Save, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    cargo: 'Técnico Laboratorista',
    license_number: '',
    company_logo_url: ''
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, cargo, license_number, company_logo_url')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          if (data) setProfile(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          cargo: profile.cargo,
          license_number: profile.license_number,
          company_logo_url: profile.company_logo_url
        })
        .eq('id', user.id);

      if (error) throw error;
      alert("Perfil actualizado correctamente. Esta información saldrá en tus reportes PDF.");
    } catch (error: any) {
      alert("Error al guardar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Cargando perfil...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#FF5F15]/20 p-3 rounded-xl text-[#FF5F15]">
          <User size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Mi Perfil</h1>
          <p className="text-zinc-500">Configura tus datos para las firmas y encabezados de los reportes.</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-8 shadow-xl">
        <form onSubmit={saveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Nombre Completo</label>
              <input 
                type="text" 
                value={profile.full_name} 
                onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
                className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-xl p-3 text-white focus:border-[#FF5F15] outline-none transition-colors"
                placeholder="Ej. Ing. Juan Pérez"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Cargo / Puesto</label>
              <input 
                type="text" 
                value={profile.cargo} 
                onChange={(e) => setProfile({...profile, cargo: e.target.value})} 
                className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-xl p-3 text-white focus:border-[#FF5F15] outline-none transition-colors"
                placeholder="Ej. Técnico Laboratorista, Jefe de Calidad..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Cédula Profesional (Opcional)</label>
              <input 
                type="text" 
                value={profile.license_number} 
                onChange={(e) => setProfile({...profile, license_number: e.target.value})} 
                className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-xl p-3 text-white focus:border-[#FF5F15] outline-none transition-colors"
                placeholder="Dejar en blanco si no aplica"
              />
            </div>
          </div>

          <div>
            <Input 
              label="URL del Logotipo de tu Laboratorio (PNG/JPG)"
              name="company_logo_url"
              value={profile.company_logo_url || ''}
              onChange={handleChange}
              placeholder="https://tudominio.com/logo.png"
            />
            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
              <ImageIcon size={12} /> Pega un enlace directo a tu logo para que aparezca en el encabezado del PDF.
            </p>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex justify-end">
            <Button type="submit" className="gap-2 shadow-[0_0_20px_rgba(255,95,21,0.4)] hover:shadow-[0_0_30px_rgba(255,95,21,0.6)]" style={{ backgroundColor: '#FF5F15' }}>
              <Save size={18} />
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </form>
      </div>

      {/* Vista previa de la Firma */}
      <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-[#FFEA00] font-bold text-sm mb-4 flex items-center gap-2">
          <ShieldCheck size={16} /> Vista Previa en Reportes
        </h3>
        <div className="bg-white p-6 rounded-lg text-black w-full max-w-[320px] text-center mx-auto shadow-inner">
          <div className="h-16 flex items-center justify-center mb-2">
            {profile.company_logo_url ? (
              <img src={profile.company_logo_url} alt="Logo" className="max-h-full" />
            ) : (
              <span className="text-gray-400 text-xs italic">Sin logotipo</span>
            )}
          </div>
          <div className="border-t-2 border-black pt-2 mt-8 mx-4">
            <p className="font-bold text-xs uppercase">{profile.full_name || 'Nombre no definido'}</p>
            <p className="text-[10px] text-gray-600">Cédula: {profile.license_number || '---'}</p>
            <p className="text-[10px] font-bold mt-1">JEFE DE LABORATORIO</p>
          </div>
        </div>
      </div>
    </div>
  );
}
