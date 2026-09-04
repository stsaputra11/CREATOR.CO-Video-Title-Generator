
function primaryUseCase(useValue){
 return String(useValue||"");
}


const $=id=>document.getElementById(id);
let state={keywords:[],moods:[],atmos:[],emotions:[],titles:[],keywordSeed:0,atmosSeed:0};

const presets={
  lofi:["rainy {x}","{x} ambience","{x} study music","relaxing {x}","{x} night vibes","cozy {x}","{x} beats","{x} background music","chill {x}"],
  jazz:["{x} jazz ambience","relaxing {x} jazz","{x} cafe jazz","smooth {x}","{x} night jazz","cozy {x} jazz","{x} background jazz","soft {x} jazz","calm {x} music"],
  piano:["{x} piano music","relaxing {x} piano","peaceful {x} melody","{x} study piano","soft {x} piano","calm {x} music","{x} background piano","emotional {x} piano","gentle {x} melody"],
  sleep:["{x} sleep music","calming {x}","gentle {x}","soothing {x}","{x} bedtime music","peaceful {x}","relaxing {x}","soft {x} melody","{x} deep sleep"],
  edm:["{x} mix","{x} electronic music","melodic {x}","{x} night drive","energetic {x}","{x} focus mix","atmospheric {x}","{x} playlist","deep {x}"]
};
const atmoTemplates=[
 "soft {core} and distant city lights","quiet {core} beneath a glowing skyline","gentle {core} around a peaceful room",
 "warm ambience with soft evening lights","calm night air and distant urban sounds","cozy window ambience above the city",
 "muted lights and a slow peaceful atmosphere","quiet streets wrapped in soft ambient light","deep nighttime calm with distant sounds",
 "a peaceful escape into soft atmospheric vibes","gentle background ambience for an unhurried night","dreamy lights and a quiet cinematic mood",
 "soft shadows and tranquil late-night ambience","a calm space filled with gentle ambient detail","slow city ambience under muted evening lights"
];


function cleanCore(k){
 return String(k||"")
   .toLowerCase()
   .replace(/[^\w\s-]/g," ")
   .replace(/\b(lofi|jazz|bossa nova|dark piano|dark academia|guitar|acoustic|piano|baby lullaby|gentle lullaby|music box|tibetan flute|deep house|techno edm|techno melodic)\b/g," ")
   .replace(/\s+/g," ")
   .trim();
}
function titleCase(s){return s.replace(/\w\S*/g,w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase())}
function unique(arr){return [...new Set(arr.map(x=>x.trim()).filter(Boolean))]}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function rotateArray(arr,seed){
 const a=[...arr];
 if(!a.length)return a;
 const n=((seed%a.length)+a.length)%a.length;
 return a.slice(n).concat(a.slice(0,n));
}

const stopTokens = new Set(["the","a","an","for","with","and","of","in","on","to"]);
const semanticGroups = [
 ["rain","rainy","rainfall","drizzle","showers"],
 ["sleep","sleeping","bedtime"],
 ["calm","calming","peaceful","relaxing","soothing"],
 ["night","nighttime","midnight"],
 ["music","melody","melodies","beats","sound","sounds","audio"],
 ["ambience","ambient","atmosphere","vibes","mood"],
 ["cozy","warm","comforting"],
 ["study","focus","work","productivity"],
 ["smooth","soft","gentle","mellow"]
];

function normalizePhrase(s){
 return String(s||"")
   .toLowerCase()
   .replace(/[^\w\s-]/g," ")
   .replace(/\s+/g," ")
   .trim();
}

function singularToken(t){
 if(t.endsWith("ies") && t.length>4) return t.slice(0,-3)+"y";
 if(t.endsWith("s") && !t.endsWith("ss") && t.length>3) return t.slice(0,-1);
 return t;
}

function canonicalToken(t){
 const token=singularToken(t.toLowerCase());
 for(const group of semanticGroups){
   if(group.includes(token)) return group[0];
 }
 return token;
}

function tokenSignature(s){
 return normalizePhrase(s)
   .split(" ")
   .filter(Boolean)
   .filter(t=>!stopTokens.has(t))
   .map(canonicalToken);
}

function hasDuplicateMeaningWords(s){
 const toks=tokenSignature(s);
 const counts={};
 for(const t of toks){ counts[t]=(counts[t]||0)+1; }
 return Object.values(counts).some(n=>n>1);
}

function hasAdjacentDuplicate(s){
 const toks=normalizePhrase(s).split(" ").filter(Boolean);
 for(let i=1;i<toks.length;i++){
   if(canonicalToken(toks[i])===canonicalToken(toks[i-1])) return true;
 }
 return false;
}


function uniqueCanonicalTokens(tokens){
 const out=[];
 const seen=new Set();
 for(const t of tokens){
   const c=canonicalToken(t);
   if(!seen.has(c)){
     seen.add(c);
     out.push(t);
   }
 }
 return out;
}

function stripRepeatedConcepts(text){
 let toks=normalizePhrase(text).split(" ").filter(Boolean);
 toks=uniqueCanonicalTokens(toks);
 return toks.join(" ").trim();
}


function phraseSimilarity(a,b){
 const A=new Set(tokenSignature(a)), B=new Set(tokenSignature(b));
 if(!A.size || !B.size) return 0;
 let inter=0; for(const x of A) if(B.has(x)) inter++;
 const union=new Set([...A,...B]).size;
 return inter/union;
}

function isNaturalKeyword(s){
 const p=normalizePhrase(s);
 if(!p || p.split(" ").length<2) return false;
 if(hasAdjacentDuplicate(p) || hasDuplicateMeaningWords(p)) return false;
 if(/\b(rainy rain|rain rain|smooth smooth|sleep rain sleep|music music|beats beats|night night|calm relaxing|relaxing calm)\b/.test(p)) return false;
 return true;
}


function normalizeKeywordKey(value){
 return String(value||"")
   .normalize("NFKC")
   .toLowerCase()
   .replace(/[^\p{L}\p{N}\s]/gu," ")
   .replace(/\s+/g," ")
   .trim();
}





const ACTIVITY_CONTEXT_GROUPS={
 sleep:["sleep","sleeping","deep sleep","fall asleep","bedtime"],
 focus:["focus","focused","deep focus","concentration","concentrate"],
 study:["study","studying","reading","writing"],
 work:["work","working","productivity","productive"]
};

const INCOMPATIBLE_ACTIVITY_CONTEXTS=[
 ["sleep","focus"],
 ["sleep","study"],
 ["sleep","work"]
];

function normalizeActivityContext(value){
 return String(value||"")
   .normalize("NFKC")
   .toLowerCase()
   .replace(/[_–—-]+/g," ")
   .replace(/\s+/g," ")
   .trim();
}

function phraseHasActivityContext(text,groupName){
 const normalized=" "+normalizeActivityContext(text)+" ";
 return (ACTIVITY_CONTEXT_GROUPS[groupName]||[]).some(term=>
   normalized.includes(" "+normalizeActivityContext(term)+" ")
 );
}

function hasOpposingActivityContexts(text){
 return INCOMPATIBLE_ACTIVITY_CONTEXTS.some(([a,b])=>
   phraseHasActivityContext(text,a) && phraseHasActivityContext(text,b)
 );
}

function addCandidate(list,candidate,selectedNiche,baseCore="",mainKeyword=""){
 let c=stripRepeatedConcepts(candidate);
 c=normalizePhrase(c);
 if(baseCore){
   const baseTokens=tokenSignature(baseCore);
   const candTokens=normalizePhrase(c).split(" ").filter(Boolean);
   const filtered=[];
   const seenBase=new Set(baseTokens);
   for(const t of candTokens){
     const canon=canonicalToken(t);
     if(filtered.some(x=>canonicalToken(x)===canon)) continue;
     filtered.push(t);
   }
   c=filtered.join(" ").trim();
 }

 const candidateKey=normalizeKeywordKey(c);
 const mainKey=normalizeKeywordKey(mainKeyword);

 if(!candidateKey) return;
 if(hasOpposingActivityContexts(c)) return;
 if(mainKey && candidateKey===mainKey) return;
 if(!isNaturalKeyword(c)) return;
 if(selectedNiche && containsOtherNicheTerm(c,selectedNiche)) return;

 // Hard uniqueness guard after normalization.
 if(list.some(x=>normalizeKeywordKey(x)===candidateKey)) return;

 // Keep the existing semantic-near-duplicate guard too.
 if(list.some(x=>phraseSimilarity(x,c)>=0.82)) return;

 list.push(c);
}




function cleanPlainInput(value){
 return String(value||"")
   .normalize("NFKC")
   .replace(/[\u200B-\u200D\uFEFF]/g,"")
   .toLowerCase();
}

function bindCleanTextInput(id){
 const el=$(id);
 if(!el)return;

 // Lowercase while typing, but preserve spaces, punctuation, symbols, and caret position.
 el.addEventListener("input",()=>{
   const start=typeof el.selectionStart==="number"?el.selectionStart:el.value.length;
   const end=typeof el.selectionEnd==="number"?el.selectionEnd:el.value.length;
   const cleaned=cleanPlainInput(el.value);
   if(el.value!==cleaned){
     el.value=cleaned;
     try{el.setSelectionRange(start,end);}catch(e){}
   }
 });

 // Force pasted content to plain text only, without stripping spaces or other characters.
 el.addEventListener("paste",(e)=>{
   if(!e.clipboardData)return;
   e.preventDefault();

   const text=cleanPlainInput(e.clipboardData.getData("text/plain"));
   const start=typeof el.selectionStart==="number"?el.selectionStart:el.value.length;
   const end=typeof el.selectionEnd==="number"?el.selectionEnd:el.value.length;

   el.value=el.value.slice(0,start)+text+el.value.slice(end);

   const cursor=start+text.length;
   try{el.setSelectionRange(cursor,cursor);}catch(err){}
   el.dispatchEvent(new Event("input",{bubbles:true}));
 });
}

