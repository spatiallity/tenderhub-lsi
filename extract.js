const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const tendersMatch = html.match(/const TENDERS_RAW = (\[[\s\S]*?\]);/);
const rupMatch = html.match(/const RUP_RAW = (\[[\s\S]*?\]);/);
const expertsMatch = html.match(/const EXPERTS_RAW = (\[[\s\S]*?\]);/);

function toPython(jsStr) {
    let s = jsStr.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
    s = s.replace(/ true/g, ' True').replace(/ false/g, ' False');
    s = s.replace(/:true/g, ':True').replace(/:false/g, ':False');
    return s;
}

const outStr = 
`TENDERS_RAW = ${toPython(tendersMatch[1])}

RUP_RAW = ${toPython(rupMatch[1])}

EXPERTS_RAW = ${toPython(expertsMatch[1])}
`;

fs.writeFileSync('lsi-tender-intel/backend/app/services/dummy_data.py', outStr);
console.log("Done");
