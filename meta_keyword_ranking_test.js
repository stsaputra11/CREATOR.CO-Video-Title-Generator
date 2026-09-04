
function selectedNicheDisplayVariants(v){
 if(v.niche==="Lofi Hiphop / Lofi Chill / Lofi Beats / Chillbeats") return ["lofi hiphop","lofi chill","lofi beats","chillbeats"];
 if(v.niche==="Gentle Piano / Healing Piano / Calming Piano") return ["gentle piano","healing piano","calming piano"];
 return [String(v.niche||"").toLowerCase()];
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
   const phrase=metaPhrase(value);
   if(!phrase) return;

   // Require meaningful relation to Main Keyword, except the Main Keyword itself.
   const words=phrase.split(" ").filter(Boolean);
   const overlap=words.filter(w=>mainWords.includes(w)).length;
   if(phrase!==main && overlap===0) return;

   candidates.push({
     phrase,
     score:metaKeywordScore(phrase,mainKeyword,niche,useCase)+bonus
   });
 }

 // Main keyword must be present.
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
   add(`${main} ${String(useCase).toLowerCase()}`,18);
 }

 // Add niche variants independently from hashtag logic.
 try{
   const fakeV={niche:niche};
   const nicheVariants=selectedNicheDisplayVariants(fakeV)||[];
   nicheVariants.slice(0,3).forEach((variant,i)=>{
     add(`${main} ${variant}`,14-i*2);
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
   .sort((a,b)=>b.score-a.score);

 const result=[];
 if(mainItem) result.push(mainItem.phrase);
 result.push(...others.map(x=>x.phrase));

 return result.slice(0,10);
}

const tests=[
 {
  main:"tokyo rain lofi",
  rel:["rainy tokyo lofi","tokyo rain ambience","tokyo night lofi","lofi rain beats","tokyo chill beats"],
  niche:"Lofi Hiphop / Lofi Chill / Lofi Beats / Chillbeats",
  use:"Focus"
 },
 {
  main:"gentle piano",
  rel:["healing piano music","calming piano","gentle piano ambience","peaceful piano music","piano relaxation"],
  niche:"Gentle Piano / Healing Piano / Calming Piano",
  use:"Relax"
 }
];
for(const t of tests){
 console.log(buildMetaTagKeywords(t.main,t.rel,t.niche,t.use).join(", "));
}
