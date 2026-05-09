const fs = require('fs');

let lines = fs.readFileSync('app/dashboard/tests/suelos/page.tsx', 'utf8').split('\n');

const isSavingIdx = lines.findIndex(l => l.includes('const [isSaving, setIsSaving] = useState(false);'));
if(isSavingIdx > -1) {
    lines.splice(isSavingIdx + 1, 0, '  const [showPreview, setShowPreview] = useState(false);');
}

const printStartIdx = lines.findIndex(l => l.includes('className="hidden print:block'));
const printEndIdx = lines.findIndex((l, i) => i > printStartIdx && l.includes('</div>') && lines[i+1].includes('    </div>') && lines[i+2].includes('  );'));

if (printStartIdx > -1 && printEndIdx > -1) {
    const innerPrintLines = lines.slice(printStartIdx + 1, printEndIdx + 1); 
    
    // Start searching for return (`  return (`) AFTER the isSavingIdx to make sure we're inside SuelosTestContent
    let returnIdx = lines.findIndex((l, i) => i > isSavingIdx && l.includes('  return ('));
    
    const renderReportLines = [
        '  const renderReport = () => (',
        '    <>',
        ...innerPrintLines,
        '    </>',
        '  );',
        ''
    ];
    
    lines.splice(returnIdx, 0, ...renderReportLines);
    
    const newPrintStartIdx = lines.findIndex(l => l.includes('className="hidden print:block'));
    const newPrintEndIdx = lines.findIndex((l, i) => i > newPrintStartIdx && l.includes('</div>') && lines[i+1].includes('    </div>') && lines[i+2].includes('  );'));
    
    lines.splice(newPrintStartIdx + 1, newPrintEndIdx - newPrintStartIdx, '         {renderReport()}', '      </div>');
    
    const webViewIdx = lines.findIndex(l => l.includes('<div className="max-w-[1000px] mx-auto p-6 space-y-6 print:hidden">'));
    const modalLines = [
        '      {/* MODAL VISTA PREVIA */}',
        '      {showPreview && (',
        '        <div className="fixed inset-0 z-[100] bg-black/90 flex justify-center overflow-y-auto p-4 sm:p-8 print:hidden backdrop-blur-sm">',
        '          <div className="relative bg-white text-black font-sans leading-none pt-2 shadow-2xl h-max transform scale-[0.85] sm:scale-100 origin-top" style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>',
        '             <div className="absolute -top-16 right-0 flex gap-3 bg-[#141414] p-3 rounded-2xl border border-zinc-800 shadow-xl">',
        '               <button onClick={() => setShowPreview(false)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors border border-zinc-700">Cerrar</button>',
        '               <button onClick={() => { ',
        '                 setShowPreview(false);',
        '                 setTimeout(() => {',
        '                   if (consumeCredit()) window.print();',
        '                   else alert("No tienes créditos.");',
        '                 }, 100);',
        '               }} className="bg-[#b87333] hover:bg-[#a0632a] text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors shadow-[0_0_15px_rgba(184,115,51,0.3)]"><Printer size={16}/> Imprimir PDF</button>',
        '             </div>',
        '             {renderReport()}',
        '          </div>',
        '        </div>',
        '      )}',
        ''
    ];
    lines.splice(webViewIdx, 0, ...modalLines);
    
    // Suelos has "Guardar"
    const saveBtnIdx = lines.findIndex((l, i) => i > isSavingIdx && l.includes('Guardar') && l.includes('Activity'));
    const btnClosingIdx = lines.findIndex((l, i) => i > saveBtnIdx && l.includes('</Button>'));
    
    const previewBtnLines = [
        '            <Button onClick={() => setShowPreview(true)} className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white gap-2 shadow-none border border-zinc-700">',
        '              <FileText size={20} /> Vista Previa',
        '            </Button>'
    ];
    lines.splice(btnClosingIdx + 1, 0, ...previewBtnLines);
    
    fs.writeFileSync('app/dashboard/tests/suelos/page.tsx', lines.join('\n'));
    console.log('Fixed suelos!');
} else {
    console.log('Indices not found in suelos', printStartIdx, printEndIdx);
}
