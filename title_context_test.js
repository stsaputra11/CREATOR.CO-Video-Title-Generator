
const ACTIVITY_CONTEXT_GROUPS={
 sleep:["sleep","sleeping","deep sleep","fall asleep","bedtime"],
 focus:["focus","focused","deep focus","concentration","concentrate"],
 study:["study","studying","reading","writing"],
 work:["work","working","productivity","productive"]
};
const INCOMPATIBLE_ACTIVITY_CONTEXTS=[["sleep","focus"],["sleep","study"],["sleep","work"]];
function normalizeActivityContext(value){
 return String(value||"").normalize("NFKC").toLowerCase()
   .replace(/[_–—-]+/g," ").replace(/\s+/g," ").trim();
}
function phraseHasActivityContext(text,groupName){
 const normalized=" "+normalizeActivityContext(text)+" ";
 return (ACTIVITY_CONTEXT_GROUPS[groupName]||[]).some(term=>normalized.includes(" "+normalizeActivityContext(term)+" "));
}
function hasOpposingActivityContexts(text){
 return INCOMPATIBLE_ACTIVITY_CONTEXTS.some(([a,b])=>phraseHasActivityContext(text,a)&&phraseHasActivityContext(text,b));
}
const titles=[
 "Rain sleep lofi | calm music for bedtime",
 "Rain sleep lofi | deep focus beats",
 "Tokyo study lofi | relaxing beats for focus",
 "Night work lofi | sleep ambience",
 "Relaxing rain lofi | focus beats"
];
for(const t of titles) console.log(t, hasOpposingActivityContexts(t));