function getSelectedAtmosphereOptions(){
 return Array.from(document.querySelectorAll(".atmo-option:checked")).map(x=>x.value);
}
function updateAtmosphereSelectionUI(){
 const all=Array.from(document.querySelectorAll(".atmo-option"));
 const selected=all.filter(x=>x.checked);
 const count=$("atmoCount");
 if(count) count.textContent=`${selected.length} / 5 selected`;
 all.forEach(cb=>{ cb.disabled=!cb.checked && selected.length>=5; });
}

function validate(){
 const selectedAtmos=getSelectedAtmosphereOptions();
 const vals={
   cluster:cleanPlainInput($("cluster").value),
   main:cleanPlainInput($("mainKeyword").value),
   niche:$("niche").value,
   use:$("useCase").value,
   atmosphereOptions:selectedAtmos
 };
 const missing=[];
 if(!vals.cluster)missing.push("Topic Cluster");
 if(!vals.main)missing.push("Main Keyword");
 if(!vals.niche)missing.push("Niche");
 if(!vals.use)missing.push("Use Case");
 if(missing.length){
   showWarn("Please complete: "+missing.join(", ")+".");
   return null;
 }
 if(selectedAtmos.length<1){
   showWarn("Please select at least 1 Atmosphere / Vibes option.");
   return null;
 }
 if(selectedAtmos.length>5){
   showWarn("Please select a maximum of 5 Atmosphere / Vibes options.");
   return null;
 }
 $("warning").style.display="none";
 return vals;
}

function showWarn(t){
 $("warning").textContent=t;
 $("warning").style.display="block";
}



const NICHE_GROUPS = {
 "Lofi Hiphop / Lofi Chill / Lofi Beats / Chillbeats":["lofi"],
 "Jazz / Bossa Nova":["jazz","bossa nova","bossa"],
 "Dark Piano / Dark Academia":["dark piano","dark academia"],
 "Guitar / Acoustic":["guitar","acoustic"],
 "Gentle Piano / Healing Piano / Calming Piano":["piano"],
 "Baby Lullaby / Gentle Lullaby / Lullaby Piano / Lullaby Music Box":["baby lullaby","gentle lullaby","music box","lullaby"],
 "Tibetan Flute / Calm Flute / Gentle Flute":["tibetan flute"],
 "Deep House / Techno EDM / Techno Melodic":["deep house","techno edm","edm","techno melodic","melodic techno"]
};

function selectedNicheTerms(selectedNiche){
 return NICHE_GROUPS[selectedNiche] || [normalizePhrase(selectedNiche)];
}

function removeOtherNicheTerms(text, selectedNiche){
 let s=normalizePhrase(text);
 const allowed=new Set(selectedNicheTerms(selectedNiche));
 for(const [group,terms] of Object.entries(NICHE_GROUPS)){
   if(group===selectedNiche) continue;
   for(const term of terms){
     const rg=new RegExp("\\b"+term.replace(/\s+/g,"\\s+")+"\\b","gi");
     s=s.replace(rg," ");
   }
 }
 return s.replace(/\s+/g," ").trim();
}

function containsOtherNicheTerm(text, selectedNiche){
 const s=normalizePhrase(text);
 for(const [group,terms] of Object.entries(NICHE_GROUPS)){
   if(group===selectedNiche) continue;
   for(const term of terms){
     const rg=new RegExp("\\b"+term.replace(/\s+/g,"\\s+")+"\\b","i");
     if(rg.test(s)) return true;
   }
 }
 return false;
}

function selectedNicheTerm(v){
 return selectedNicheTerms(v.niche)[0];
}

function selectedNicheDisplayVariants(v){
 const n=v.niche;
 if(n==="Lofi Hiphop / Lofi Chill / Lofi Beats / Chillbeats") return ["lofi hiphop","lofi chill","lofi beats","chillbeats"];
 if(n==="Jazz / Bossa Nova") return ["jazz","bossa nova"];
 if(n==="Dark Piano / Dark Academia") return ["dark piano","dark academia"];
 if(n==="Guitar / Acoustic") return ["guitar","acoustic"];
 if(n==="Gentle Piano / Healing Piano / Calming Piano") return ["gentle piano","healing piano","calming piano"];
 if(n==="Baby Lullaby / Gentle Lullaby / Lullaby Piano / Lullaby Music Box") return ["baby lullaby","gentle lullaby","lullaby piano","lullaby music box"];
 if(n==="Tibetan Flute / Calm Flute / Gentle Flute") return ["tibetan flute","calm flute","gentle flute"];
 if(n==="Deep House / Techno EDM / Techno Melodic") return ["deep house","techno edm","techno melodic"];
 return [String(n||"").toLowerCase()];
}


function baseTopicParts(v){
 const main=normalizePhrase(v.main);
 const niche=normalizePhrase(v.niche);
 const strippedMain=removeOtherNicheTerms(main,v.niche);
 const core=removeOtherNicheTerms(cleanCore(strippedMain),v.niche);
 const words=core.split(" ").filter(Boolean);
 return {main,niche,core,words};
}


function useCaseKeywordTerms(useCase){
 const map={
   Study:["study","reading","writing"],
   Work:["work","productivity"],
   Relax:["relax","calm","stress relief"],
   Focus:["focus","deep focus","concentration"],
   Sleep:["sleep","deep sleep","bedtime"]
 };
 return map[useCase] || [];
}

