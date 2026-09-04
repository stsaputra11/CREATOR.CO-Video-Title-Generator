
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
 return (ACTIVITY_CONTEXT_GROUPS[groupName]||[]).some(term=>
   normalized.includes(" "+normalizeActivityContext(term)+" ")
 );
}
function useCaseToActivityContext(useCase){
 const map={Study:"study",Work:"work",Relax:"relax",Focus:"focus",Sleep:"sleep"};
 return map[String(useCase||"")] || "";
}
function getActivityContextsFromText(text){
 return Object.keys(ACTIVITY_CONTEXT_GROUPS).filter(group=>phraseHasActivityContext(text,group));
}
function inputContextsConflict(cluster,mainKeyword,useCase){
 const contexts=new Set([
   ...getActivityContextsFromText(cluster),
   ...getActivityContextsFromText(mainKeyword)
 ]);
 const selectedContext=useCaseToActivityContext(useCase);
 if(selectedContext) contexts.add(selectedContext);
 return INCOMPATIBLE_ACTIVITY_CONTEXTS.some(([a,b])=>contexts.has(a)&&contexts.has(b));
}

const cases=[
 ["sleep rain","focus music","Relax"],
 ["sleep rain","rain lofi","Focus"],
 ["rain lofi","deep focus music","Sleep"],
 ["sleep rain","sleep music","Sleep"],
 ["focus music","deep focus beats","Focus"],
 ["relaxing rain","calm focus music","Focus"]
];
for(const [cluster,main,use] of cases){
 console.log(cluster,"|",main,"|",use,"=>",inputContextsConflict(cluster,main,use));
}
