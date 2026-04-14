const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync('src/pages/Landing.jsx', 'utf8');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('parsed ok');
} catch (e) {
  console.error(e.message);
  console.error('line', e.loc && e.loc.line, 'column', e.loc && e.loc.column);
}