function generateKeywords(v){
 const {main,niche,core}=baseTopicParts(v);
 const out=[];
 const joined=core || removeOtherNicheTerms(main,v.niche) || main;
 const has=(w)=>joined.includes(w);
 const variants=selectedNicheDisplayVariants(v);
 const baseSig=new Set(tokenSignature(joined));
 const useCaseTerms=useCaseKeywordTerms(v.use);
 let pool=[];

 function maybePhrase(stem, addon){
   const addonSig=tokenSignature(addon);
   const overlap=addonSig.some ? addonSig.some(x=>baseSig.has(x)) : false;
   return overlap ? stem : `${stem} ${addon}`;
 }
 function addPool(candidate){ pool.push(candidate); }

 if(v.niche==="Lofi Hiphop / Lofi Chill / Lofi Beats / Chillbeats"){
   [
     `${joined} lofi`,
     maybePhrase(`${joined} lofi`,`ambience`),
     maybePhrase(`${joined}`,`study lofi`),
     maybePhrase(`${joined}`,`chill beats`),
     maybePhrase(`${joined}`,`focus beats`),
     maybePhrase(`${joined}`,`background lofi`),
     maybePhrase(`${joined}`,`night lofi`),
     maybePhrase(`${joined}`,`relaxing beats`),
     maybePhrase(`${joined}`,`cozy mood`)
   ].forEach(addPool);
 } else if(v.niche==="Jazz / Bossa Nova"){
   [
     `${joined} jazz`,
     `${joined} bossa nova`,
     maybePhrase(`relaxing ${joined}`,`jazz`),
     maybePhrase(`cozy ${joined}`,`bossa nova`),
     maybePhrase(`${joined} jazz`,`ambience`),
     maybePhrase(`${joined} bossa nova`,`ambience`),
     maybePhrase(`${joined}`,`cafe jazz`),
     maybePhrase(`${joined}`,`lounge bossa nova`),
     `${joined} jazz and bossa nova`
   ].forEach(addPool);
 } else if(v.niche==="Dark Piano / Dark Academia"){
   [
     `${joined} dark piano`,
     `${joined} dark academia`,
     `${joined} dark academia piano`,
     maybePhrase(`melancholic ${joined}`,`piano`),
     maybePhrase(`${joined}`,`study piano`),
     maybePhrase(`${joined} dark piano`,`ambience`),
     maybePhrase(`${joined}`,`gothic piano`),
     maybePhrase(`${joined} dark academia`,`ambience`),
     maybePhrase(`${joined}`,`emotional piano`)
   ].forEach(addPool);
 } else if(v.niche==="Guitar / Acoustic"){
   [
     `${joined} acoustic guitar`,
     `${joined} guitar`,
     maybePhrase(`${joined}`,`acoustic music`),
     maybePhrase(`${joined}`,`relaxing guitar`),
     maybePhrase(`${joined}`,`fingerstyle guitar`),
     maybePhrase(`${joined}`,`acoustic ambience`),
     maybePhrase(`${joined}`,`guitar background music`),
     maybePhrase(`${joined}`,`calm acoustic`),
     maybePhrase(`${joined}`,`gentle guitar`)
   ].forEach(addPool);
 } else if(v.niche==="Gentle Piano / Healing Piano / Calming Piano"){
   [
     `${joined} piano`,
     `${joined} piano music`,
     maybePhrase(`${joined}`,`relaxing piano`),
     maybePhrase(`${joined}`,`study piano`),
     maybePhrase(`${joined}`,`peaceful piano`),
     maybePhrase(`${joined}`,`emotional piano`),
     maybePhrase(`${joined}`,`piano ambience`),
     maybePhrase(`${joined}`,`focus piano`),
     maybePhrase(`${joined}`,`background piano`)
   ].forEach(addPool);
 } else if(v.niche==="Baby Lullaby / Gentle Lullaby / Lullaby Piano / Lullaby Music Box"){
   [
     `${joined} baby lullaby`,
     `${joined} gentle lullaby`,
     `${joined} music box`,
     maybePhrase(`${joined}`,`bedtime lullaby`),
     maybePhrase(`${joined}`,`soothing music box`),
     maybePhrase(`${joined}`,`gentle sleep music`),
     maybePhrase(`${joined}`,`baby sleep music`),
     maybePhrase(`${joined}`,`lullaby melody`),
     maybePhrase(`${joined}`,`music box lullaby`)
   ].forEach(addPool);
 } else if(v.niche==="Tibetan Flute / Calm Flute / Gentle Flute"){
   [
     `${joined} tibetan flute`,
     maybePhrase(`${joined}`,`flute meditation`),
     maybePhrase(`${joined}`,`relaxing tibetan flute`),
     maybePhrase(`${joined}`,`peaceful flute music`),
     maybePhrase(`${joined}`,`meditation flute`),
     maybePhrase(`${joined}`,`tibetan ambience`),
     maybePhrase(`${joined}`,`healing flute`),
     maybePhrase(`${joined}`,`calm flute music`),
     maybePhrase(`${joined}`,`spiritual flute`)
   ].forEach(addPool);
 } else if(v.niche==="Deep House / Techno EDM / Techno Melodic"){
   [
     `${joined} deep house`,
     `${joined} melodic techno`,
     `${joined} techno edm`,
     maybePhrase(`${joined}`,`deep house mix`),
     maybePhrase(`${joined}`,`melodic techno mix`),
     maybePhrase(`${joined}`,`night drive techno`),
     maybePhrase(`${joined}`,`deep electronic mix`),
     maybePhrase(`${joined}`,`atmospheric techno`),
     `${joined} deep house and melodic techno`
   ].forEach(addPool);
 }


 if(useCaseTerms.length){
   [
     maybePhrase(`${joined}`,useCaseTerms[0]),
     maybePhrase(`${joined}`,useCaseTerms[1] || useCaseTerms[0]),
     maybePhrase(`${joined}`,useCaseTerms[2] || useCaseTerms[0])
   ].forEach(addPool);
 }

 if(has("tokyo") && has("rain")){
   [
     `rainy tokyo ${variants[0]}`,
     `tokyo night ${variants[Math.min(1,variants.length-1)]}`,
     maybePhrase("tokyo rain","ambience"),
     `japanese rain ${variants[0]}`,
     "tokyo study music"
   ].forEach(x=>pool.unshift(x));
 }
 if(has("autumn")){
   [
     `autumn ${variants[0]}`,
     variants[1] ? `autumn ${variants[1]}` : `cozy autumn ${variants[0]}`,
     `relaxing autumn ${variants[0]}`,
     `cozy autumn ${variants[Math.min(1,variants.length-1)]}`,
     "autumn night vibes",
     "fall ambience"
   ].forEach(x=>pool.unshift(x));
 }
 if(has("rain") && v.use==="Sleep"){
   ["rain sounds for sleep","gentle rain sleep music","night rain ambience","soothing rain sounds"].forEach(x=>pool.unshift(x));
 }
 if(has("cozy") && has("rain")){
   ["cozy rain ambience",`rainy room ${variants[0]}`,"cozy rainy night","window rain ambience"].forEach(x=>pool.unshift(x));
 }

 const variedPool=rotateArray(pool,state.keywordSeed);
 state.keywordSeed++;
 for(const c of variedPool) addCandidate(out,c,v.niche,joined,v.main);

 const safeFallback=[
   maybePhrase(`${joined}`,`mood`),
   maybePhrase(`${joined}`,`background music`),
   maybePhrase(`${joined}`,`relaxing music`),
   maybePhrase(`${joined}`,`study music`),
   maybePhrase(`${joined}`,`night vibes`),
   maybePhrase(`${joined}`,`focus music`)
 ];
 for(const c of rotateArray(safeFallback,state.keywordSeed)){
   if(out.length>=9) break;
   addCandidate(out,c,v.niche,joined,v.main);
 }

 // Add secondary variants to ensure regenerate can produce a genuinely different set.
 const secondary=[
   `${joined} playlist`,
   `${joined} session`,
   `${joined} mix`,
   `${joined} background`,
   `${joined} study`,
   `${joined} focus`,
   `${joined} night`,
   `${joined} relaxing`,
   `${joined} cozy`
 ];
 for(const c of rotateArray(secondary,state.keywordSeed+3)){
   if(out.length>=12) break;
   addCandidate(out,c,v.niche,joined,v.main);
 }

 const mainKeywordKey=normalizeKeywordKey(v.main);
 const finalKeywordMap=new Map();
 for(const kw of (rotateArray(out,state.keywordSeed).slice(0,9))){
   const key=normalizeKeywordKey(kw);
   if(!key || key===mainKeywordKey || finalKeywordMap.has(key)) continue;
   if(hasOpposingActivityContexts(kw)) continue;
   finalKeywordMap.set(key,kw);
 }
 state.keywords=[...finalKeywordMap.values()].slice(0,9);
}

function sentenceCase(s){
 const t=String(s||"").trim().replace(/\s+/g," ");
 if(!t)return "";
 return t.charAt(0).toUpperCase()+t.slice(1).toLowerCase();
}

function nicheLabel(niche){
 const map={
   "Lofi Hiphop / Lofi Chill / Lofi Beats / Chillbeats":"lofi",
   "Jazz / Bossa Nova":"jazz / bossa nova",
   "Dark Piano / Dark Academia":"dark piano / dark academia",
   "Guitar / Acoustic":"guitar / acoustic",
   "Gentle Piano / Healing Piano / Calming Piano":"piano",
   "Baby Lullaby / Gentle Lullaby / Lullaby Piano / Lullaby Music Box":"baby lullaby / gentle lullaby / music box",
   "Tibetan Flute / Calm Flute / Gentle Flute":"tibetan flute",
   "Deep House / Techno EDM / Techno Melodic":"deep house / techno edm / melodic techno"
 };
 return map[niche] || niche.toLowerCase();
}

function generateMoods(v){
 const src=[v.main,...state.keywords].map(normalizePhrase).filter(Boolean);
 const main=normalizePhrase(v.main);
 const candidates=[];
 const add=(x)=>{
   const p=normalizePhrase(x);
   if(!p || p.split(" ").length<2 || p.split(" ").length>6)return;
   if(hasDuplicateMeaningWords(p) || hasAdjacentDuplicate(p))return;
   if(candidates.some(c=>phraseSimilarity(c,p)>=0.82))return;
   candidates.push(p);
 };

 const has=(w)=>src.some(s=>s.includes(w));

 if(has("tokyo") && has("rain")){
   ["rainy tokyo night","tokyo after the rain","quiet tokyo rain at night","rainy tokyo window","late-night tokyo rain"].forEach(add);
 }
 if(has("autumn")){
   ["cozy autumn evening","quiet autumn night","warm autumn afternoon","autumn cafe ambience","peaceful fall evening"].forEach(add);
 }
 if(has("rain") && v.use==="Sleep"){
   ["rainy night for deep sleep","gentle rain at bedtime","quiet rain through the night","soft nighttime rainfall"].forEach(add);
 }
 if(has("cozy") && has("rain")){
   ["cozy rainy room","warm rainy evening","quiet room on a rainy night","cozy window rain"].forEach(add);
 }
 if(has("night")){
   ["quiet midnight atmosphere","late-night calm","peaceful night ambience","after-dark relaxation"].forEach(add);
 }
 if(has("cafe") || has("coffee")){
   ["cozy cafe evening","quiet coffee shop ambience","late-night cafe mood","warm cafe corner"].forEach(add);
 }

 const core=cleanCore(v.main);
 [
   `${core} evening`,
   `${core} night`,
   `cozy ${core}`,
   `peaceful ${core}`,
   `quiet ${core} ambience`,
   `${core} after dark`
 ].forEach(add);

 state.moods=candidates.slice(0,5);
 if(!state.moods.length) state.moods=[normalizePhrase(v.main)];
}

function sanitizeMoodForNiche(mood,niche){
 let m=removeOtherNicheTerms(normalizePhrase(mood),niche);
 const allAllowed=selectedNicheTerms(niche);
 for(const term of allAllowed){
   const rg=new RegExp("\\b"+term.replace(/\s+/g,"\\s+")+"\\b","gi");
   m=m.replace(rg," ");
 }
 m=m.replace(/\b(music|beats|melody|melodies)\b/gi," ");
 m=m.replace(/\s+/g," ").trim();
 return m || normalizePhrase(mood);
}

function chooseNicheForTitle(v,i,mood){
 const variants=selectedNicheDisplayVariants(v);
 if(variants.length===1) return variants[0];
 // Prefer single natural genre phrase, occasionally a mixed phrase.
 if(i%5===4 && variants.length>2) return variants[2];
 return variants[i%Math.min(2,variants.length)];
}

function chooseSeparator(i,phrase){
 const p=normalizePhrase(phrase);
 if(i%3===0)return " | ";
 if(p.includes("rain"))return " 🌧️ ";
 if(p.includes("night"))return " 🌙 ";
 if(p.includes("autumn")||p.includes("fall"))return " 🍂 ";
 if(p.includes("sleep"))return " 😴 ";
 if(p.includes("cafe")||p.includes("coffee"))return " ☕ ";
 return i%2===0 ? " ✦ " : " • ";
}

