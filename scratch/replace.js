const fs = require('fs');

let content = fs.readFileSync('app/dashboard/tests/suelos/page.tsx', 'utf8');

const startIndex = content.indexOf('{/* --- VISTA DE IMPRESI');
const endIndex = content.lastIndexOf('</div>\n      </div>\n    </div>\n  );\n}');

if (startIndex !== -1 && endIndex !== -1) {
    const newPrintBlock = '{/* --- VISTA DE IMPRESION NATIVA --- */}\\n      <div className="hidden print:block bg-white text-black font-sans leading-none pt-2" style={{ printColorAdjust: \\'exact\\', WebkitPrintColorAdjust: \\'exact\\' }}>\\n         {renderReport()}\\n      </div>\\n    </div>\\n  );\\n}';
    
    // We replace the matched block
    // Note that the endIndex match length is 37
    content = content.substring(0, startIndex) + newPrintBlock.replace(/\\n/g, '\n') + content.substring(endIndex + 37);
    fs.writeFileSync('app/dashboard/tests/suelos/page.tsx', content);
    console.log('Replaced successfully');
} else {
    console.log('Could not find indices', startIndex, endIndex);
}
