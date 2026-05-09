const fs = require('fs');

function fixFile(file) {
    let lines = fs.readFileSync(file, 'utf8').split('\n');

    const isSavingIdx = lines.findIndex(l => l.includes('const [isSaving, setIsSaving] = useState(false);'));
    if(isSavingIdx > -1) {
        lines.splice(isSavingIdx + 1, 0, '  const [showPreview, setShowPreview] = useState(false);');
    }

    const printStartIdx = lines.findIndex(l => l.includes('className="hidden print:block'));
    const printEndIdx = lines.findIndex((l, i) => i > printStartIdx && l.includes('</div>') && lines[i+1] && lines[i+1].includes('    </div>') && lines[i+2] && lines[i+2].includes('  );'));

    if (printStartIdx > -1 && printEndIdx > -1) {
        const innerPrintLines = lines.slice(printStartIdx + 1, printEndIdx); 
        
        // This is inside the TestContent component
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
        
        lines.splice(newPrintStartIdx + 1, newPrintEndIdx - (newPrintStartIdx + 1), '         {renderReport()}');
        
        // Find the returnIdx again, because it shifted down due to renderReportLines
        let newReturnIdx = lines.findIndex((l, i) => i > isSavingIdx && l.includes('  return ('));
        
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
            '               }} className="bg-[#FF5F15] hover:bg-[#e04f0f] text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors shadow-[0_0_15px_rgba(255,95,21,0.3)]"><Printer size={16}/> Imprimir PDF</button>',
            '             </div>',
            '             {renderReport()}',
            '          </div>',
            '        </div>',
            '      )}',
            ''
        ];
        
        if (file.includes('suelos')) {
            modalLines[8] = modalLines[8].replace('bg-[#FF5F15]', 'bg-[#b87333]').replace('hover:bg-[#e04f0f]', 'hover:bg-[#a0632a]').replace('rgba(255,95,21,0.3)', 'rgba(184,115,51,0.3)');
        }

        // Insert modal inside the first top-level div of the return block
        // The return block is typically `return (\n <div...>\n`
        lines.splice(newReturnIdx + 2, 0, ...modalLines);
        
        const saveBtnIdx = lines.findIndex((l, i) => i > isSavingIdx && (l.includes('Guardar Ensaye') || (l.includes('Guardar') && l.includes('Activity'))));
        const btnClosingIdx = lines.findIndex((l, i) => i > saveBtnIdx && l.includes('</Button>'));
        
        const previewBtnLines = [
            '              <Button ',
            '                onClick={() => setShowPreview(true)} ',
            file.includes('asfalto') ? '                className="w-full md:w-auto gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 shadow-none"' : '                className="w-full sm:w-auto gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 shadow-none"',
            '              >',
            '                <FileText size={20} /> Vista Previa',
            '              </Button>'
        ];
        lines.splice(btnClosingIdx + 1, 0, ...previewBtnLines);
        
        fs.writeFileSync(file, lines.join('\n'));
        console.log('Fixed', file);
    } else {
        console.log('Indices not found in', file, printStartIdx, printEndIdx);
    }
}

fixFile('app/dashboard/tests/asfalto/page.tsx');
fixFile('app/dashboard/tests/suelos/page.tsx');