function useCasePhrase(u){
 const map={Study:"study",Focus:"focus",Work:"work",Relax:"relaxation",Sleep:"sleep"};
 return map[u]||u.toLowerCase();
}

function buildTitle(v,mood,emotion,atmosphere,i){
 const cleanMood=sanitizeMoodForNiche(mood,v.niche);
 const genre=chooseNicheForTitle(v,i,cleanMood);
 const separator=chooseSeparator(i,cleanMood+" "+atmosphere);
 const left=`${cleanMood} ${genre}`.replace(/\s+/g," ").trim();
 const right=`${emotion.toLowerCase()} for ${useCasePhrase(v.use)} + ${normalizePhrase(atmosphere)}`;
 return sentenceCase(left + separator + right);
}

function generateEmotions(v){
 let base=["Calm Music","Chill Beats","Peaceful Music","Relaxing Music","Uplifting Music","Calm Beats","Peaceful Melody","Relaxing Melody","Chill Music"];
 if(v.niche.includes("Lofi Hiphop / Lofi Chill / Lofi Beats / Chillbeats")) base=["Chill Beats","Calm Beats","Relaxing Music","Peaceful Beats","Chill Music","Calm Music"];
 else if(v.niche.includes("Gentle Piano / Healing Piano / Calming Piano")||v.niche.includes("Lullaby")||v.niche.includes("Music Box")) base=["Peaceful Melody","Relaxing Music","Calm Melody","Peaceful Music","Calm Music"];
 else if(v.niche.includes("Jazz")||v.niche.includes("Bossa")) base=["Relaxing Music","Chill Music","Calm Music","Peaceful Music","Uplifting Music"];
 else if(v.niche.includes("Techno")||v.niche.includes("House")) base=["Uplifting Music","Chill Beats","Calm Beats","Relaxing Music","Chill Music"];
 state.emotions=base.slice(0,5);
}
function generateAtmos(v){
 const selected=(v.atmosphereOptions||[]).map(normalizePhrase).filter(Boolean);
 const related=[v.main,...state.keywords].map(normalizePhrase).join(" ");
 const candidates=[];

 const hasCtx=(w)=>related.includes(w);
 const add=(s)=>{
   const p=normalizePhrase(s);
   if(!p)return;
   if(p.split(" ").length>7)return;
   if(hasDuplicateMeaningWords(p)||hasAdjacentDuplicate(p))return;
   if(candidates.some(x=>phraseSimilarity(x,p)>=0.82))return;
   candidates.push(p);
 };

 function phrasesForOption(opt){
   const out=[];
   const push=(x)=>{ if(x) out.push(x); };

   // Base variations per selected option, developed independently.
   const map={
     "window":["cozy window ambience","quiet window view","soft window atmosphere"],
     "rooftop":["quiet rooftop ambience","open rooftop atmosphere","calm rooftop mood"],
     "balcony":["quiet balcony ambience","cozy balcony atmosphere","balcony with soft air"],
     "room":["cozy room ambience","quiet room atmosphere","warm room mood"],
     "cabin":["cozy cabin ambience","quiet cabin atmosphere","warm cabin mood"],
     "lounge":["calm lounge ambience","quiet lounge atmosphere","soft lounge mood"],
     "cafe":["cozy cafe ambience","quiet cafe atmosphere","warm cafe mood"],
     "bar":["calm bar ambience","soft bar atmosphere","late bar mood"],
     "coffee shop":["cozy coffee shop ambience","quiet coffee shop mood","warm coffee shop atmosphere"],
     "office":["calm office ambience","quiet office atmosphere","focused office mood"],
     "apartments":["quiet apartment ambience","cozy apartment atmosphere","soft apartment mood"],
     "bedroom":["cozy bedroom ambience","quiet bedroom atmosphere","soft bedroom mood"],
     "living room":["cozy living room ambience","quiet living room mood","warm living room atmosphere"],
     "city":["quiet city ambience","soft city lights","calm city atmosphere"],
     "street":["quiet street ambience","soft street atmosphere","calm street mood"],
     "nature":["peaceful nature ambience","soft natural atmosphere","calm nature mood"],
     "forest":["peaceful forest ambience","quiet forest atmosphere","soft forest mood"],
     "river":["peaceful river ambience","soft river atmosphere","calm river mood"],
     "water sound":["gentle water sound ambience","soft water sounds","calming water sound"],
     "water flow":["gentle water flow ambience","soft flowing water","calming water flow"],
     "bamboo water fountain":["bamboo water fountain ambience","gentle bamboo fountain","calm bamboo fountain"],
     "bamboo water flowing":["bamboo water flowing ambience","soft bamboo water flow","gentle bamboo water"],
     "mountain":["peaceful mountain ambience","quiet mountain atmosphere","soft mountain mood"],
     "lakeside":["peaceful lakeside ambience","quiet lakeside atmosphere","soft lakeside mood"],
     "seaside":["peaceful seaside ambience","soft seaside atmosphere","calm seaside mood"],
     "ocean":["peaceful ocean ambience","soft ocean atmosphere","calm ocean mood"],
     "rain":["gentle rain ambience","soft rainfall atmosphere","calm rainy mood","rainy background ambience","peaceful rain sounds"],

     "night":["quiet night ambience","soft nighttime atmosphere","calm late-night mood"],
     "early morning":["calm early morning ambience","soft early morning mood","peaceful dawn atmosphere"],
     "morning":["calm morning ambience","soft morning atmosphere","peaceful morning mood"],
     "golden hour":["soft golden hour ambience","warm golden hour mood","peaceful golden light"],
     "evening":["calm evening ambience","soft evening atmosphere","peaceful evening mood"]
   };
   rotateArray(
     map[opt] || [`${opt} ambience`, `quiet ${opt}`, `calm ${opt} atmosphere`],
     state.atmosSeed
   ).forEach(push);

   // Context refinement for the same selected option only.
   if(hasCtx("rain")){
     if(["window","rooftop","balcony","street","city","cafe","coffee shop","room","bedroom","living room","office","apartments"].includes(opt)){
       push(`rainy ${opt} ambience`);
     }
     if(opt==="window") push("rain by the window");
     if(opt==="street") push("street ambience after rain");
     if(opt==="city") push("rainy city lights");
   }
   if(hasCtx("tokyo") && opt==="city") push("quiet tokyo city lights");
   if(hasCtx("autumn")){
     if(["cafe","coffee shop","room","bedroom","living room","forest","lakeside","mountain","city","street","balcony","rooftop"].includes(opt)){
       push(`autumn ${opt} ambience`);
     }
     if(opt==="evening") push("soft autumn evening mood");
   }
   if(hasCtx("sleep")){
     if(["bedroom","room","living room","night","window","water sound","water flow","bamboo water flowing"].includes(opt)){
       push(`calm ${opt} for sleep`);
     }
   }
   if(hasCtx("study") || hasCtx("focus") || hasCtx("work")){
     if(["office","window","room","cafe","coffee shop","city","balcony"].includes(opt)){
       push(`focused ${opt} ambience`);
     }
   }

   return out;
 }

 // Build phrases independently for each chosen option.
 const selectedOrder=rotateArray(selected,state.atmosSeed);
 selectedOrder.forEach(opt=>{
   phrasesForOption(opt).forEach(add);
 });

 // If still short, recycle distinct alternatives by selected option only.
 selected.forEach(opt=>{
   if(candidates.length>=10) return;
   add(`${opt} atmosphere`);
   if(candidates.length>=10) return;
   add(`quiet ${opt} ambience`);
 });

 state.atmosSeed++;
 state.atmos=rotateArray(candidates,state.atmosSeed).slice(0,10);
}
function usePhrase(u){return u==="Relax"?"Relaxation":u}
function scoreTitle(t,v){
 let s=66;
 const low=t.toLowerCase(); const mk=v.main.toLowerCase();
 if(low.includes(mk))s+=12; else if(state.keywords.some(k=>low.includes(k.toLowerCase())))s+=8;
 if(low.indexOf(cleanCore(v.main).split(" ")[0])<28)s+=5;
 if(t.length>=55&&t.length<=90)s+=7; else if(t.length<=105)s+=3;
 if(state.emotions.some(e=>low.includes(e.toLowerCase())))s+=4;
 if(state.atmos.some(a=>low.includes(a.toLowerCase())))s+=4;
 if(t.includes("|"))s+=2;
 return Math.min(98,s);
}
function generateTitles(v){
 const moods=state.moods.length?state.moods:[normalizePhrase(v.main)];
 const emos=shuffle(state.emotions);
 const ats=shuffle(state.atmos);
 let titles=[];

 function compactMood(m){
   let words=normalizePhrase(m).split(" ");
   return words.slice(0,4).join(" ");
 }
 function compactAtmos(a){
   return normalizePhrase(a).split(" ").slice(0,7).join(" ");
 }
 function fitTitle(mood,emo,at,i){
   let t=buildTitle(v,compactMood(mood),emo,compactAtmos(at),i);
   if(t.length<100) return t;
   t=buildTitle(v,compactMood(mood),emo,compactAtmos(at).split(" ").slice(0,5).join(" "),i);
   if(t.length<100) return t;
   t=buildTitle(v,compactMood(mood).split(" ").slice(0,3).join(" "),emo,compactAtmos(at).split(" ").slice(0,3).join(" "),i);
   if(t.length<100) return t;
   // Final guaranteed compact form while preserving structure.
   const cleanMood=sanitizeMoodForNiche(compactMood(mood).split(" ").slice(0,3).join(" "),v.niche);
   const genre=chooseNicheForTitle(v,i,cleanMood);
   const separator=chooseSeparator(i,cleanMood+" "+at);
   const shortEmotion=String(emo).toLowerCase().replace("relaxing music","calm music");
   t=sentenceCase(`${cleanMood} ${genre}${separator}${shortEmotion} for ${useCasePhrase(v.use)} + ${compactAtmos(at).split(" ").slice(0,3).join(" ")}`);
   return t.slice(0,99).replace(/\s+\S*$/,"").replace(/[|+•✦🌧️🌙🍂😴☕]\s*$/,"").trim();
 }

 for(let i=0;i<30 && titles.length<10;i++){
   const mood=moods[i%moods.length];
   const emo=emos[i%emos.length];
   const at=ats[i%ats.length];
   const t=fitTitle(mood,emo,at,i);
   if(t.length<100) titles.push(t);
 }
 titles=unique(titles).map(t=>({title:t,score:scoreTitle(t,v),len:t.length}));
 titles.sort((a,b)=>b.score-a.score);
 state.titles=(titles.slice(0,10)).filter(item=>{
   const titleText=typeof item==="string" ? item : (item && item.title ? item.title : "");
   return titleText && !hasOpposingActivityContexts(titleText);
 })
}
function hashtag(s){return "#"+s.replace(/[^a-zA-Z0-9 ]/g," ").trim().split(/\s+/).map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join("")}
function copyText(t,btn){
 const done=()=>{const old=btn.textContent;btn.textContent="Copied!";setTimeout(()=>btn.textContent=old,900)};
 if(navigator.clipboard && window.isSecureContext){
   navigator.clipboard.writeText(t).then(done).catch(()=>fallbackCopy(t,done));
 } else { fallbackCopy(t,done); }
}
function fallbackCopy(t,done){
 const ta=document.createElement("textarea");
 ta.value=t; ta.style.position="fixed"; ta.style.opacity="0";
 document.body.appendChild(ta); ta.focus(); ta.select();
 try{document.execCommand("copy");done();}catch(e){alert("Copy failed. Please select and copy manually.");}
 document.body.removeChild(ta);
}

