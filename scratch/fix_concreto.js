const fs = require('fs');
let content = fs.readFileSync('app/dashboard/tests/concreto/page.tsx', 'utf8');

const startTag = '{/* --- VISTA DE IMPRESI';
const startIndex = content.indexOf(startTag);

// Find the last div matching before the return
const afterStart = content.substring(startIndex);
const endMatch = '</div>\n      </div>\n    </div>\n  );\n}';
const endIndex = content.lastIndexOf(endMatch);

if(startIndex > -1 && endIndex > -1) {
  const replacement = `{/* --- VISTA DE IMPRESION NATIVA --- */}
      <div className="hidden print:block bg-white text-black font-sans leading-none pt-2" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
         {renderReport()}
      </div>
    </div>
  );
}`;
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex + endMatch.length);
  fs.writeFileSync('app/dashboard/tests/concreto/page.tsx', content);
  console.log('Replaced correctly');
} else {
  console.log('Indexes not found', startIndex, endIndex);
}
