"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HardHat, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { supabase } from '@/src/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isRegister) {
        // Registro de usuario
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        
        if (error) throw error;
        alert("¡Registro exitoso! Ya puedes iniciar sesión.");
        setIsRegister(false);
      } else {
        // Inicio de sesión
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        router.push('/dashboard/projects');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Elementos de fondo decorativos */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF5F15]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FF5F15]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-8 shadow-2xl z-10 relative">
        <div className="flex justify-center mb-6">
          <div className="bg-[#FF5F15] p-4 rounded-2xl text-white shadow-[0_0_30px_rgba(255,95,21,0.5)]">
            <HardHat size={32} />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">CIVIL-LAB</h1>
          <p className="text-zinc-500 text-sm">{isRegister ? 'Crea tu cuenta de laboratorista.' : 'Acceso exclusivo para Laboratoristas.'}</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegister && (
            <div>
              <Input 
                type="text" 
                placeholder="Juan Pérez" 
                label="Nombre Completo" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <Input 
              type="email" 
              placeholder="tu@laboratorio.com" 
              label="Correo Electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input 
              type="password" 
              placeholder="⬢⬢⬢⬢⬢⬢⬢⬢" 
              label="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" fullWidth className="mt-4 gap-2 text-lg shadow-[0_0_20px_rgba(255,95,21,0.4)] hover:shadow-[0_0_30px_rgba(255,95,21,0.6)]" style={{ backgroundColor: '#FF5F15' }}>
            {loading ? 'Procesando...' : (isRegister ? 'Crear Cuenta' : 'Entrar a Campo')} 
            {isRegister ? <UserPlus size={20} /> : <LogIn size={20} />}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500">
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'} {' '}
            <button 
              onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }} 
              className="text-[#FF5F15] hover:underline font-bold"
            >
              {isRegister ? 'Iniciar Sesión' : 'Regístrate aquí'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