const SOCIAL_HASHTAG_SIGNALS=[
 "lofi","lofihiphop","lofibeats","chill","chillbeats","relaxingmusic","sleepmusic",
 "studymusic","focusmusic","workmusic","ambientmusic","rain","rainsounds","rainymood",
 "piano","pianomusic","healingmusic","calmingmusic","lullaby","babysleep","musicbox",
 "jazz","bossanova","acoustic","guitar","meditationmusic","flutemusic","deephouse",
 "melodictechno","nightvibes","cozyvibes","relaxing","sleep","study","focus","meditation"
];

function hashtagPhrase(value){
 return String(value||"")
   .normalize("NFKC")
   .toLowerCase()
   .replace(/&/g," and ")
   .replace(/[^\p{L}\p{N}\s]/gu," ")
   .replace(/\s+/g," ")
   .trim();
}

function hashtagKey(value){
 return hashtagPhrase(value).replace(/\s+/g,"");
}

function hashtagSocialScore(value){
 const phrase=hashtagPhrase(value);
 const key=hashtagKey(value);
 if(!phrase || !key) return -999;

 let score=0;
 const words=phrase.split(" ").filter(Boolean);

 // Relevance-friendly shape: concise hashtags tend to be easier to read/use.
 if(words.length===1) score+=18;
 else if(words.length===2) score+=26;
 else if(words.length===3) score+=18;
 else if(words.length===4) score+=8;
 else score-=10;

 // Familiar social / YouTube music phrasing.
 for(const signal of SOCIAL_HASHTAG_SIGNALS){
   if(key===signal) score+=28;
   else if(key.includes(signal) || signal.includes(key)) score+=10;
 }

 // Strong music/content intent.
 if(/\b(music|lofi|beats|piano|jazz|guitar|lullaby|flute|house|techno|rain|sleep|study|focus|relax|meditation|ambient|vibes)\b/.test(phrase)) score+=12;

 // Avoid overly generic or spam-like tags.
 if(/^(music|video|youtube|viral|fyp|trending)$/i.test(phrase)) score-=30;

 // Readability / memorability heuristic.
 if(key.length>=5 && key.length<=22) score+=12;
 else if(key.length>30) score-=14;

 return score;
}

function buildDescriptionHashtags(mainKeyword,relatedKeywords){
 const main=hashtagPhrase(mainKeyword);
 const mainTokens=new Set(main.split(" ").filter(Boolean));
 const candidates=[];

 function addCandidate(value,bonus=0){
   const phrase=hashtagPhrase(value);
   if(!phrase) return;
   const key=hashtagKey(phrase);
   if(!key) return;

   const tokens=phrase.split(" ").filter(Boolean);
   const overlap=tokens.filter(t=>mainTokens.has(t)).length;
   const relevance=mainTokens.size ? overlap/mainTokens.size : 0;

   // Must stay meaningfully related to Main Keyword.
   if(relevance===0 && phrase!==main) return;

   const score=
     hashtagSocialScore(phrase) +
     Math.round(relevance*45) +
     bonus;

   candidates.push({phrase,key,score});
 }

 // Main Keyword always gets strongest relevance priority.
 addCandidate(main,50);

 // Related Keywords are primary expansion source.
 (relatedKeywords||[]).forEach((kw,i)=>{
   addCandidate(kw,Math.max(0,18-i*2));
 });

 // Create concise social-style combinations from Main Keyword tokens.
 const mainWords=main.split(" ").filter(Boolean);
 if(mainWords.length>=2){
   for(let i=0;i<mainWords.length;i++){
     for(let j=i+1;j<mainWords.length;j++){
       addCandidate(`${mainWords[i]} ${mainWords[j]}`,14);
     }
   }
 }

 // Single strong topic tokens are allowed only when clearly meaningful.
 for(const w of mainWords){
   if(w.length>=4 && !/^(music|video|audio|sound)$/i.test(w)){
     addCandidate(w,6);
   }
 }

 // Rank + dedupe.
 const bestByKey=new Map();
 for(const c of candidates){
   const prev=bestByKey.get(c.key);
   if(!prev || c.score>prev.score) bestByKey.set(c.key,c);
 }

 const ranked=[...bestByKey.values()]
   .sort((a,b)=>b.score-a.score)
   .slice(0,5);

 return ranked.map(x=>{
   const pascal=x.phrase.split(" ").filter(Boolean)
     .map(w=>w.charAt(0).toUpperCase()+w.slice(1))
     .join("");
   return "#"+pascal;
 });
}


const YOUTUBE_META_SEARCH_SIGNALS=[
 "lofi","lofi hiphop","lofi beats","chill beats","study music","focus music",
 "work music","relaxing music","sleep music","deep sleep music","rain sounds",
 "rain ambience","piano music","healing piano","calming piano","lullaby",
 "baby sleep music","music box","jazz","bossa nova","acoustic guitar",
 "meditation music","tibetan flute","deep house","melodic techno",
 "background music","ambient music","night vibes","cozy ambience"
];

function metaPhrase(value){
 return String(value||"")
   .normalize("NFKC")
   .toLowerCase()
   .replace(/&/g," and ")
   .replace(/[^\p{L}\p{N}\s]/gu," ")
   .replace(/\s+/g," ")
   .trim();
}




function metaKeywordScore(value,mainKeyword,niche,useCase){
 const phrase=metaPhrase(value);
 const main=metaPhrase(mainKeyword);
 if(!phrase) return -999;

 const words=phrase.split(" ").filter(Boolean);
 const mainWords=new Set(main.split(" ").filter(Boolean));
 const phraseWords=phrase.split(" ").filter(Boolean);

 let score=0;

 // Strong priority for concise meta tags: ideally no more than 4 words.
 if(words.length===1) score+=28;
 else if(words.length===2) score+=36;
 else if(words.length===3) score+=40;
 else if(words.length===4) score+=38;
 else if(words.length===5) score+=6;
 else score-=28;

 // Relevance to Main Keyword is the strongest factor.
 const overlap=phraseWords.filter(w=>mainWords.has(w)).length;
 const relevance=mainWords.size ? overlap/mainWords.size : 0;
 score += Math.round(relevance*55);

 if(phrase===main) score+=50;

 // YouTube-search-intent heuristic: familiar phrases people commonly type.
 for(const signal of YOUTUBE_META_SEARCH_SIGNALS){
   const s=metaPhrase(signal);
   if(phrase===s) score+=30;
   else if(phrase.includes(s)) score+=18;
   else if(s.includes(phrase) && phrase.length>=5) score+=8;
 }

 // Use-case intent.
 const use=String(useCase||"").toLowerCase();
 if(use && phrase.includes(use)) score+=16;

 // Niche intent: reward any selected-niche variant found in the phrase.
 try{
   const fakeV={niche:niche};
   const nicheVariants=selectedNicheDisplayVariants(fakeV)||[];
   for(const variant of nicheVariants){
     const nv=metaPhrase(variant);
     if(nv && phrase.includes(nv)) score+=14;
   }
 }catch(e){}

 // Prefer concise, searchable phrases over long stuffing.
 if(words.length===2) score+=18;
 else if(words.length===3) score+=24;
 else if(words.length===4) score+=16;
 else if(words.length===5) score+=8;
 else if(words.length>6) score-=18;

 // Viral-potential heuristic: readable, memorable, and intent-rich.
 if(phrase.length>=8 && phrase.length<=38) score+=12;
 if(/\b(music|lofi|beats|rain|sleep|study|focus|relax|piano|jazz|guitar|lullaby|flute|house|techno|ambience|vibes)\b/.test(phrase)) score+=10;

 // Avoid low-value generic/spam terms.
 if(/^(music|video|youtube|viral|fyp|trending|song|audio)$/i.test(phrase)) score-=45;
 if(/\b(viral|fyp|trending)\b/.test(phrase) && relevance<0.5) score-=25;

 return score;
}

