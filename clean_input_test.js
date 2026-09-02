
function cleanPlainInput(value){
 return String(value||"")
   .normalize("NFKC")
   .replace(/[\u200B-\u200D\uFEFF]/g,"")
   .toLowerCase();
}
console.log(JSON.stringify(cleanPlainInput("TOKYO RAIN LOFI")));
console.log(JSON.stringify(cleanPlainInput("  Relaxing  Autumn — Jazz / Bossa Nova!  ")));
