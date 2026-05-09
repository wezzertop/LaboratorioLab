import Link from 'next/link';
import { HardHat, ArrowRight, Activity, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      <header className="p-6 flex justify-between items-center border-b border-zinc-800 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <HardHat className="text-[#FF5F15]" size={28} />
          <span className="text-2xl font-bold tracking-tight">CIVIL-LAB</span>
        </div>
        <nav>
          <Link href="/login" className="px-6 py-2.5 bg-[#141414] border border-zinc-800 rounded-full font-bold hover:bg-zinc-800 transition-colors">
            Ingresar al Sistema
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-4 max-w-5xl mx-auto mt-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#FF5F15]/10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF5F15]/10 border border-[#FF5F15]/30 text-[#FF5F15] font-semibold text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-[#FF5F15] animate-pulse"></span>
          El estándar en control de calidad de obra
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">
          Revoluciona tus Ensayes<br/>de Laboratorio.
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl">
          CIVIL-LAB es el SaaS moderno para técnicos de campo. Genera formatos FCC-11 y evalúa normas inteligentemente en tiempo real, desde tu tablet o celular.
        </p>

        <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF5F15] text-white rounded-xl font-bold text-lg hover:bg-[#e04f0f] transition-all shadow-[0_0_30px_rgba(255,95,21,0.4)] hover:scale-105 active:scale-95">
          Empezar Ahora <ArrowRight />
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-32">
          <div className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-3xl text-left hover:border-[#FF5F15] transition-colors">
            <div className="w-12 h-12 bg-[#FF5F15]/20 flex items-center justify-center rounded-xl mb-6 text-[#FF5F15]">
              <Activity size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Evaluador Inteligente</h3>
            <p className="text-zinc-500 text-sm">El motor evalúa límites (ej: 30 MAX, 50 MIN) contra tus resultados en tiempo real.</p>
          </div>
          
          <div className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-3xl text-left hover:border-[#2BD45A] transition-colors">
            <div className="w-12 h-12 bg-[#2BD45A]/20 flex items-center justify-center rounded-xl mb-6 text-[#2BD45A]">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Auditoría y Firmas</h3>
            <p className="text-zinc-500 text-sm">Perfiles personalizados con cédula profesional y logotipos integrados en cada PDF.</p>
          </div>

          <div className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-3xl text-left hover:border-[#FFEA00] transition-colors">
            <div className="w-12 h-12 bg-[#FFEA00]/20 flex items-center justify-center rounded-xl mb-6 text-[#FFEA00]">
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Cualquier Prueba</h3>
            <p className="text-zinc-500 text-sm">Asfalto, Concreto, Mecánica de Suelos. Todo bajo una arquitectura modular y sólida.</p>
          </div>
        </div>
      </main>
    </div>
  );
}