function buildMetaTagKeywords(mainKeyword,relatedKeywords,niche,useCase){
 const main=metaPhrase(mainKeyword);
 const mainWords=main.split(" ").filter(Boolean);
 const candidates=[];

 function add(value,bonus=0){
   const cleaned=(typeof stripRepeatedConcepts==="function") ? stripRepeatedConcepts(value) : value;
   const phrase=metaPhrase(cleaned);
   if(!phrase) return;
   const wordCount=phrase.split(" ").filter(Boolean).length;
   if(wordCount>4) return;

   // Require meaningful relation to Main Keyword, except the Main Keyword itself.
   const words=phrase.split(" ").filter(Boolean);
   const overlap=words.filter(w=>mainWords.includes(w)).length;
   if(phrase!==main && overlap===0) return;

   candidates.push({
     phrase,
     score:metaKeywordScore(phrase,mainKeyword,niche,useCase)+bonus
   });
 }

 // Main Keyword is included only when it also respects the 4-word Meta Tag limit.
 add(main,100);

 // Related Keywords are the main source, but re-ranked independently.
 (relatedKeywords||[]).forEach((kw,i)=>{
   add(kw,Math.max(0,28-i*2));
 });

 // Add independent YouTube-search-style variants from Main Keyword.
 if(mainWords.length>=2){
   for(let i=0;i<mainWords.length;i++){
     for(let j=i+1;j<mainWords.length;j++){
       add(`${mainWords[i]} ${mainWords[j]}`,10);
     }
   }
 }

 // Add use-case expansion independently from hashtag logic.
 if(useCase){
   const useMap={
     Study:"study music",
     Work:"work music",
     Relax:"relaxing music",
     Focus:"focus music",
     Sleep:"sleep music"
   };
   const suffix=useMap[String(useCase)] || String(useCase).toLowerCase();
   add(`${main} ${suffix}`,18);
 }

 // Add niche variants independently from hashtag logic.
 try{
   const fakeV={niche:niche};
   const nicheVariants=selectedNicheDisplayVariants(fakeV)||[];
   nicheVariants.slice(0,3).forEach((variant,i)=>{
     add(variant,14-i*2);
   });
 }catch(e){}

 // Dedupe by normalized phrase.
 const best=new Map();
 for(const c of candidates){
   const key=metaPhrase(c.phrase);
   const prev=best.get(key);
   if(!prev || c.score>prev.score) best.set(key,c);
 }

 // Keep Main Keyword first, then rank the remaining terms.
 const mainItem=best.get(main);
 const others=[...best.values()]
   .filter(x=>x.phrase!==main)
   .sort((a,b)=>{
     const aWords=metaPhrase(a.phrase).split(" ").filter(Boolean).length;
     const bWords=metaPhrase(b.phrase).split(" ").filter(Boolean).length;
     const aShort=aWords<=4 ? 1 : 0;
     const bShort=bWords<=4 ? 1 : 0;
     if(aShort!==bShort) return bShort-aShort;
     return b.score-a.score;
   });

 const result=[];
 if(mainItem) result.push(mainItem.phrase);
 result.push(...others.map(x=>x.phrase));

 return result
   .filter(x=>metaPhrase(x).split(" ").filter(Boolean).length<=4)
   .slice(0,10);
}

function render(v){
 const meta=buildMetaTagKeywords(v.main,state.keywords,v.niche,v.use).join(", ");
 const hashtags=buildDescriptionHashtags(v.main,state.keywords).join(" ");
 const best=state.titles[0];
 const related=[v.main,...state.keywords].join(" ").toLowerCase();
 const kwHtml=state.keywords.map((k,i)=>`<div class="keyword"><b>${i+1}. ${k}</b><div class="potential ${i<4?'high':''}">SEO Potential: ${i<4?'High':i<7?'Medium':'Low'}</div></div>`).join("");
 const atHtml=state.atmos.map((a,i)=>`<div class="atmo">${i+1}. ${a}</div>`).join("");
 const titleHtml=state.titles.slice(1).map((o,i)=>`<div class="title-item"><p><b>${i+2}.</b> ${o.title}</p><div class="title-bottom"><div class="metrics"><span>SEO Score ${o.score}/100 | ${o.len} chars</span></div><button class="copy" onclick='copyText(${JSON.stringify(o.title)},this)'>Copy</button></div></div>`).join("");
 $("output").innerHTML=`
 <div class="card result-card"><div class="kicker" id="keywordAnalysis">Keyword Analysis</div><div class="row-between"><div><h2 class="section-title">${v.main}</h2><p class="section-sub" style="margin:4px 0 0">Topic Cluster: ${v.cluster}</p></div><span class="badge">${v.niche} · ${primaryUseCase(v.use)}</span></div></div>
 <div class="card result-card"><div class="row-between"><div><div class="kicker">Related Keywords</div><h2 class="section-title">9 SEO keyword ideas</h2><p class="section-sub" style="margin:4px 0 0">Related keywords may mix genres only within the selected niche group, while blocking overlap with other niche groups.</p></div><button class="copy" onclick='copyText(${JSON.stringify(state.keywords.join(", "))},this)'>Copy Keywords</button></div><div class="keyword-list">${kwHtml}</div></div>
 <div class="card result-card"><div class="row-between"><div><div class="kicker">Mood / Scenario</div><h2 class="section-title">High-intent scenario hooks</h2></div><button class="copy" onclick='copyText(${JSON.stringify(state.moods.join(", "))},this)'>Copy Mood Ideas</button></div><div class="chips">${state.moods.map(x=>`<span class="chip">${sentenceCase(x)}</span>`).join("")}</div></div>
 <div class="card result-card"><div class="kicker">Emotional Keywords</div><div class="chips">${state.emotions.map(x=>`<span class="chip">${x}</span>`).join("")}</div></div>
 <div class="card result-card"><div class="kicker">Atmosphere / Vibes</div><h2 class="section-title">Cinematic hooks</h2><div class="atmo-list">${atHtml}</div></div>
 <div class="card result-card recommended"><div class="row-between"><div><span class="badge">Recommended</span><div class="kicker" style="margin-top:12px">Best Title</div></div><button class="copy" onclick='copyText(${JSON.stringify(best.title)},this)'>Copy Title</button></div><div class="title-text">${best.title}</div><div class="metrics"><span class="metric">SEO Score: ${best.score}/100</span><span class="metric">${best.len} characters</span></div></div>
 <div class="card result-card"><div class="kicker">Alternative Titles</div><h2 class="section-title">Additional variations</h2><div class="title-list">${titleHtml}</div></div>
 <div class="card result-card"><div class="row-between"><div><div class="kicker">Meta Tag Keywords</div><h2 class="section-title">10 prioritized YouTube keywords</h2></div><button class="copy" onclick='copyText(${JSON.stringify(meta)},this)'>Copy Meta Tags</button></div><div class="codebox">${meta}</div><small style="display:block;color:var(--muted);margin-top:8px">Meta Tag Keywords are limited to a maximum of 4 words and ranked by Main Keyword relevance, YouTube search-intent heuristics, and viral potential. No fabricated search-volume data.</small></div>
 <div class="card result-card"><div class="row-between"><div><div class="kicker">Description Hashtags</div><h2 class="section-title">5 priority hashtags</h2></div><button class="copy" onclick='copyText(${JSON.stringify(hashtags)},this)'>Copy Hashtags</button></div><div class="codebox">${hashtags}</div><small style="display:block;color:var(--muted);margin-top:8px">Prioritizes Main Keyword relevance, familiar social/YouTube phrasing, and viral-potential heuristics. No fabricated search-volume data.</small></div>
 <div class="result-actions">
   <button class="primary" id="copyAllBtn">Bulk Copy</button>
   <button class="secondary" id="exportResultsBtn">Export (.xlsx)</button>
 </div>
 `;
 $("output").style.display="contents";
 const exportResultsBtn = $("exportResultsBtn");
 if(exportResultsBtn){ exportResultsBtn.onclick = exportSpreadsheet; }
 const copyAllBtn = $("copyAllBtn");
 if(copyAllBtn){
   copyAllBtn.onclick = function(){
     const altTitles=state.titles.slice(1).map((o,i)=>`${i+2}. ${o.title}`).join("\n");
     const allText =
       "Recommended Title:\n" +
       `1. ${best.title}` +
       "\n\nAlternative Titles:\n" +
       altTitles +
       "\n\nMeta Tag Keywords:\n" +
       meta +
       "\n\nDescription Hashtags:\n" +
       hashtags;
     copyText(allText, copyAllBtn);
   };
 }
}

