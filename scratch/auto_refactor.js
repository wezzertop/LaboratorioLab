const fs = require('fs');

function refactorFile(filepath, saveBtnText) {
    let content = fs.readFileSync(filepath, 'utf8');

    // 1. Add showPreview state
    content = content.replace('const [isSaving, setIsSaving] = useState(false);', 'const [isSaving, setIsSaving] = useState(false);\n  const [showPreview, setShowPreview] = useState(false);');

    // 2. Add Preview button right after Save button
    // This looks for the Save button based on the saveBtnText
    let btnIndex = content.indexOf('<Button onClick={handleSave}');
    if (btnIndex === -1) {
        btnIndex = content.indexOf('<Button \n                onClick={handleSave}'); // asfalto format
    }
    if (btnIndex !== -1) {
        let btnEnd = content.indexOf('</Button>', btnIndex) + 9;
        let originalBtn = content.substring(btnIndex, btnEnd);
        let replacementBtn = '<Button onClick={() => setShowPreview(true)} className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white gap-2 shadow-none border border-zinc-700">\\n              <FileText size={20} /> Vista Previa\\n            </Button>\\n            ' + originalBtn;
        
        // for asfalto styling
        if (filepath.includes('asfalto')) {
            replacementBtn = originalBtn + '\\n              <Button onClick={() => setShowPreview(true)} className="w-full md:w-auto gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 shadow-none">\\n                <FileText size={20} /> Vista Previa\\n              </Button>';
        }
        
        content = content.substring(0, btnIndex) + replacementBtn.replace(/\\n/g, '\n') + content.substring(btnEnd);
    }

    // 3. Extract print block
    // asfalto uses {/* =========================================\n          VISTA DE IMPRESIÓN (PDF PIXEL PERFECT)\n          ========================================= */}
    // suelos uses {/* --- VISTA DE IMPRESI N --- */}
    
    let printStart = content.indexOf('VISTA DE IMPRESI');
    if (printStart !== -1) {
        // find the actual div class="hidden print:block
        let divStart = content.indexOf('<div className="hidden print:block', printStart);
        let innerDivStart = content.indexOf('<div className="mx-auto', divStart);
        
        // Find the end of the return statement
        let lastClosingDiv = content.lastIndexOf('</div>');
        // Let's find the end of the print block precisely.
        // In the original file, the print block is the last element before the final `    </div>\n  );\n}`
        let finalReturnClose = content.lastIndexOf('  );\n}');
        // The print block ends right before that.
        let printBlockContentEnd = content.lastIndexOf('</div>', finalReturnClose - 20) + 6; 
        
        // Wait, for asfalto, there are two outer divs inside print:block.
        // Let's just find the closing tag of the `hidden print:block` div.
        let printBlockContentStart = innerDivStart;
        let outerDivClosing = content.lastIndexOf('</div>', content.lastIndexOf('</div>', finalReturnClose - 10) - 10);
        if (filepath.includes('asfalto')) {
             outerDivClosing = content.indexOf('      </div>\n    </div>\n  );\n}');
        } else if (filepath.includes('suelos')) {
             outerDivClosing = content.indexOf('      </div>\n    </div>\n  );\n}');
        }

        let innerContent = content.substring(innerDivStart, outerDivClosing);
        
        // Replace innerContent inside the file with {renderReport()}
        content = content.substring(0, innerDivStart) + '\n         {renderReport()}\n' + content.substring(outerDivClosing);

        // Prepare renderReport block
        let renderReportStr = `  const renderReport = () => (\n    <>\n${innerContent}\n    </>\n  );\n\n`;
        
        // Prepare Modal block
        let modalStr = `      {/* MODAL VISTA PREVIA */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex justify-center overflow-y-auto p-4 sm:p-8 print:hidden backdrop-blur-sm">
          <div className="relative bg-white text-black font-sans leading-none pt-2 shadow-2xl h-max transform scale-[0.85] sm:scale-100 origin-top" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
             <div className="absolute -top-16 right-0 flex gap-3 bg-[#141414] p-3 rounded-2xl border border-zinc-800 shadow-xl">
               <button onClick={() => setShowPreview(false)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors border border-zinc-700">Cerrar</button>
               <button onClick={() => { 
                 setShowPreview(false);
                 setTimeout(() => {
                   if (consumeCredit()) window.print();
                   else alert("No tienes créditos. Por favor recarga para imprimir este reporte.");
                 }, 100);
               }} className="bg-[#FF5F15] hover:bg-[#e04f0f] text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors shadow-[0_0_15px_rgba(255,95,21,0.3)]"><Printer size={16}/> Imprimir PDF</button>
             </div>
             {renderReport()}
          </div>
        </div>
      )}\n\n`;

        // Inject before return (
        let returnIndex = content.indexOf('  return (\n    <div className="min-h-screen');
        if (returnIndex !== -1) {
            content = content.substring(0, returnIndex) + renderReportStr + content.substring(returnIndex);
            
            // Inject modal after min-h-screen div
            let divEnd = content.indexOf('>', returnIndex + 20) + 1;
            content = content.substring(0, divEnd) + '\n' + modalStr + content.substring(divEnd);
        }
    }
    
    fs.writeFileSync(filepath, content);
    console.log('Processed', filepath);
}

refactorFile('app/dashboard/tests/asfalto/page.tsx', 'Guardar');
refactorFile('app/dashboard/tests/suelos/page.tsx', 'Guardar');
