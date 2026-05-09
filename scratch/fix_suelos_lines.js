const fs = require('fs');

const file = 'app/dashboard/tests/suelos/page.tsx';
let content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const startIndex = lines.findIndex(l => l.includes('{/* --- VISTA DE IMPRESI'));
const endIndex = lines.findIndex((l, i) => i > startIndex && l.includes('</div>') && lines[i+1].includes('</div>') && lines[i+2].includes('</div>') && lines[i+3].includes('  );'));

if (startIndex !== -1 && endIndex !== -1) {
    const newLines = [
        '      {/* --- VISTA DE IMPRESION NATIVA --- */}',
        '      <div className="hidden print:block bg-white text-black font-sans leading-none pt-2" style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>',
        '         {renderReport()}',
        '      </div>'
    ];
    lines.splice(startIndex, endIndex - startIndex + 1, ...newLines);
    fs.writeFileSync(file, lines.join('\n'));
    console.log('Replaced perfectly via lines!');
} else {
    console.log('Indices not found:', startIndex, endIndex);
}