function scrollToKeywordAnalysis(){
 // Exact target:
 // <div class="kicker" id="keywordAnalysis">Keyword Analysis</div>
 requestAnimationFrame(()=>{
   requestAnimationFrame(()=>{
     const target=document.querySelector('div.kicker#keywordAnalysis');
     if(!target)return;

     // Detect the sticky header/menu height dynamically.
     const stickyCandidates=[
       document.querySelector("header"),
       document.querySelector(".topbar"),
       document.querySelector(".app-header"),
       document.querySelector(".sticky"),
       document.querySelector('[style*="position:sticky"]')
     ].filter(Boolean);

     let stickyHeight=0;
     for(const el of stickyCandidates){
       const style=getComputedStyle(el);
       if(style.position==="sticky" || style.position==="fixed"){
         stickyHeight=Math.max(stickyHeight,el.getBoundingClientRect().height);
       }
     }

     // Fallback based on current mobile/desktop header size.
     if(stickyHeight<40) stickyHeight=112;

     const extraGap=16;
     const targetTop=target.getBoundingClientRect().top + window.scrollY;
     const scrollTop=Math.max(0,targetTop-stickyHeight-extraGap);

     window.scrollTo({
       top:scrollTop,
       behavior:"smooth"
     });
   });
 });
}


function useCaseToActivityContext(useCase){
 const map={
   Study:"study",
   Work:"work",
   Relax:"relax",
   Focus:"focus",
   Sleep:"sleep"
 };
 return map[String(useCase||"")] || "";
}

function getActivityContextsFromText(text){
 return Object.keys(ACTIVITY_CONTEXT_GROUPS)
   .filter(group=>phraseHasActivityContext(text,group));
}

function inputContextsConflict(cluster,mainKeyword,useCase){
 const contexts=new Set([
   ...getActivityContextsFromText(cluster),
   ...getActivityContextsFromText(mainKeyword)
 ]);

 const selectedContext=useCaseToActivityContext(useCase);
 if(selectedContext) contexts.add(selectedContext);

 return INCOMPATIBLE_ACTIVITY_CONTEXTS.some(([a,b])=>
   contexts.has(a) && contexts.has(b)
 );
}


function scrollToVideoSeoInput(){
 requestAnimationFrame(()=>{
   requestAnimationFrame(()=>{
     const target=document.getElementById("videoSeoInput");
     if(!target) return;

     const stickyCandidates=[
       document.querySelector("header"),
       document.querySelector(".topbar"),
       document.querySelector(".app-header"),
       document.querySelector(".sticky"),
       document.querySelector('[style*="position:sticky"]')
     ].filter(Boolean);

     let stickyHeight=0;
     for(const el of stickyCandidates){
       const style=getComputedStyle(el);
       if(style.position==="sticky" || style.position==="fixed"){
         stickyHeight=Math.max(stickyHeight,el.getBoundingClientRect().height);
       }
     }

     if(stickyHeight<40) stickyHeight=112;

     const extraGap=16;
     const targetTop=target.getBoundingClientRect().top + window.scrollY;
     const scrollTop=Math.max(0,targetTop-stickyHeight-extraGap);

     window.scrollTo({
       top:scrollTop,
       behavior:"smooth"
     });
   });
 });
}

function generationContextWarning(){
 return "Cluster, Main Keyword, atau Use Case yang dipilih memiliki konteks yang saling bertentangan. Coba sesuaikan input yang konflik lalu generate kembali.";
}

async function run(mode="all"){
 try{
   const v=validate(); if(!v)return;
   if(inputContextsConflict(v.cluster,v.main,v.use)){
     showWarn(generationContextWarning());
     $("placeholder").style.display="block";
     $("output").style.display="none";
     scrollToVideoSeoInput();
     return;
   }
   $("placeholder").style.display="none";
   $("output").style.display="none";
   $("loading").style.display="block";

   const labels={
     all:"Regenerating all SEO data...",
     keywords:"Regenerating related keywords...",
     atmos:"Regenerating atmosphere / vibes...",
     titles:"Regenerating titles..."
   };
   $("loadingText").textContent=labels[mode]||"Generating...";

   await new Promise(r=>setTimeout(r,180));

   if(mode==="all"){
     generateKeywords(v);
     generateMoods(v);
     generateEmotions(v);
     generateAtmos(v);
     generateTitles(v);
   }
   else if(mode==="keywords"){
     // Regenerate keywords and everything that depends on keyword context.
     generateKeywords(v);
     generateMoods(v);
     generateEmotions(v);
     generateAtmos(v);
     generateTitles(v);
   }
   else if(mode==="atmos"){
     // Keep current keyword set, but regenerate atmosphere and dependent titles.
     if(!state.keywords.length){
       generateKeywords(v);
       generateMoods(v);
       generateEmotions(v);
     }
     generateAtmos(v);
     generateTitles(v);
   }
   else if(mode==="titles"){
     // Keep keywords & atmosphere; only rebuild title combinations.
     if(!state.keywords.length) generateKeywords(v);
     if(!state.moods.length) generateMoods(v);
     if(!state.emotions.length) generateEmotions(v);
     if(!state.atmos.length) generateAtmos(v);
     generateTitles(v);
   }

   if(!state.keywords.length) throw new Error(generationContextWarning());
   if(!state.titles.length) throw new Error(generationContextWarning());
   render(v);

   // Scroll only after the newly generated output has been mounted.
   scrollToKeywordAnalysis();
 }catch(err){
   console.error(err);
   const message=(err && err.message) ? err.message : "Terjadi kendala saat menghasilkan konten. Coba ubah Main Keyword atau Use Case lalu generate kembali.";
   showWarn(message);
   if(message===generationContextWarning()) scrollToVideoSeoInput();
   $("placeholder").style.display="block";
 }finally{
   $("loading").style.display="none";
 }
}

