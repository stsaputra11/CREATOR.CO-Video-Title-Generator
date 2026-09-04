
const ACTIVITY_CONTEXT_GROUPS={
 sleep:["sleep","sleeping","deep sleep","fall asleep","bedtime"],
 focus:["focus","focused","deep focus","concentration","concentrate"],
 study:["study","studying","reading","writing"],
 work:["work","working","productivity","productive"]
};
const INCOMPATIBLE_ACTIVITY_CONTEXTS=[["sleep","focus"],["sleep","study"],["sleep","work"]];
function normalizeActivityContext(value){
 return String(value||"").normalize("NFKC").toLowerCase().replace(/[_–—-]+/g," ").replace(/\s+/g," ").trim();
}
function phraseHasActivityContext(text,groupName){
 const normalized=" "+normalizeActivityContext(text)+" ";
 return (ACTIVITY_CONTEXT_GROUPS[groupName]||[]).some(term=>normalized.includes(" "+normalizeActivityContext(term)+" "));
}
function useCaseToActivityContext(useCase){
 const map={Study:"study",Work:"work",Relax:"relax",Focus:"focus",Sleep:"sleep"};
 return map[String(useCase||"")] || "";
}
function mainKeywordConflictsWithUseCase(mainKeyword,useCase){
 const selectedContext=useCaseToActivityContext(useCase);
 if(!selectedContext) return false;
 const keywordContexts=Object.keys(ACTIVITY_CONTEXT_GROUPS).filter(group=>phraseHasActivityContext(mainKeyword,group));
 if(!keywordContexts.length) return false;
 return INCOMPATIBLE_ACTIVITY_CONTEXTS.some(([a,b])=>(
   (selectedContext===a && keywordContexts.includes(b)) ||
   (selectedContext===b && keywordContexts.includes(a))
 ));
}
const cases=[
 ["sleep rain lofi","Focus"],
 ["deep focus music","Sleep"],
 ["rain sleep lofi","Sleep"],
 ["deep focus music","Focus"],
 ["relaxing rain lofi","Focus"]
];
for(const [kw,use] of cases){
 console.log(kw,"|",use,"=>",mainKeywordConflictsWithUseCase(kw,use));
}
