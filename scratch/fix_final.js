const fs = require('fs');

function fixAsfalto() {
    let content = fs.readFileSync('app/dashboard/tests/asfalto/page.tsx', 'utf8');
    
    content = content.replace('const [isSaving, setIsSaving] = useState(false);', 'const [isSaving, setIsSaving] = useState(false);\n  const [showPreview, setShowPreview] = useState(false);');
    
    let btnTarget = "                {isSaving ? 'Guardando...' : 'Guardar Ensaye'}\n              </Button>";
    let newBtn = btnTarget + '\n              <Button \n                onClick={() => setShowPreview(true)} \n                className="w-full md:w-auto gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 shadow-none"\n              >\n                <FileText size={20} /> Vista Previa\n              </Button>';
    content = content.replace(btnTarget, newBtn);

    let printStart = content.indexOf('<div className="hidden print:block');
    let innerStart = content.indexOf('<div className="mx-auto', printStart);
    // Find from innerStart!
    let innerEnd = content.indexOf('</div>\n    </div>\n  );\n}', innerStart);
    
    let innerContent = content.substring(innerStart, innerEnd + 6); // include the </div>
    
    let newPrintBlock = '{renderReport()}';
    content = content.substring(0, innerStart) + newPrintBlock + content.substring(innerEnd + 6);
    
    let targetReturn = '  return (\n    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans pb-20">\n\n      {/* VISTA WEB MAIN */}';
    
    let modalStr = `      {/* MODAL VISTA PREVIA */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex justify-center overflow-y-auto p-4 sm:p-8 print:hidden backdrop-blur-sm">
          <div className="relative bg-white text-black font-sans leading-none pt-2 shadow-2xl h-max transform scale-[0.85] sm:scale-100 origin-top" style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>
             <div className="absolute -top-16 right-0 flex gap-3 bg-[#141414] p-3 rounded-2xl border border-zinc-800 shadow-xl">
               <button onClick={() => setShowPreview(false)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors border border-zinc-700">Cerrar</button>
               <button onClick={() => { 
                 setShowPreview(false);
                 setTimeout(() => {
                   if (consumeCredit()) window.print();
                   else alert("No tienes créditos.");
                 }, 100);
               }} className="bg-[#FF5F15] hover:bg-[#e04f0f] text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors shadow-[0_0_15px_rgba(255,95,21,0.3)]"><Printer size={16}/> Imprimir PDF</button>
             </div>
             {renderReport()}
          </div>
        </div>
      )}\n`;
    
    let renderReportStr = `  const renderReport = () => (\n    <>\n${innerContent}\n    </>\n  );\n\n`;
    
    content = content.replace(targetReturn, renderReportStr + '  return (\n    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans pb-20">\n' + modalStr + '\n      {/* VISTA WEB MAIN */}');
    
    fs.writeFileSync('app/dashboard/tests/asfalto/page.tsx', content);
    console.log('Fixed asfalto with explicit strings!');
}

function fixSuelos() {
    let content = fs.readFileSync('app/dashboard/tests/suelos/page.tsx', 'utf8');
    
    content = content.replace('const [isSaving, setIsSaving] = useState(false);', 'const [isSaving, setIsSaving] = useState(false);\n  const [showPreview, setShowPreview] = useState(false);');
    
    let btnTarget = "              {isSaving ? <Activity className=\"animate-spin\" size={20} /> : <Save size={20} />} {isSaving ? 'Guardando...' : 'Guardar'}\n            </Button>";
    let newBtn = btnTarget + '\n            <Button onClick={() => setShowPreview(true)} className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white gap-2 shadow-none border border-zinc-700">\n              <FileText size={20} /> Vista Previa\n            </Button>';
    content = content.replace(btnTarget, newBtn);

    let printStart = content.indexOf('<div className="hidden print:block');
    let innerStart = content.indexOf('<div className="mx-auto', printStart);
    
    // In suelos, search from innerStart
    let innerEnd = content.indexOf('</div>\n      </div>\n    </div>\n  );\n}', innerStart);
    
    let innerContent = content.substring(innerStart, innerEnd + 6); // include the </div>
    
    let newPrintBlock = '{renderReport()}';
    content = content.substring(0, innerStart) + newPrintBlock + content.substring(innerEnd + 6);
    
    let targetReturn = '  return (\n    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 pb-20 font-sans">\n      <div className="max-w-[1000px] mx-auto p-6 space-y-6 print:hidden">';
    
    let modalStr = `      {/* MODAL VISTA PREVIA */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex justify-center overflow-y-auto p-4 sm:p-8 print:hidden backdrop-blur-sm">
          <div className="relative bg-white text-black font-sans leading-none pt-2 shadow-2xl h-max transform scale-[0.85] sm:scale-100 origin-top" style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>
             <div className="absolute -top-16 right-0 flex gap-3 bg-[#141414] p-3 rounded-2xl border border-zinc-800 shadow-xl">
               <button onClick={() => setShowPreview(false)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors border border-zinc-700">Cerrar</button>
               <button onClick={() => { 
                 setShowPreview(false);
                 setTimeout(() => {
                   if (consumeCredit()) window.print();
                   else alert("No tienes créditos.");
                 }, 100);
               }} className="bg-[#b87333] hover:bg-[#a0632a] text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors shadow-[0_0_15px_rgba(184,115,51,0.3)]"><Printer size={16}/> Imprimir PDF</button>
             </div>
             {renderReport()}
          </div>
        </div>
      )}\n`;
      
    let renderReportStr = `  const renderReport = () => (\n    <>\n${innerContent}\n    </>\n  );\n\n`;
    
    content = content.replace(targetReturn, renderReportStr + '  return (\n    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 pb-20 font-sans">\n' + modalStr + '      <div className="max-w-[1000px] mx-auto p-6 space-y-6 print:hidden">');
    
    fs.writeFileSync('app/dashboard/tests/suelos/page.tsx', content);
    console.log('Fixed suelos with explicit strings!');
}

fixAsfalto();
fixSuelos();