function safeFilenamePart(value){
 return String(value || "Untitled")
   .replace(/[\\/:*?"<>|]+/g," ")
   .replace(/\s+/g," ")
   .trim();
}
function formatDownloadDate(d){
 const y=d.getFullYear();
 const m=String(d.getMonth()+1).padStart(2,"0");
 const day=String(d.getDate()).padStart(2,"0");
 return `${y}-${m}-${day}`;
}
function xmlEscape(s){
 return String(s ?? "")
   .replace(/&/g,"&amp;")
   .replace(/</g,"&lt;")
   .replace(/>/g,"&gt;")
   .replace(/"/g,"&quot;")
   .replace(/'/g,"&apos;");
}
function crc32(bytes){
 let table=crc32.table;
 if(!table){
   table=crc32.table=new Uint32Array(256);
   for(let n=0;n<256;n++){
     let c=n;
     for(let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);
     table[n]=c>>>0;
   }
 }
 let crc=0xFFFFFFFF;
 for(const b of bytes) crc=table[(crc^b)&0xFF]^(crc>>>8);
 return (crc^0xFFFFFFFF)>>>0;
}
function u16(n){return [n&255,(n>>>8)&255]}
function u32(n){return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]}
function makeZip(files){
 const enc=new TextEncoder();
 let local=[], central=[], offset=0, count=0;
 const chunks=[];
 const now=new Date();
 const dosTime=((now.getHours()&31)<<11)|((now.getMinutes()&63)<<5)|((Math.floor(now.getSeconds()/2))&31);
 const dosDate=(((now.getFullYear()-1980)&127)<<9)|(((now.getMonth()+1)&15)<<5)|(now.getDate()&31);
 for(const file of files){
   const name=enc.encode(file.name);
   const data=typeof file.data==="string"?enc.encode(file.data):file.data;
   const crc=crc32(data);
   const lh=new Uint8Array([
     ...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(dosTime),...u16(dosDate),
     ...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0)
   ]);
   chunks.push(lh,name,data);
   const ch=new Uint8Array([
     ...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(dosTime),...u16(dosDate),
     ...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),
     ...u16(0),...u16(0),...u32(0),...u32(offset)
   ]);
   central.push(ch,name);
   offset += lh.length+name.length+data.length;
   count++;
 }
 let centralSize=0;
 central.forEach(c=>centralSize+=c.length);
 const end=new Uint8Array([
   ...u32(0x06054b50),...u16(0),...u16(0),...u16(count),...u16(count),
   ...u32(centralSize),...u32(offset),...u16(0)
 ]);
 const all=[...chunks,...central,end];
 const total=all.reduce((s,a)=>s+a.length,0);
 const out=new Uint8Array(total);
 let pos=0;
 for(const a of all){out.set(a,pos);pos+=a.length;}
 return out;
}
function exportSpreadsheet(){
 const v=validate();
 if(!v)return;
 if(!state.titles.length){
   showWarn("Generate the SEO results first, then export the spreadsheet.");
   return;
 }

 const meta=[v.main,...state.keywords].join(", ");
 const hashtags=[v.main,...state.keywords.slice(0,4)].map(hashtag).join(" ");
 const downloadDate=formatDownloadDate(new Date());

 const headers=[
   "No","Cluster","Main Keyword","Related Keyword","Mood / Scenario",
   "Atmosphere / Vibes","Video Title","Character Count","Meta Tag Keywords",
   "Description Hashtags","Status","Publish Date","Notes"
 ];

 const rows=state.titles.map((item,i)=>[
   i+1,
   v.cluster,
   v.main,
   state.keywords[i%state.keywords.length] || "",
   sentenceCase(state.moods[i%state.moods.length] || ""),
   state.atmos[i%state.atmos.length] || "",
   item.title,
   item.len,
   meta,
   hashtags,
   "Planned",
   "",
   ""
 ]);

 function colName(n){
   let s="";
   while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}
   return s;
 }
 function inlineCell(ref,val,style=0){
   if(typeof val==="number") return `<c r="${ref}" s="${style}"><v>${val}</v></c>`;
   return `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${xmlEscape(val)}</t></is></c>`;
 }
 const headerCells=headers.map((h,i)=>inlineCell(`${colName(i+1)}1`,h,1)).join("");
 const rowXml=rows.map((row,rIdx)=>{
   const r=rIdx+2;
   return `<row r="${r}">${row.map((v,cIdx)=>{
     const style=cIdx===10?2:0;
     return inlineCell(`${colName(cIdx+1)}${r}`,v,style);
   }).join("")}</row>`;
 }).join("");

 const sheetXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
 <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
   <sheetView workbookViewId="0">
    <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    <selection pane="bottomLeft" activeCell="A2" sqref="A2"/>
   </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
   <col min="1" max="1" width="6" customWidth="1"/>
   <col min="2" max="3" width="22" customWidth="1"/>
   <col min="4" max="6" width="24" customWidth="1"/>
   <col min="7" max="7" width="55" customWidth="1"/>
   <col min="8" max="8" width="15" customWidth="1"/>
   <col min="9" max="10" width="48" customWidth="1"/>
   <col min="11" max="11" width="18" customWidth="1"/>
   <col min="12" max="12" width="16" customWidth="1"/>
   <col min="13" max="13" width="30" customWidth="1"/>
  </cols>
  <sheetData>
   <row r="1" ht="24" customHeight="1">${headerCells}</row>
   ${rowXml}
  </sheetData>
  <autoFilter ref="A1:M${rows.length+1}"/>
  <conditionalFormatting sqref="K2:K${rows.length+1}">
   <cfRule type="expression" dxfId="0" priority="1"><formula>$K2=&quot;In Production&quot;</formula></cfRule>
   <cfRule type="expression" dxfId="1" priority="2"><formula>$K2=&quot;Scheduled&quot;</formula></cfRule>
   <cfRule type="expression" dxfId="2" priority="3"><formula>$K2=&quot;Published&quot;</formula></cfRule>
   <cfRule type="expression" dxfId="3" priority="4"><formula>$K2=&quot;Planned&quot;</formula></cfRule>
  </conditionalFormatting>
  <dataValidations count="1">
   <dataValidation type="list" allowBlank="1" showErrorMessage="1" errorStyle="stop" errorTitle="Invalid Status" error="Choose a status from the dropdown." sqref="K2:K${rows.length+1}">
    <formula1>&quot;Planned,In Production,Scheduled,Published&quot;</formula1>
   </dataValidation>
  </dataValidations>
 </worksheet>`;

 const stylesXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
 <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
   <font><sz val="10"/><name val="Calibri"/></font>
   <font><b/><color rgb="FFFFFFFF"/><sz val="10"/><name val="Calibri"/></font>
   <font><color rgb="FF000000"/><sz val="10"/><name val="Calibri"/></font>
  </fonts>
  <fills count="3">
   <fill><patternFill patternType="none"/></fill>
   <fill><patternFill patternType="gray125"/></fill>
   <fill><patternFill patternType="solid"><fgColor rgb="FF6C5CE7"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
   <border><left/><right/><top/><bottom/><diagonal/></border>
   <border>
    <left style="thin"><color rgb="FFD9DDE7"/></left>
    <right style="thin"><color rgb="FFD9DDE7"/></right>
    <top style="thin"><color rgb="FFD9DDE7"/></top>
    <bottom style="thin"><color rgb="FFD9DDE7"/></bottom>
    <diagonal/>
   </border>
  </borders>
  <cellStyleXfs count="1">
   <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="3">
   <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1">
    <alignment vertical="top" wrapText="1"/>
   </xf>
   <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyAlignment="1">
    <alignment horizontal="center" vertical="center" wrapText="1"/>
   </xf>
   <xf numFmtId="0" fontId="2" fillId="0" borderId="1" xfId="0" applyAlignment="1">
    <alignment vertical="top" wrapText="1"/>
   </xf>
  </cellXfs>
  <cellStyles count="1">
   <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
  <dxfs count="4">
   <dxf><font><b/><color rgb="FF800000"/></font></dxf>
   <dxf><font><b/><color rgb="FF0000FF"/></font></dxf>
   <dxf><font><b/><color rgb="FF008000"/></font></dxf>
   <dxf><font><color rgb="FF000000"/></font></dxf>
  </dxfs>
 </styleSheet>`;

 const workbookXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
 <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Cluster Plan" sheetId="1" r:id="rId1"/></sheets>
 </workbook>`;

 const workbookRels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
 <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
 </Relationships>`;

 const rootRels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
 <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
 </Relationships>`;

 const contentTypes=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
 <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
 </Types>`;


 const coreProps=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
 <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:dcmitype="http://purl.org/dc/dcmitype/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>CREATOR.CO - Music Video Title Generator</dc:creator>
  <cp:lastModifiedBy>CREATOR.CO - Music Video Title Generator</cp:lastModifiedBy>
 </cp:coreProperties>`;

 const appProps=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
 <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
  xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>CREATOR.CO - Music Video Title Generator</Application>
 </Properties>`;

 const files=[
   {name:"[Content_Types].xml",data:contentTypes},
   {name:"_rels/.rels",data:rootRels},
   {name:"xl/workbook.xml",data:workbookXml},
   {name:"xl/_rels/workbook.xml.rels",data:workbookRels},
   {name:"xl/styles.xml",data:stylesXml},
   {name:"xl/worksheets/sheet1.xml",data:sheetXml},
   {name:"docProps/core.xml",data:coreProps},
   {name:"docProps/app.xml",data:appProps}
 ];
 const bytes=makeZip(files);
 const blob=new Blob([bytes],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;
 a.download=`${safeFilenamePart(v.main)} cluster plan ${downloadDate}.xlsx`;
 a.style.display="none";
 document.body.appendChild(a);
 a.click();
 setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},500);
}



bindCleanTextInput("cluster");
bindCleanTextInput("mainKeyword");

document.querySelectorAll(".atmo-option").forEach(cb=>{
 cb.addEventListener("change",updateAtmosphereSelectionUI);
});
updateAtmosphereSelectionUI();

$("generate").onclick=()=>run("all");
$("regenKeywords").onclick=()=>run("keywords");
$("regenAtmosphere").onclick=()=>run("atmos");
$("regenTitles").onclick=()=>run("titles");
$("regenAll").onclick=()=>run("all");
$("reset").onclick=()=>{
 ["cluster","mainKeyword"].forEach(x=>$(x).value="");
 $("niche").value="";
 $("useCase").value="";
 document.querySelectorAll(".atmo-option").forEach(cb=>{cb.checked=false;cb.disabled=false;});
 updateAtmosphereSelectionUI();
 $("output").style.display="none";
 $("placeholder").style.display="block";
 $("warning").style.display="none";
 state={keywords:[],moods:[],atmos:[],emotions:[],titles:[],keywordSeed:0,atmosSeed:0};
};
function applyTheme(v){
 let t=v;if(v==="system")t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
 document.documentElement.setAttribute("data-theme",t);localStorage.setItem("creatorTheme",v)
}
$("themeSelect").value=localStorage.getItem("creatorTheme")||"system";applyTheme($("themeSelect").value);$("themeSelect").onchange=e=>applyTheme(e.target.value);

let deferredInstallPrompt=null;
const installBtn=$("installAppBtn");

window.addEventListener("beforeinstallprompt",(e)=>{
 e.preventDefault();
 deferredInstallPrompt=e;
 if(installBtn) installBtn.style.display="inline-block";
});

if(installBtn){
 installBtn.addEventListener("click",async()=>{
   if(!deferredInstallPrompt){
     showWarn("Install belum tersedia. Pastikan manifest.json, sw.js, dan icon PWA berhasil dimuat dari domain ini. Di iPhone/iPad gunakan Safari → Share → Add to Home Screen.");
     return;
   }
   deferredInstallPrompt.prompt();
   try{ await deferredInstallPrompt.userChoice; }catch(e){}
   deferredInstallPrompt=null;
   installBtn.style.display="none";
 });
}

window.addEventListener("appinstalled",()=>{
 deferredInstallPrompt=null;
 if(installBtn) installBtn.style.display="none";
});

if("serviceWorker" in navigator && (location.protocol==="https:" || location.hostname==="localhost" || location.hostname==="127.0.0.1")){
 window.addEventListener("load",()=>{
   navigator.serviceWorker.register("/sw.js").catch(err=>console.warn("Service worker registration failed:",err));
 });
}


(function(){
 const themeSelect=document.getElementById("themeSelect");
 if(!themeSelect)return;

 function applyTheme(mode){
   const root=document.documentElement;
   if(mode==="system"){
     const prefersDark=window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
     root.setAttribute("data-theme",prefersDark?"dark":"light");
   }else{
     root.setAttribute("data-theme",mode);
   }
 }

 themeSelect.addEventListener("change",()=>{
   const mode=themeSelect.value;
   try{localStorage.setItem("creatorCoTheme",mode);}catch(e){}
   applyTheme(mode);
 });

 let saved="system";
 try{saved=localStorage.getItem("creatorCoTheme")||"system";}catch(e){}
 if(["system","light","dark"].includes(saved)){
   themeSelect.value=saved;
   applyTheme(saved);
 }

 if(window.matchMedia){
   const mq=window.matchMedia("(prefers-color-scheme: dark)");
   const onSystemChange=()=>{
     if(themeSelect.value==="system") applyTheme("system");
   };
   if(mq.addEventListener) mq.addEventListener("change",onSystemChange);
   else if(mq.addListener) mq.addListener(onSystemChange);
 }
})();

